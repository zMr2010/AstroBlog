export interface EncryptedMusicAsset {
	encryptedSrc: string;
	iv: string;
	aad: string;
	mime: string;
	size: number;
	digest?: string;
}

export interface LyricsMetadata {
	complete?: boolean;
	rightsStatus?: string;
	sourceUrl?: string;
	attribution?: string;
	copyrightNotice?: string;
}

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
	asset: EncryptedMusicAsset;
}

export interface MusicTrack extends MusicTrackSource {
	directory: string;
	lyricsContent: string;
	lyricsFormat: string;
	lyricsMetadata?: LyricsMetadata;
	versions: MusicVersion[];
}

export interface MusicAlbum extends Omit<MusicAlbumSource, "tracks"> {
	coverAsset: EncryptedMusicAsset;
	coverProvider: "Apple Music";
	coverSourceUrl: string;
	directory: string;
	year: string;
	availableSongCount: number;
	recordingCount: number;
	tracks: MusicTrack[];
}

export interface EncryptedMusicContent {
	albums: MusicAlbum[];
}

export interface EncryptedMusicPayload {
	version: number;
	iterations: number;
	salt: string;
	iv: string;
	aad: string;
	ciphertext: string;
}

export type MusicAssetResolver = (
	asset: EncryptedMusicAsset,
) => Promise<string>;

export type MusicAssetReleaser = (asset: EncryptedMusicAsset) => void;
