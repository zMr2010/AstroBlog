import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import catalog from "../data/jay-chou-music.json";

export interface MusicTrackSource {
	title: string;
	slug: string;
	note?: string;
}

export interface MusicAlbumSource {
	title: string;
	englishTitle: string;
	slug: string;
	releaseDate: string;
	kind: string;
	appleCollectionId: number;
	appleCountry: string;
	sourceUrl: string;
	tracks: MusicTrackSource[];
}

export interface MusicVersion {
	number: number;
	fileName: string;
	url: string;
}

export interface MusicTrack extends MusicTrackSource {
	directory: string;
	lyricsMetaUrl: string;
	lyricsUrls: string[];
	versions: MusicVersion[];
}

export interface MusicAlbum extends Omit<MusicAlbumSource, "tracks"> {
	cover: string;
	coverProvider: "Apple Music";
	coverSourceUrl: string;
	directory: string;
	year: string;
	availableSongCount: number;
	recordingCount: number;
	tracks: MusicTrack[];
}

function publicUrl(baseUrl: string, ...parts: string[]) {
	return [baseUrl, ...parts]
		.join("/")
		.replace(/\/{2,}/g, "/")
		.replace(/^(?!\/)/, "/");
}

function scanVersions(
	directory: string,
	publicDirectory: string,
	baseUrl: string,
) {
	if (!existsSync(directory)) return [];

	return readdirSync(directory, { withFileTypes: true })
		.filter((entry) => entry.isFile() && /^\d+\.mp3$/i.test(entry.name))
		.map((entry) => ({
			number: Number.parseInt(entry.name, 10),
			fileName: entry.name,
			url: publicUrl(baseUrl, publicDirectory, entry.name),
		}))
		.sort((left, right) => left.number - right.number);
}

export function buildMusicLibrary(publicRoot: string, baseUrl: string) {
	return (catalog as MusicAlbumSource[]).map((album): MusicAlbum => {
		const albumDirectory = `music/${album.slug}`;
		const tracks = album.tracks.map((track): MusicTrack => {
			const trackDirectory = `${albumDirectory}/${track.slug}`;
			const absoluteTrackDirectory = join(
				publicRoot,
				"music",
				album.slug,
				track.slug,
			);

			return {
				...track,
				directory: `/public/${trackDirectory}`,
				lyricsMetaUrl: publicUrl(baseUrl, trackDirectory, "lyrics.meta.json"),
				lyricsUrls: [
					publicUrl(baseUrl, trackDirectory, "lyrics.lrc"),
					publicUrl(baseUrl, trackDirectory, "lyrics.txt"),
				],
				versions: scanVersions(absoluteTrackDirectory, trackDirectory, baseUrl),
			};
		});

		return {
			...album,
			cover: publicUrl(baseUrl, albumDirectory, "cover.jpg"),
			coverProvider: "Apple Music",
			coverSourceUrl: `https://music.apple.com/${album.appleCountry.toLowerCase()}/album/${album.appleCollectionId}`,
			directory: `/public/${albumDirectory}`,
			year: album.releaseDate.slice(0, 4),
			availableSongCount: tracks.filter((track) => track.versions.length > 0)
				.length,
			recordingCount: tracks.reduce(
				(total, track) => total + track.versions.length,
				0,
			),
			tracks,
		};
	});
}
