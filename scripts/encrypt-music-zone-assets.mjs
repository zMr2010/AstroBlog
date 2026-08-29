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
	readdirSync,
	readFileSync,
	renameSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { extname, isAbsolute, relative, resolve, sep } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const sourceRoot = resolve(projectRoot, "music-zone-source");
const catalogPath = resolve(projectRoot, "src", "data", "jay-chou-music.json");
const publicRoot = resolve(projectRoot, "public", "music-zone");
const outputRoot = resolve(publicRoot, "encrypted");
const temporaryOutputRoot = resolve(
	publicRoot,
	`.encrypted-build-${process.pid}`,
);
const payloadRoot = resolve(projectRoot, "src", "generated");
const payloadPath = resolve(payloadRoot, "music-zone-payload.json");
const temporaryPayloadPath = resolve(
	payloadRoot,
	`.music-zone-payload-${process.pid}.json`,
);
const envPath = resolve(projectRoot, ".env");
const iterations = 310_000;

if (
	!process.env.MUSIC_ZONE_PASSWORD &&
	existsSync(envPath) &&
	process.loadEnvFile
) {
	process.loadEnvFile(envPath);
}

const password = process.env.MUSIC_ZONE_PASSWORD;
if (!password) {
	throw new Error(
		"MUSIC_ZONE_PASSWORD is required. Add it to .env before regenerating Music ciphertext.",
	);
}

function assertInside(parent, candidate) {
	const pathFromParent = relative(parent, candidate);
	if (
		isAbsolute(pathFromParent) ||
		pathFromParent === ".." ||
		pathFromParent.startsWith(`..${sep}`)
	) {
		throw new Error(
			`Refusing to access a path outside ${parent}: ${candidate}`,
		);
	}
}

assertInside(projectRoot, sourceRoot);
assertInside(projectRoot, catalogPath);
assertInside(publicRoot, outputRoot);
assertInside(publicRoot, temporaryOutputRoot);
assertInside(projectRoot, payloadPath);
assertInside(payloadRoot, temporaryPayloadPath);

const mimeTypes = new Map([
	[".jpeg", "image/jpeg"],
	[".jpg", "image/jpeg"],
	[".png", "image/png"],
	[".webp", "image/webp"],
	[".m4a", "audio/mp4"],
	[".mp3", "audio/mpeg"],
]);

function parseRecordingDate(fileName) {
	const stem = fileName.replace(/\.[^.]+$/, "");
	const compactDate = stem.match(/(?:^|_)((?:19|20)\d{2})(\d{2})(\d{2})$/);
	const separatedDate = stem.match(
		/(?:^|_)((?:19|20)\d{2})[-._年](\d{1,2})[-._月](\d{1,2})日?$/,
	);
	const match = compactDate ?? separatedDate;
	if (!match) return null;

	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);
	const date = new Date(Date.UTC(year, month - 1, day));
	if (
		date.getUTCFullYear() !== year ||
		date.getUTCMonth() !== month - 1 ||
		date.getUTCDate() !== day
	) {
		return null;
	}

	return {
		label: `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}`,
		sortKey: year * 10_000 + month * 100 + day,
	};
}

function logicalPath(...parts) {
	const value = parts.join("/").replaceAll("\\", "/");
	if (
		value.startsWith("/") ||
		value.split("/").includes("..") ||
		/^(?:[a-z]+:)?\/\//i.test(value)
	) {
		throw new Error(
			`Music assets must stay inside music-zone-source: ${value}`,
		);
	}
	return value;
}

function readOptionalLyrics(trackDirectory) {
	let content = "";
	let format = "";
	for (const fileName of ["lyrics.lrc", "lyrics.txt"]) {
		const filePath = resolve(trackDirectory, fileName);
		assertInside(sourceRoot, filePath);
		if (!existsSync(filePath)) continue;
		content = readFileSync(filePath, "utf8");
		format = extname(fileName).slice(1).toLowerCase();
		break;
	}

	const metadataPath = resolve(trackDirectory, "lyrics.meta.json");
	assertInside(sourceRoot, metadataPath);
	let metadata;
	if (existsSync(metadataPath)) {
		metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
		if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
			throw new Error(`Lyrics metadata must be an object: ${metadataPath}`);
		}
	}

	return { content, format, metadata };
}

if (!existsSync(sourceRoot)) {
	throw new Error(
		`Music plaintext source directory does not exist: ${sourceRoot}`,
	);
}
if (!existsSync(catalogPath)) {
	throw new Error(`Music catalog does not exist: ${catalogPath}`);
}

const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
if (!Array.isArray(catalog)) throw new Error("Music catalog must be an array.");

const referencedAssetPaths = new Set();
const configuredTrackDirectories = new Set();
const scannedAlbums = catalog.map((album) => {
	const albumDirectory = resolve(sourceRoot, album.slug);
	assertInside(sourceRoot, albumDirectory);
	const coverLogicalPath = logicalPath(album.slug, "cover.jpg");
	const coverPath = resolve(sourceRoot, ...coverLogicalPath.split("/"));
	assertInside(sourceRoot, coverPath);
	if (!existsSync(coverPath)) {
		throw new Error(`Album cover is missing: ${coverLogicalPath}`);
	}
	referencedAssetPaths.add(coverLogicalPath);

	const tracks = album.tracks.map((track) => {
		const trackDirectory = resolve(albumDirectory, track.slug);
		assertInside(sourceRoot, trackDirectory);
		configuredTrackDirectories.add(logicalPath(album.slug, track.slug));
		const versions = existsSync(trackDirectory)
			? readdirSync(trackDirectory, { withFileTypes: true })
					.filter((entry) => entry.isFile() && /\.(m4a|mp3)$/i.test(entry.name))
					.map((entry) => {
						const parsedDate = parseRecordingDate(entry.name);
						const assetLogicalPath = logicalPath(
							album.slug,
							track.slug,
							entry.name,
						);
						referencedAssetPaths.add(assetLogicalPath);
						return {
							fileName: entry.name,
							recordedDate: parsedDate?.label ?? null,
							sortKey: parsedDate?.sortKey ?? null,
							assetLogicalPath,
						};
					})
					.sort((left, right) => {
						if (left.sortKey === null && right.sortKey !== null) return 1;
						if (left.sortKey !== null && right.sortKey === null) return -1;
						if (left.sortKey !== right.sortKey) {
							return (left.sortKey ?? 0) - (right.sortKey ?? 0);
						}
						return left.fileName.localeCompare(right.fileName, "zh-CN", {
							numeric: true,
							sensitivity: "base",
						});
					})
			: [];
		const lyrics = readOptionalLyrics(trackDirectory);
		return {
			...track,
			directory: `/music-zone-source/${album.slug}/${track.slug}`,
			lyricsContent: lyrics.content,
			lyricsFormat: lyrics.format,
			lyricsMetadata: lyrics.metadata,
			versions,
		};
	});

	return {
		...album,
		coverLogicalPath,
		coverProvider: "Apple Music",
		coverSourceUrl: `https://music.apple.com/${String(album.appleCountry).toLowerCase()}/album/${album.appleCollectionId}`,
		directory: `/music-zone-source/${album.slug}`,
		year: String(album.releaseDate).slice(0, 4),
		availableSongCount: tracks.filter((track) => track.versions.length > 0)
			.length,
		recordingCount: tracks.reduce(
			(total, track) => total + track.versions.length,
			0,
		),
		tracks,
	};
});

function validateRecordingLocations(directory) {
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const entryPath = resolve(directory, entry.name);
		assertInside(sourceRoot, entryPath);
		if (entry.isDirectory()) {
			validateRecordingLocations(entryPath);
			continue;
		}
		if (!entry.isFile() || !/\.(m4a|mp3)$/i.test(entry.name)) continue;
		const sourceRelativePath = relative(sourceRoot, entryPath);
		const parts = sourceRelativePath.split(sep);
		const configuredDirectory = logicalPath(parts[0] ?? "", parts[1] ?? "");
		if (
			parts.length !== 3 ||
			!configuredTrackDirectories.has(configuredDirectory)
		) {
			throw new Error(
				`Recording is outside a configured album/song folder: ${sourceRelativePath}`,
			);
		}
	}
}

validateRecordingLocations(sourceRoot);

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
			"The existing Music payload cannot be unlocked with MUSIC_ZONE_PASSWORD. Password rotation is intentionally blocked.",
			{ cause: error },
		);
	}
}

const key = pbkdf2Sync(passwordMaterial, salt, iterations, 32, "sha256");
const existingAssets = new Map();
for (const album of existingContent?.albums ?? []) {
	if (album.coverAsset) {
		existingAssets.set(album.coverAsset.encryptedSrc, album.coverAsset);
	}
	for (const track of album.tracks ?? []) {
		for (const version of track.versions ?? []) {
			if (version.asset) {
				existingAssets.set(version.asset.encryptedSrc, version.asset);
			}
		}
	}
}

const assets = {};
let plaintextBytes = 0;
let reusedAssets = 0;

function isReusableCiphertext(asset, ciphertextPath, expectedPlaintext) {
	try {
		if (
			!asset ||
			asset.size !== expectedPlaintext.byteLength ||
			asset.digest !==
				createHash("sha256").update(expectedPlaintext).digest("hex")
		) {
			return false;
		}
		const ciphertext = readFileSync(ciphertextPath);
		if (ciphertext.byteLength !== asset.size + 16) return false;
		const decipher = createDecipheriv(
			"aes-256-gcm",
			key,
			Buffer.from(asset.iv, "base64"),
		);
		decipher.setAAD(Buffer.from(asset.aad, "base64"));
		decipher.setAuthTag(ciphertext.subarray(ciphertext.length - 16));
		const decrypted = Buffer.concat([
			decipher.update(ciphertext.subarray(0, -16)),
			decipher.final(),
		]);
		return (
			decrypted.byteLength === expectedPlaintext.byteLength &&
			createHash("sha256").update(decrypted).digest("hex") === asset.digest
		);
	} catch {
		return false;
	}
}

rmSync(temporaryOutputRoot, { recursive: true, force: true });
rmSync(temporaryPayloadPath, { force: true });
mkdirSync(temporaryOutputRoot, { recursive: true });
mkdirSync(payloadRoot, { recursive: true });

try {
	for (const assetLogicalPath of [...referencedAssetPaths].sort((left, right) =>
		left.localeCompare(right, "en"),
	)) {
		const sourcePath = resolve(sourceRoot, ...assetLogicalPath.split("/"));
		assertInside(sourceRoot, sourcePath);
		if (!existsSync(sourcePath)) {
			throw new Error(`Music asset is missing: ${assetLogicalPath}`);
		}
		const extension = extname(sourcePath).toLowerCase();
		const mime = mimeTypes.get(extension);
		if (!mime)
			throw new Error(`Unsupported Music media type: ${assetLogicalPath}`);

		const plaintext = readFileSync(sourcePath);
		const digest = createHash("sha256").update(plaintext).digest("hex");
		const assetId = createHmac("sha256", key)
			.update(assetLogicalPath, "utf8")
			.update("\u0000")
			.update(digest, "utf8")
			.digest("hex");
		const outputName = `${assetId}.pze`;
		const encryptedSrc = `/music-zone/encrypted/${outputName}`;
		const existingAsset = existingAssets.get(encryptedSrc);
		const existingCiphertextPath = resolve(outputRoot, outputName);
		if (
			existingAsset?.digest === digest &&
			existsSync(existingCiphertextPath) &&
			isReusableCiphertext(existingAsset, existingCiphertextPath, plaintext)
		) {
			copyFileSync(
				existingCiphertextPath,
				resolve(temporaryOutputRoot, outputName),
			);
			assets[assetLogicalPath] = existingAsset;
			plaintextBytes += plaintext.byteLength;
			reusedAssets += 1;
			continue;
		}

		const iv = randomBytes(12);
		const additionalData = Buffer.from(
			`music-zone-asset-v1\u0000${assetLogicalPath}\u0000${mime}\u0000${plaintext.byteLength}\u0000${digest}`,
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
		assets[assetLogicalPath] = {
			encryptedSrc,
			iv: iv.toString("base64"),
			aad: additionalData.toString("base64"),
			mime,
			size: plaintext.byteLength,
			digest,
		};
		plaintextBytes += plaintext.byteLength;
	}
	for (const assetLogicalPath of referencedAssetPaths) {
		const asset = assets[assetLogicalPath];
		const sourcePath = resolve(sourceRoot, ...assetLogicalPath.split("/"));
		const ciphertextPath = resolve(
			temporaryOutputRoot,
			asset.encryptedSrc.split("/").at(-1),
		);
		if (
			!isReusableCiphertext(asset, ciphertextPath, readFileSync(sourcePath))
		) {
			throw new Error(
				`Encrypted Music asset failed verification: ${assetLogicalPath}`,
			);
		}
	}

	const albums = scannedAlbums.map(
		({ coverLogicalPath, tracks, ...album }) => ({
			...album,
			coverAsset: assets[coverLogicalPath],
			tracks: tracks.map(({ versions, ...track }) => ({
				...track,
				versions: versions.map(
					({ sortKey: _sortKey, assetLogicalPath, ...version }) => ({
						...version,
						asset: assets[assetLogicalPath],
					}),
				),
			})),
		}),
	);
	const privateContent = { albums };
	const contentIv = randomBytes(12);
	const contentAad = Buffer.from("music-zone-content-v1", "utf8");
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
	const verificationCiphertext = Buffer.from(payload.ciphertext, "base64");
	const verificationDecipher = createDecipheriv(
		"aes-256-gcm",
		key,
		Buffer.from(payload.iv, "base64"),
	);
	verificationDecipher.setAAD(Buffer.from(payload.aad, "base64"));
	verificationDecipher.setAuthTag(
		verificationCiphertext.subarray(verificationCiphertext.length - 16),
	);
	const verifiedContent = Buffer.concat([
		verificationDecipher.update(verificationCiphertext.subarray(0, -16)),
		verificationDecipher.final(),
	]);
	if (!verifiedContent.equals(contentPlaintext)) {
		throw new Error("Encrypted Music catalog failed verification.");
	}
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
	`Prepared ${Object.keys(assets).length} Music assets (${reusedAssets} unchanged, ${Object.keys(assets).length - reusedAssets} encrypted; ${plaintextBytes} plaintext bytes -> ${encryptedBytes} encrypted bytes) and generated the encrypted catalog payload.`,
);
