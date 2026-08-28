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
	fileName: string;
	recordedDate: string | null;
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

function parseRecordingDate(fileName: string) {
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

function scanVersions(
	directory: string,
	publicDirectory: string,
	baseUrl: string,
) {
	if (!existsSync(directory)) return [];

	return readdirSync(directory, { withFileTypes: true })
		.filter((entry) => entry.isFile() && /\.(m4a|mp3)$/i.test(entry.name))
		.map((entry) => {
			const parsedDate = parseRecordingDate(entry.name);
			return {
				fileName: entry.name,
				recordedDate: parsedDate?.label ?? null,
				sortKey: parsedDate?.sortKey ?? null,
				url: publicUrl(
					baseUrl,
					publicDirectory,
					encodeURIComponent(entry.name),
				),
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
		.map(({ sortKey: _sortKey, ...version }) => version);
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
