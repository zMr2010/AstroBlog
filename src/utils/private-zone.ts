import privateZoneYaml from "../content/private-zone.yml";
import { url } from "./url-utils";

type RawGalleryItem = {
	image?: unknown;
	date?: unknown;
	alt?: unknown;
	hover?: unknown;
	click?: unknown;
	width?: unknown;
	height?: unknown;
};

type RawMusicTrack = {
	file?: unknown;
	title?: unknown;
	artist?: unknown;
};

type RawPrivateZoneConfig = {
	intro?: unknown;
	gallery?: unknown;
	music?: unknown;
};

export type PrivateZoneGalleryItem = {
	src: string;
	date: string;
	alt: string;
	hoverCaption: string;
	clickCaption: string;
	ratio?: number;
};

export type PrivateZoneMusicTrack = {
	src: string;
	title: string;
	artist: string;
};

function text(value: unknown): string {
	return typeof value === "string" || typeof value === "number"
		? String(value).trim()
		: "";
}

function assetUrl(value: unknown, folder: "images" | "music"): string {
	const path = text(value).replaceAll("\\", "/");
	if (!path) return "";
	if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith("data:")) return path;
	if (path.startsWith("/")) return url(path);
	return url(`/private-zone/${folder}/${path.replace(/^\.\//, "")}`);
}

function dateText(value: unknown): string {
	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		return value.toISOString().slice(0, 10);
	}
	return text(value);
}

function dateTimestamp(value: string): number {
	const timestamp = Date.parse(value);
	return Number.isNaN(timestamp) ? 0 : timestamp;
}

const raw = (privateZoneYaml ?? {}) as RawPrivateZoneConfig;
const rawGallery = Array.isArray(raw.gallery)
	? (raw.gallery as RawGalleryItem[])
	: [];
const rawMusic = Array.isArray(raw.music) ? (raw.music as RawMusicTrack[]) : [];

export const privateZoneConfig = {
	intro: text(raw.intro) || "P.Z. 是 Private Zone 的缩写。",
	gallery: rawGallery
		.map((item, index) => {
			const src = assetUrl(item.image, "images");
			const date = dateText(item.date);
			const width = Number(item.width);
			const height = Number(item.height);
			const ratio = width > 0 && height > 0 ? width / height : undefined;
			return {
				index,
				src,
				date,
				alt: text(item.alt) || date || "Private Zone photo",
				hoverCaption: text(item.hover),
				clickCaption: text(item.click),
				ratio,
			};
		})
		.filter((item) => item.src)
		.sort(
			(a, b) =>
				dateTimestamp(b.date) - dateTimestamp(a.date) || a.index - b.index,
		)
		.map(
			({ index: _index, ...item }) => item,
		) satisfies PrivateZoneGalleryItem[],
	music: rawMusic
		.map((track, index) => {
			const src = assetUrl(track.file, "music");
			return {
				src,
				title: text(track.title) || `Track ${index + 1}`,
				artist: text(track.artist),
			};
		})
		.filter((track) => track.src) satisfies PrivateZoneMusicTrack[],
};
