import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = join(projectRoot, "src", "data", "jay-chou-music.json");
const musicRoot = join(projectRoot, "music-zone-source");
const albums = JSON.parse(await readFile(catalogPath, "utf8"));

let trackCount = 0;
for (const album of albums) {
	for (const track of album.tracks) {
		const trackDirectory = join(musicRoot, album.slug, track.slug);
		await mkdir(trackDirectory, { recursive: true });
		await writeFile(join(trackDirectory, ".gitkeep"), "");
		trackCount += 1;
	}
}

console.log(
	`Prepared ${albums.length} album folders and ${trackCount} song folders.`,
);
