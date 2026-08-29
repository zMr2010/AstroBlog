import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = join(projectRoot, "src", "data", "jay-chou-music.json");
const musicRoot = join(projectRoot, "music-zone-source");
const albums = JSON.parse(await readFile(catalogPath, "utf8"));

console.warn(
	"Downloading Apple Music artwork for local preview. Confirm publication rights or replace the files before public deployment.",
);

const wait = (milliseconds) =>
	new Promise((resolve) => setTimeout(resolve, milliseconds));

for (const album of albums) {
	const lookupUrl = new URL("https://itunes.apple.com/lookup");
	lookupUrl.searchParams.set("id", String(album.appleCollectionId));
	lookupUrl.searchParams.set("country", album.appleCountry || "TW");

	const lookupResponse = await fetch(lookupUrl, {
		headers: { "User-Agent": "XianRui-Music-Library/1.0" },
	});
	if (!lookupResponse.ok) {
		throw new Error(
			`Album lookup failed for ${album.slug}: ${lookupResponse.status}`,
		);
	}

	const lookup = await lookupResponse.json();
	const collection = lookup.results.find(
		(result) => result.wrapperType === "collection",
	);
	if (!collection?.artworkUrl100) {
		throw new Error(`No cover artwork returned for ${album.slug}`);
	}

	const artworkUrl = collection.artworkUrl100.replace(
		/\/100x100bb\.(jpg|png)$/i,
		"/800x800bb.jpg",
	);
	const artworkResponse = await fetch(artworkUrl, {
		headers: { "User-Agent": "XianRui-Music-Library/1.0" },
	});
	if (!artworkResponse.ok) {
		throw new Error(
			`Cover download failed for ${album.slug}: ${artworkResponse.status}`,
		);
	}

	const albumDirectory = join(musicRoot, album.slug);
	await mkdir(albumDirectory, { recursive: true });
	await writeFile(
		join(albumDirectory, "cover.jpg"),
		Buffer.from(await artworkResponse.arrayBuffer()),
	);
	console.log(`Downloaded ${album.slug}/cover.jpg`);
	await wait(120);
}
