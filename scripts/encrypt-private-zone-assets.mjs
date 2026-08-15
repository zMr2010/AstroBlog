import {
	createCipheriv,
	createDecipheriv,
	createHash,
	createHmac,
	pbkdf2Sync,
	randomBytes,
} from "node:crypto";
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readFileSync,
	renameSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { extname, isAbsolute, relative, resolve, sep } from "node:path";
import { parse } from "yaml";

const projectRoot = resolve(import.meta.dirname, "..");
const sourceRoot = resolve(projectRoot, "private-zone-source");
const sourceConfigPath = resolve(sourceRoot, "private-zone.yml");
const publicRoot = resolve(projectRoot, "public", "private-zone");
const outputRoot = resolve(publicRoot, "encrypted");
const temporaryOutputRoot = resolve(
	publicRoot,
	`.encrypted-build-${process.pid}`,
);
const payloadRoot = resolve(projectRoot, "src", "generated");
const payloadPath = resolve(payloadRoot, "private-zone-payload.json");
const temporaryPayloadPath = resolve(
	payloadRoot,
	`.private-zone-payload-${process.pid}.json`,
);
const envPath = resolve(projectRoot, ".env");
const iterations = 310_000;

if (
	!process.env.PRIVATE_ZONE_PASSWORD &&
	existsSync(envPath) &&
	process.loadEnvFile
) {
	process.loadEnvFile(envPath);
}

const password = process.env.PRIVATE_ZONE_PASSWORD;
if (!password) {
	throw new Error(
		"PRIVATE_ZONE_PASSWORD is required. Add it to .env before regenerating Private Zone ciphertext.",
	);
}

function assertInside(parent, candidate) {
	const pathFromParent = relative(parent, candidate);
	if (
		isAbsolute(pathFromParent) ||
		pathFromParent === ".." ||
		pathFromParent.startsWith(`..${sep}`)
	) {
		throw new Error(`Refusing to write outside ${parent}: ${candidate}`);
	}
}

assertInside(projectRoot, sourceRoot);
assertInside(publicRoot, outputRoot);
assertInside(publicRoot, temporaryOutputRoot);
assertInside(projectRoot, payloadPath);
assertInside(payloadRoot, temporaryPayloadPath);

const mimeTypes = new Map([
	[".avif", "image/avif"],
	[".gif", "image/gif"],
	[".jpeg", "image/jpeg"],
	[".jpg", "image/jpeg"],
	[".png", "image/png"],
	[".svg", "image/svg+xml"],
	[".webp", "image/webp"],
	[".aac", "audio/aac"],
	[".flac", "audio/flac"],
	[".m4a", "audio/mp4"],
	[".mp3", "audio/mpeg"],
	[".oga", "audio/ogg"],
	[".ogg", "audio/ogg"],
	[".wav", "audio/wav"],
]);

function text(value) {
	return typeof value === "string" || typeof value === "number"
		? String(value).trim()
		: "";
}

function dateText(value) {
	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		return value.toISOString().slice(0, 10);
	}
	return text(value);
}

function dateTimestamp(value) {
	const timestamp = Date.parse(value);
	return Number.isNaN(timestamp) ? 0 : timestamp;
}

if (!existsSync(sourceConfigPath)) {
	throw new Error(
		`Private Zone source config does not exist: ${sourceConfigPath}`,
	);
}

const sourceConfig = parse(readFileSync(sourceConfigPath, "utf8")) ?? {};
function logicalAssetPath(value, folder) {
	const configuredPath = text(value).replaceAll("\\", "/").replace(/^\.\//, "");
	if (!configuredPath) return undefined;
	if (
		/^(?:[a-z]+:)?\/\//i.test(configuredPath) ||
		configuredPath.startsWith("/") ||
		configuredPath.split("/").includes("..")
	) {
		throw new Error(
			`Private Zone assets must stay inside private-zone-source: ${configuredPath}`,
		);
	}
	return `${folder}/${configuredPath}`;
}

const configuredGallery = Array.isArray(sourceConfig.gallery)
	? sourceConfig.gallery
	: [];
const configuredMusic = Array.isArray(sourceConfig.music)
	? sourceConfig.music
	: [];
const referencedAssetPaths = new Set(
	[
		...configuredGallery.map((item) => logicalAssetPath(item?.image, "images")),
		...configuredMusic.map((track) => logicalAssetPath(track?.file, "music")),
	].filter(Boolean),
);

const passwordMaterial = createHash("sha256").update(password, "utf8").digest();
let salt = randomBytes(16);
let existingContent;
if (existsSync(payloadPath)) {
	try {
		const existingPayload = JSON.parse(readFileSync(payloadPath, "utf8"));
		salt = Buffer.from(existingPayload.salt, "base64");
		const existingKey = pbkdf2Sync(
			passwordMaterial,
			salt,
			existingPayload.iterations,
			32,
			"sha256",
		);
		const encryptedContent = Buffer.from(existingPayload.ciphertext, "base64");
		const decipher = createDecipheriv(
			"aes-256-gcm",
			existingKey,
			Buffer.from(existingPayload.iv, "base64"),
		);
		decipher.setAAD(Buffer.from(existingPayload.aad, "base64"));
		decipher.setAuthTag(
			encryptedContent.subarray(encryptedContent.length - 16),
		);
		existingContent = JSON.parse(
			Buffer.concat([
				decipher.update(encryptedContent.subarray(0, -16)),
				decipher.final(),
			]).toString("utf8"),
		);
	} catch (error) {
		throw new Error(
			"The existing Private Zone payload cannot be unlocked with PRIVATE_ZONE_PASSWORD. Password rotation is intentionally blocked.",
			{ cause: error },
		);
	}
}
const key = pbkdf2Sync(passwordMaterial, salt, iterations, 32, "sha256");
const existingAssets = new Map(
	[
		...(existingContent?.gallery ?? []).map((item) => item.asset),
		...(existingContent?.music ?? []).map((track) => track.asset),
	].map((asset) => [asset.encryptedSrc, asset]),
);
const assets = {};
let plaintextBytes = 0;
let reusedAssets = 0;

rmSync(temporaryOutputRoot, { recursive: true, force: true });
rmSync(temporaryPayloadPath, { force: true });
mkdirSync(temporaryOutputRoot, { recursive: true });
mkdirSync(payloadRoot, { recursive: true });

try {
	for (const logicalPath of [...referencedAssetPaths].sort((left, right) =>
		left.localeCompare(right, "en"),
	)) {
		const sourcePath = resolve(sourceRoot, ...logicalPath.split("/"));
		assertInside(sourceRoot, sourcePath);
		if (!existsSync(sourcePath))
			throw new Error(
				`Configured Private Zone asset is missing: ${logicalPath}`,
			);
		const extension = extname(sourcePath).toLowerCase();
		const mime = mimeTypes.get(extension);
		if (!mime)
			throw new Error(`Unsupported Private Zone media type: ${logicalPath}`);

		const plaintext = readFileSync(sourcePath);
		const digest = createHash("sha256").update(plaintext).digest("hex");
		const assetId = createHmac("sha256", key)
			.update(logicalPath, "utf8")
			.update("\u0000")
			.update(digest, "utf8")
			.digest("hex");
		const outputName = `${assetId}.pze`;
		const encryptedSrc = `/private-zone/encrypted/${outputName}`;
		const existingAsset = existingAssets.get(encryptedSrc);
		const existingCiphertextPath = resolve(outputRoot, outputName);
		if (
			existingAsset?.digest === digest &&
			existsSync(existingCiphertextPath)
		) {
			copyFileSync(
				existingCiphertextPath,
				resolve(temporaryOutputRoot, outputName),
			);
			assets[logicalPath] = existingAsset;
			plaintextBytes += plaintext.byteLength;
			reusedAssets += 1;
			continue;
		}
		const iv = randomBytes(12);
		const additionalData = Buffer.from(
			`private-zone-asset-v1\u0000${logicalPath}\u0000${mime}\u0000${plaintext.byteLength}\u0000${digest}`,
			"utf8",
		);
		const cipher = createCipheriv("aes-256-gcm", key, iv);
		cipher.setAAD(additionalData);
		const ciphertext = Buffer.concat([
			cipher.update(plaintext),
			cipher.final(),
			cipher.getAuthTag(),
		]);
		writeFileSync(resolve(temporaryOutputRoot, outputName), ciphertext, {
			flag: "wx",
		});
		assets[logicalPath] = {
			encryptedSrc,
			iv: iv.toString("base64"),
			aad: additionalData.toString("base64"),
			mime,
			size: plaintext.byteLength,
			digest,
		};
		plaintextBytes += plaintext.byteLength;
	}

	const encryptedAsset = (value, folder) => {
		const logicalPath = logicalAssetPath(value, folder);
		if (!logicalPath) return undefined;
		const asset = assets[logicalPath];
		if (!asset)
			throw new Error(
				`Configured Private Zone asset is missing: ${logicalPath}`,
			);
		return asset;
	};
	const gallery = configuredGallery
		.map((item, index) => {
			const date = dateText(item?.date);
			const width = Number(item?.width);
			const height = Number(item?.height);
			return {
				index,
				asset: encryptedAsset(item?.image, "images"),
				date,
				alt: text(item?.alt) || date || "Private Zone photo",
				hoverCaption: text(item?.hover),
				clickCaption: text(item?.click),
				ratio: width > 0 && height > 0 ? width / height : undefined,
			};
		})
		.filter((item) => item.asset)
		.sort(
			(left, right) =>
				dateTimestamp(right.date) - dateTimestamp(left.date) ||
				left.index - right.index,
		)
		.map(({ index: _index, ...item }) => item);
	const music = configuredMusic
		.map((track, index) => ({
			asset: encryptedAsset(track?.file, "music"),
			title: text(track?.title) || `Track ${index + 1}`,
			artist: text(track?.artist),
		}))
		.filter((track) => track.asset);
	const privateContent = {
		intro: text(sourceConfig.intro) || "P.Z. 是 Private Zone 的缩写。",
		gallery,
		music,
	};

	const contentIv = randomBytes(12);
	const contentAad = Buffer.from("private-zone-content-v1", "utf8");
	const contentCipher = createCipheriv("aes-256-gcm", key, contentIv);
	contentCipher.setAAD(contentAad);
	const contentPlaintext = Buffer.from(JSON.stringify(privateContent), "utf8");
	const contentCiphertext = Buffer.concat([
		contentCipher.update(contentPlaintext),
		contentCipher.final(),
		contentCipher.getAuthTag(),
	]);
	const payload = {
		version: 1,
		iterations,
		salt: salt.toString("base64"),
		iv: contentIv.toString("base64"),
		aad: contentAad.toString("base64"),
		ciphertext: contentCiphertext.toString("base64"),
	};
	writeFileSync(temporaryPayloadPath, `${JSON.stringify(payload, null, 2)}\n`, {
		flag: "wx",
	});

	rmSync(outputRoot, { recursive: true, force: true });
	renameSync(temporaryOutputRoot, outputRoot);
	rmSync(payloadPath, { force: true });
	renameSync(temporaryPayloadPath, payloadPath);
} catch (error) {
	rmSync(temporaryOutputRoot, { recursive: true, force: true });
	rmSync(temporaryPayloadPath, { force: true });
	throw error;
}

const encryptedBytes = Object.values(assets).reduce(
	(total, asset) =>
		total +
		statSync(resolve(projectRoot, "public", asset.encryptedSrc.slice(1))).size,
	0,
);
console.log(
	`Prepared ${Object.keys(assets).length} Private Zone assets (${reusedAssets} unchanged, ${Object.keys(assets).length - reusedAssets} encrypted; ${plaintextBytes} plaintext bytes -> ${encryptedBytes} encrypted bytes) and generated the encrypted content payload.`,
);
