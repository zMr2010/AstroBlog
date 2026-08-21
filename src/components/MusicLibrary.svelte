<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount, tick } from "svelte";
import type { MusicAlbum, MusicTrack } from "../utils/music-library";

export let albums: MusicAlbum[] = [];

interface LyricsMetadata {
	complete?: boolean;
	rightsStatus?: string;
	sourceUrl?: string;
	attribution?: string;
	copyrightNotice?: string;
}

let selectedAlbumIndex = -1;
let selectedTrackIndex = -1;
let selectedVersionIndex = 0;
let audioElement: HTMLAudioElement | null = null;
let lyricsText = "";
let lyricsState: "idle" | "loading" | "ready" | "missing" | "error" = "idle";
let lyricsRequestKey = "";
let lyricsAbortController: AbortController | null = null;
let lyricsMetadata: LyricsMetadata | null = null;
let embeddedLyricsAttribution = "";

$: activeAlbum =
	selectedAlbumIndex >= 0 ? albums[selectedAlbumIndex] : undefined;
$: activeTrack =
	activeAlbum && selectedTrackIndex >= 0
		? activeAlbum.tracks[selectedTrackIndex]
		: undefined;
$: activeVersion = activeTrack?.versions[selectedVersionIndex]
	? activeTrack.versions[selectedVersionIndex]
	: undefined;
$: availableSongs = albums.reduce(
	(total, album) => total + album.availableSongCount,
	0,
);
$: totalSongs = albums.reduce((total, album) => total + album.tracks.length, 0);
$: totalRecordings = albums.reduce(
	(total, album) => total + album.recordingCount,
	0,
);

function formatDate(date: string) {
	const [year, month, day] = date.split("-");
	return `${year}.${month}.${day}`;
}

function setUrlState(album: MusicAlbum, track?: MusicTrack) {
	if (typeof window === "undefined") return;
	const hash = track ? `${album.slug}/${track.slug}` : album.slug;
	const url = `${window.location.pathname}${window.location.search}#${hash}`;
	// Match Swup's updateHistoryRecord shape while preserving its history index.
	window.history.replaceState(
		{
			...(window.history.state ?? {}),
			url,
			random: Math.random(),
			source: "swup",
		},
		"",
		url,
	);
}

function resetLyrics() {
	lyricsAbortController?.abort();
	lyricsAbortController = null;
	lyricsRequestKey = "";
	lyricsState = "idle";
	lyricsText = "";
	lyricsMetadata = null;
	embeddedLyricsAttribution = "";
}

function readUrlState() {
	if (typeof window === "undefined") return;
	const [albumSlug, trackSlug] = window.location.hash
		.replace(/^#/, "")
		.split("/");
	if (!albumSlug) {
		selectedAlbumIndex = -1;
		selectedTrackIndex = -1;
		selectedVersionIndex = 0;
		resetLyrics();
		return;
	}

	const albumIndex = albums.findIndex((album) => album.slug === albumSlug);
	if (albumIndex < 0) {
		selectedAlbumIndex = -1;
		selectedTrackIndex = -1;
		selectedVersionIndex = 0;
		resetLyrics();
		return;
	}

	selectedAlbumIndex = albumIndex;
	selectedTrackIndex = trackSlug
		? albums[albumIndex].tracks.findIndex((track) => track.slug === trackSlug)
		: -1;
	selectedVersionIndex = 0;

	if (selectedTrackIndex >= 0) {
		void loadLyrics(albums[albumIndex].tracks[selectedTrackIndex]);
	} else {
		resetLyrics();
	}
}

async function selectAlbum(index: number) {
	if (audioElement) audioElement.pause();
	selectedAlbumIndex = index;
	selectedTrackIndex = -1;
	selectedVersionIndex = 0;
	resetLyrics();
	setUrlState(albums[index]);

	await tick();
	const workspace = document.getElementById("music-workspace");
	document.getElementById("album-detail-title")?.focus({ preventScroll: true });
	workspace?.scrollIntoView({
		behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
			? "auto"
			: "smooth",
		block: "start",
	});
}

async function selectTrack(index: number, event: MouseEvent) {
	if (!activeAlbum) return;
	if (audioElement) audioElement.pause();
	selectedTrackIndex = index;
	selectedVersionIndex = 0;
	const track = activeAlbum.tracks[index];
	setUrlState(activeAlbum, track);
	void loadLyrics(track);
	await tick();
	if (event.detail > 0 && window.matchMedia("(max-width: 880px)").matches) {
		document.getElementById("version-panel")?.scrollIntoView({
			behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
				? "auto"
				: "smooth",
			block: "start",
		});
	}
}

async function selectVersion(index: number) {
	selectedVersionIndex = index;
	await tick();
	if (!audioElement) return;
	audioElement.load();
	try {
		await audioElement.play();
	} catch {
		// Browsers may still require a separate press on the native play button.
	}
}

function normalizeLyrics(raw: string) {
	const metadata = /^\[(ar|al|ti|au|by|offset|length|re|ve):.*\]$/i;
	const timestamp = /^(?:\[\d{1,3}:\d{2}(?:[.:]\d{1,3})?\])+/;
	let embeddedAttribution = "";

	const text = raw
		.replace(/^\uFEFF/, "")
		.replace(/\r\n?/g, "\n")
		.split("\n")
		.filter((line) => {
			const trimmed = line.trim();
			const byMatch = trimmed.match(/^\[by:(.*)\]$/i);
			if (byMatch?.[1]) embeddedAttribution = byMatch[1].trim();
			return !metadata.test(trimmed);
		})
		.map((line) => line.replace(timestamp, "").trimEnd())
		.join("\n")
		.replace(/\n{3,}/g, "\n\n")
		.trim();

	return { text, embeddedAttribution };
}

async function loadLyrics(track: MusicTrack) {
	lyricsAbortController?.abort();
	const controller = new AbortController();
	lyricsAbortController = controller;
	const requestKey = track.directory;
	lyricsRequestKey = requestKey;
	lyricsState = "loading";
	lyricsText = "";
	lyricsMetadata = null;
	embeddedLyricsAttribution = "";
	let nextMetadata: LyricsMetadata | null = null;

	try {
		try {
			const metadataResponse = await fetch(track.lyricsMetaUrl, {
				cache: "no-store",
				signal: controller.signal,
			});
			const metadataContentType =
				metadataResponse.headers.get("content-type") ?? "";
			if (metadataResponse.ok && !metadataContentType.includes("text/html")) {
				nextMetadata = (await metadataResponse.json()) as LyricsMetadata;
			}
		} catch {
			if (controller.signal.aborted) return;
			// Metadata is optional; missing metadata is surfaced as "待核对".
		}

		for (const lyricsUrl of track.lyricsUrls) {
			const response = await fetch(lyricsUrl, {
				cache: "no-store",
				signal: controller.signal,
			});
			const contentType = response.headers.get("content-type") ?? "";
			if (!response.ok || contentType.includes("text/html")) continue;
			const normalized = normalizeLyrics(await response.text());
			if (controller.signal.aborted || lyricsRequestKey !== requestKey) return;
			if (normalized.text) {
				lyricsMetadata = nextMetadata;
				lyricsText = normalized.text;
				embeddedLyricsAttribution = normalized.embeddedAttribution;
				lyricsState = "ready";
				return;
			}
		}

		if (!controller.signal.aborted && lyricsRequestKey === requestKey) {
			lyricsState = "missing";
		}
	} catch {
		if (!controller.signal.aborted && lyricsRequestKey === requestKey) {
			lyricsState = "error";
		}
	} finally {
		if (lyricsAbortController === controller) lyricsAbortController = null;
	}
}

function hideBrokenCover(event: Event) {
	const image = event.currentTarget;
	if (image instanceof HTMLImageElement) image.hidden = true;
}

onMount(() => {
	readUrlState();
	window.addEventListener("hashchange", readUrlState);

	return () => {
		lyricsAbortController?.abort();
		window.removeEventListener("hashchange", readUrlState);
	};
});
</script>

<section class="music-library card-base">
	<header class="music-hero">
		<div class="hero-copy">
			<p class="eyebrow">MY COVER ARCHIVE · JAY CHOU</p>
			<h1>Music</h1>
			<p class="hero-description">
				按首发日期收录 16 张录音室专辑，以及《不能说的秘密》《天台》两张电影原声带中由周杰伦主唱或明确合唱的人声曲目。
			</p>
			<p class="rights-caption">
				歌词只读取站长手动导入且确认可使用的本地文件，本站不会自动抓取第三方完整歌词。
			</p>
		</div>

		<div class="hero-stats" aria-label="收藏统计">
			<div>
				<strong>{albums.length}</strong>
				<span>张专辑</span>
			</div>
			<div>
				<strong>{availableSongs}<small>/{totalSongs}</small></strong>
				<span>已翻唱歌曲</span>
			</div>
			<div>
				<strong>{totalRecordings}</strong>
				<span>个版本</span>
			</div>
		</div>
	</header>

	<div class="shelf-heading">
		<div>
			<p>DISCOGRAPHY</p>
			<h2>按发行时间</h2>
		</div>
		<span>点击封面展开曲目</span>
	</div>

	<div class="album-grid" aria-label="周杰伦专辑列表">
		{#each albums as album, index}
			<button
				type="button"
				class:active={selectedAlbumIndex === index}
				class="album-card"
				aria-label={`打开《${album.title}》，${album.availableSongCount} 首已有翻唱，共 ${album.tracks.length} 首`}
				aria-pressed={selectedAlbumIndex === index}
				on:click={() => selectAlbum(index)}
			>
				<span class="album-art">
					<span class="cover-monogram" aria-hidden="true">
						{String(index + 1).padStart(2, "0")}
					</span>
					<img
						src={album.cover}
						alt={`${album.title}封面`}
						loading={index < 6 ? "eager" : "lazy"}
						on:error={hideBrokenCover}
					/>
					<span class="album-index">{String(index + 1).padStart(2, "0")}</span>
					<span class="open-album" aria-hidden="true">
						<Icon icon="material-symbols:arrow-outward-rounded" />
					</span>
				</span>

				<span class="album-meta">
					<span class="album-name" title={album.title}>{album.title}</span>
					<span class="album-year">{album.year} · {album.kind}</span>
				</span>
				<span
					class:complete={
						album.availableSongCount === album.tracks.length &&
						album.tracks.length > 0
					}
					class="album-progress"
					aria-label={`${album.availableSongCount} 首已有翻唱，共 ${album.tracks.length} 首`}
				>
					{album.availableSongCount}/{album.tracks.length}
				</span>
			</button>
		{/each}
	</div>

	{#if !activeAlbum}
		<div class="empty-selection">
			<span class="empty-icon"><Icon icon="material-symbols:album-outline-rounded" /></span>
			<div>
				<strong>先选一张专辑</strong>
				<p>曲目和翻唱版本会从这里展开；若已导入获授权歌词，也会一并显示。</p>
			</div>
		</div>
	{:else}
		<section
			id="music-workspace"
			class="workspace"
			aria-labelledby="album-detail-title"
		>
			<header class="album-detail-header">
				<div class="detail-cover">
					<span aria-hidden="true">{String(selectedAlbumIndex + 1).padStart(2, "0")}</span>
					<img src={activeAlbum.cover} alt="" on:error={hideBrokenCover} />
				</div>
				<div class="detail-copy">
					<p>{activeAlbum.kind} · {formatDate(activeAlbum.releaseDate)}</p>
					<h2 id="album-detail-title" tabindex="-1">{activeAlbum.title}</h2>
					<span>{activeAlbum.englishTitle}</span>
					<div class="detail-links">
						<span>{activeAlbum.tracks.length} 首人声曲目</span>
						<span aria-hidden="true">·</span>
						<a href={activeAlbum.sourceUrl} target="_blank" rel="noopener noreferrer">
							专辑资料
							<Icon icon="material-symbols:open-in-new-rounded" />
						</a>
						<span aria-hidden="true">·</span>
						<a href={activeAlbum.coverSourceUrl} target="_blank" rel="noopener noreferrer">
							封面来源 · {activeAlbum.coverProvider}
							<Icon icon="material-symbols:open-in-new-rounded" />
						</a>
					</div>
				</div>
			</header>

			<div class="library-grid">
				<div class="track-pane">
					<div class="pane-title">
						<div>
							<p>TRACKLIST</p>
							<h3>选择歌曲</h3>
						</div>
						<span>{activeAlbum.availableSongCount}/{activeAlbum.tracks.length}</span>
					</div>

					<div class="track-list">
						{#each activeAlbum.tracks as track, index}
							<button
								type="button"
								class:active={selectedTrackIndex === index}
								class:recorded={track.versions.length > 0}
								aria-current={selectedTrackIndex === index ? "true" : undefined}
								on:click={(event) => selectTrack(index, event)}
							>
								<span class="track-number">{String(index + 1).padStart(2, "0")}</span>
								<span class="track-copy">
									<strong>{track.title}</strong>
									<small>/{track.slug}</small>
								</span>
								{#if track.versions.length > 0}
									<span class="version-count">{track.versions.length} 版</span>
								{:else}
									<span class="unrecorded-dot" aria-label="暂无翻唱"></span>
								{/if}
							</button>
						{/each}
					</div>

					{#if activeTrack}
						<div id="version-panel" class="version-panel">
							<div class="version-heading">
								<div>
									<p>MY RECORDINGS</p>
									<h3>选择版本</h3>
								</div>
								<Icon icon="material-symbols:graphic-eq-rounded" />
							</div>

							{#if activeTrack.versions.length > 0}
								<div class="version-list" aria-label="翻唱版本">
									{#each activeTrack.versions as version, index}
										<button
											type="button"
											class:active={selectedVersionIndex === index}
											aria-pressed={selectedVersionIndex === index}
											on:click={() => selectVersion(index)}
										>
											<span>{String(version.number).padStart(2, "0")}</span>
											版本 {String(version.number).padStart(2, "0")}
										</button>
									{/each}
								</div>

								{#if activeVersion}
									<audio
										bind:this={audioElement}
										controls
										preload="metadata"
										src={activeVersion.url}
									>
									</audio>
								{/if}
							{:else}
								<div class="no-recording">
									<Icon icon="material-symbols:mic-external-off-outline-rounded" />
									<div>
										<strong>还没有翻唱</strong>
										<p>从 <code>{activeTrack.directory}/1.mp3</code> 开始放入。</p>
									</div>
								</div>
							{/if}
						</div>
					{/if}
				</div>

				<aside class="lyrics-pane">
					<div class="lyrics-heading">
						<div>
							<p>LYRICS</p>
							<h3>{activeTrack?.title ?? "歌词"}</h3>
						</div>
						<span class="lyrics-mark" aria-hidden="true">“</span>
					</div>

					{#if !activeTrack}
						<div class="lyrics-empty">
							<Icon icon="material-symbols:lyrics-outline-rounded" />
							<strong>选择左侧歌曲</strong>
							<p>若已导入获授权的本地歌词，将在右侧显示。</p>
						</div>
					{:else if lyricsState === "loading"}
						<div class="lyrics-loading" aria-live="polite">
							<span></span><span></span><span></span>
							<p>正在读取本地歌词…</p>
						</div>
					{:else if lyricsState === "ready"}
						<pre class="lyrics-text">{lyricsText}</pre>
						<div class="lyrics-credits">
							<span class:verified={lyricsMetadata?.complete === true} class="lyrics-status">
								{lyricsMetadata?.complete === true ? "已标记为完整" : "本地歌词 · 待核对完整性"}
							</span>
							{#if lyricsMetadata?.rightsStatus}
								<span>权利状态：{lyricsMetadata.rightsStatus}</span>
							{/if}
							{#if lyricsMetadata?.attribution || embeddedLyricsAttribution}
								<span>{lyricsMetadata?.attribution ?? embeddedLyricsAttribution}</span>
							{/if}
							{#if lyricsMetadata?.copyrightNotice}
								<span>{lyricsMetadata.copyrightNotice}</span>
							{/if}
							{#if lyricsMetadata?.sourceUrl}
								<a href={lyricsMetadata.sourceUrl} target="_blank" rel="noopener noreferrer">
									歌词来源 <Icon icon="material-symbols:open-in-new-rounded" />
								</a>
							{/if}
						</div>
					{:else if lyricsState === "missing"}
						<div class="lyrics-empty missing" aria-live="polite">
							<Icon icon="material-symbols:contract-edit-outline-rounded" />
							<strong>本地歌词待补充</strong>
							<p>
								将已获授权的 <code>lyrics.lrc</code> 或 <code>lyrics.txt</code>
								放进 <code>{activeTrack.directory}</code>。
							</p>
						</div>
					{:else if lyricsState === "error"}
						<div class="lyrics-empty missing" aria-live="polite">
							<Icon icon="material-symbols:cloud-off-outline-rounded" />
							<strong>本地歌词读取失败</strong>
							<p>请检查文件是否可访问、编码是否为 UTF-8，以及部署路径是否正确。</p>
						</div>
					{:else}
						<div class="lyrics-empty">
							<Icon icon="material-symbols:lyrics-outline-rounded" />
							<strong>准备好了</strong>
							<p>选择一首歌，检查并读取对应的本地歌词。</p>
						</div>
					{/if}
				</aside>
			</div>
		</section>
	{/if}

	<footer class="library-note">
		<Icon icon="material-symbols:info-outline-rounded" />
		<p>
			数字表示“至少有一个翻唱版本的歌曲数 / 人声歌曲总数”。纯配乐、仅由他人演唱及仅和声参与的曲目已排除；当前口径不含现场、精选、EP 与单曲。
		</p>
	</footer>
	<footer class="library-note rights-note">
		<Icon icon="material-symbols:verified-user-outline-rounded" />
		<p>
			封面来源链接只标明素材出处，不代表版权归本站；公开发布前请确认封面、歌词和翻唱录音各自的使用权利。
		</p>
	</footer>
</section>

<style>
.music-library {
	--music-ink: rgb(0 0 0 / 0.88);
	--music-muted: rgb(0 0 0 / 0.48);
	--music-faint: rgb(0 0 0 / 0.08);
	position: relative;
	padding: clamp(1.25rem, 3.2vw, 2.75rem);
	overflow: hidden;
	background:
		radial-gradient(circle at 102% -2%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 29rem),
		var(--card-bg);
}

:global(.dark) .music-library {
	--music-ink: rgb(255 255 255 / 0.9);
	--music-muted: rgb(255 255 255 / 0.5);
	--music-faint: rgb(255 255 255 / 0.09);
}

.music-hero {
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	gap: 2rem;
	padding: 0.75rem 0 2.25rem;
	border-bottom: 1px solid var(--music-faint);
}

.hero-copy { max-width: 34rem; }

.eyebrow,
.shelf-heading p,
.pane-title p,
.version-heading p,
.lyrics-heading p,
.detail-copy > p {
	margin: 0;
	color: var(--primary);
	font-size: 0.68rem;
	font-weight: 800;
	letter-spacing: 0.18em;
	line-height: 1.4;
}

h1 {
	margin: 0.35rem 0 0;
	color: var(--music-ink);
	font-size: clamp(3.5rem, 9vw, 6.4rem);
	font-weight: 750;
	letter-spacing: -0.075em;
	line-height: 0.9;
}

.hero-description {
	max-width: 31rem;
	margin: 1.15rem 0 0;
	color: var(--music-muted);
	font-size: 0.98rem;
	line-height: 1.8;
}

.rights-caption {
	max-width: 34rem;
	margin: 0.7rem 0 0;
	color: var(--music-muted);
	font-size: 0.7rem;
	line-height: 1.65;
}

.hero-stats {
	display: grid;
	grid-template-columns: repeat(3, auto);
	gap: clamp(0.9rem, 2vw, 1.8rem);
	flex: none;
}

.hero-stats div { display: grid; gap: 0.25rem; }
.hero-stats strong {
	color: var(--music-ink);
	font-size: 1.35rem;
	font-variant-numeric: tabular-nums;
	line-height: 1;
}

.hero-stats small { color: var(--music-muted); font-size: 0.65em; }
.hero-stats span { color: var(--music-muted); font-size: 0.68rem; }

.shelf-heading {
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	gap: 1rem;
	margin-top: 2.15rem;
}

.shelf-heading h2,
.pane-title h3,
.version-heading h3,
.lyrics-heading h3 {
	margin: 0.2rem 0 0;
	color: var(--music-ink);
	font-size: 1.2rem;
	font-weight: 700;
}

.shelf-heading > span {
	color: var(--music-muted);
	font-size: 0.75rem;
}

.album-grid {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 1.5rem 1rem;
	margin-top: 1.2rem;
}

.album-card {
	position: relative;
	display: grid;
	grid-template-columns: minmax(0, 1fr) auto;
	gap: 0.75rem 0.5rem;
	min-width: 0;
	padding: 0 0 0.45rem;
	border: 0;
	border-radius: 0.9rem;
	background: transparent;
	color: inherit;
	text-align: left;
	cursor: pointer;
}

.album-art {
	position: relative;
	display: grid;
	grid-column: 1 / -1;
	aspect-ratio: 1;
	place-items: center;
	overflow: hidden;
	border-radius: 0.85rem;
	background:
		linear-gradient(145deg, color-mix(in oklab, var(--primary) 32%, var(--card-bg)), var(--btn-regular-bg));
	box-shadow: 0 0.8rem 2rem rgb(0 0 0 / 0.11);
	transition: transform 190ms ease, box-shadow 190ms ease, outline-color 190ms ease;
}

.cover-monogram {
	color: color-mix(in oklab, var(--primary) 45%, transparent);
	font-size: 2.4rem;
	font-weight: 800;
}

.album-art img {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.album-card:hover .album-art,
.album-card:focus-visible .album-art {
	transform: translateY(-0.28rem);
	box-shadow: 0 1.2rem 2.4rem rgb(0 0 0 / 0.17);
}

.album-card:focus-visible { outline: none; }
.album-card:focus-visible .album-art,
.album-card.active .album-art {
	outline: 3px solid var(--primary);
	outline-offset: 3px;
}

.album-index,
.open-album {
	position: absolute;
	top: 0.55rem;
	z-index: 2;
	display: grid;
	place-items: center;
	border-radius: 999px;
	background: rgb(0 0 0 / 0.48);
	color: white;
	backdrop-filter: blur(10px);
}

.album-index {
	left: 0.55rem;
	min-width: 1.8rem;
	height: 1.4rem;
	padding: 0 0.4rem;
	font-size: 0.6rem;
	font-weight: 800;
}

.open-album {
	right: 0.55rem;
	width: 1.75rem;
	height: 1.75rem;
	font-size: 1rem;
	opacity: 0;
	transform: translateY(0.25rem);
	transition: opacity 170ms ease, transform 170ms ease;
}

.album-card:hover .open-album,
.album-card:focus-visible .open-album,
.album-card.active .open-album {
	opacity: 1;
	transform: translateY(0);
}

.album-meta { display: grid; min-width: 0; }
.album-name {
	overflow: hidden;
	color: var(--music-ink);
	font-size: 0.79rem;
	font-weight: 700;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.album-year { margin-top: 0.18rem; color: var(--music-muted); font-size: 0.62rem; }
.album-progress {
	align-self: end;
	padding: 0.15rem 0.38rem;
	border-radius: 999px;
	background: var(--btn-regular-bg);
	color: var(--primary);
	font-family: "JetBrains Mono Variable", monospace;
	font-size: 0.61rem;
	font-weight: 800;
	font-variant-numeric: tabular-nums;
}

.album-progress.complete { background: color-mix(in oklab, #22c55e 15%, transparent); color: #16a34a; }

.empty-selection {
	display: flex;
	align-items: center;
	gap: 1rem;
	margin-top: 2.4rem;
	padding: 1.2rem;
	border: 1px dashed color-mix(in oklab, var(--primary) 32%, transparent);
	border-radius: 1rem;
	color: var(--music-ink);
}

.empty-icon {
	display: grid;
	width: 2.8rem;
	height: 2.8rem;
	flex: none;
	place-items: center;
	border-radius: 50%;
	background: var(--btn-regular-bg);
	color: var(--primary);
	font-size: 1.45rem;
}

.empty-selection p { margin: 0.25rem 0 0; color: var(--music-muted); font-size: 0.8rem; }

.workspace {
	margin-top: 2.8rem;
	padding-top: 2.2rem;
	border-top: 1px solid var(--music-faint);
	scroll-margin-top: 6rem;
}

.album-detail-header {
	display: flex;
	align-items: center;
	gap: 1.4rem;
	margin-bottom: 1.25rem;
}

.detail-cover {
	position: relative;
	display: grid;
	width: 6.6rem;
	flex: none;
	aspect-ratio: 1;
	place-items: center;
	overflow: hidden;
	border-radius: 0.9rem;
	background: var(--btn-regular-bg);
	color: var(--primary);
	font-size: 1.4rem;
	font-weight: 800;
	box-shadow: 0 0.8rem 2rem rgb(0 0 0 / 0.12);
}

.detail-cover img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.detail-copy { min-width: 0; }
.detail-copy h2 {
	margin: 0.3rem 0 0;
	color: var(--music-ink);
	font-size: clamp(1.6rem, 4vw, 2.35rem);
	letter-spacing: -0.035em;
	line-height: 1.1;
}

.detail-copy h2:focus-visible {
	border-radius: 0.2rem;
	outline: 2px solid var(--primary);
	outline-offset: 0.25rem;
}

.detail-copy > span { display: block; margin-top: 0.3rem; color: var(--music-muted); font-size: 0.84rem; }
.detail-links { display: flex; flex-wrap: wrap; align-items: center; gap: 0.45rem; margin-top: 0.75rem; color: var(--music-muted); font-size: 0.72rem; }
.detail-links a { display: inline-flex; align-items: center; gap: 0.2rem; color: var(--primary); text-decoration: none; }

.library-grid {
	display: grid;
	grid-template-columns: minmax(17rem, 0.92fr) minmax(0, 1.08fr);
	gap: 1rem;
	align-items: start;
}

.track-pane,
.lyrics-pane {
	border: 1px solid var(--music-faint);
	border-radius: 1rem;
	background: color-mix(in oklab, var(--card-bg) 91%, var(--primary) 2%);
}

.track-pane { overflow: hidden; }
.pane-title,
.lyrics-heading,
.version-heading {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
}

.pane-title { padding: 1.1rem 1.1rem 0.85rem; border-bottom: 1px solid var(--music-faint); }
.pane-title > span { color: var(--primary); font-size: 0.7rem; font-weight: 800; }
.track-list { max-height: 30rem; overflow-y: auto; padding: 0.45rem; scrollbar-width: thin; }

.track-list button {
	display: grid;
	grid-template-columns: 2.1rem minmax(0, 1fr) auto;
	align-items: center;
	gap: 0.55rem;
	width: 100%;
	padding: 0.68rem 0.7rem;
	border: 0;
	border-radius: 0.7rem;
	background: transparent;
	color: inherit;
	text-align: left;
	cursor: pointer;
	transition: background-color 150ms ease, color 150ms ease;
}

.track-list button:hover,
.track-list button:focus-visible { background: var(--btn-plain-bg-hover); outline: none; }
.track-list button.active { background: var(--btn-regular-bg); }
.track-number { color: var(--music-muted); font-family: "JetBrains Mono Variable", monospace; font-size: 0.64rem; }
.track-copy { display: grid; min-width: 0; }
.track-copy strong { overflow: hidden; color: var(--music-ink); font-size: 0.78rem; text-overflow: ellipsis; white-space: nowrap; }
.track-copy small { overflow: hidden; margin-top: 0.12rem; color: var(--music-muted); font-size: 0.58rem; text-overflow: ellipsis; white-space: nowrap; }
.version-count { padding: 0.16rem 0.42rem; border-radius: 999px; background: color-mix(in oklab, var(--primary) 13%, transparent); color: var(--primary); font-size: 0.58rem; font-weight: 700; }
.unrecorded-dot { width: 0.42rem; height: 0.42rem; margin-right: 0.35rem; border-radius: 50%; background: var(--music-faint); }
.recorded .track-number { color: var(--primary); }

.version-panel { padding: 1rem; border-top: 1px solid var(--music-faint); }
.version-heading > :global(svg) { color: var(--primary); font-size: 1.35rem; }
.version-list { display: flex; flex-wrap: wrap; gap: 0.45rem; margin-top: 0.8rem; }
.version-list button {
	display: inline-flex;
	align-items: center;
	gap: 0.4rem;
	padding: 0.45rem 0.65rem;
	border: 1px solid var(--music-faint);
	border-radius: 0.65rem;
	background: transparent;
	color: var(--music-muted);
	font-size: 0.68rem;
	cursor: pointer;
}
.version-list button span { display: grid; width: 1.35rem; height: 1.35rem; place-items: center; border-radius: 50%; background: var(--btn-regular-bg); color: var(--primary); font-family: "JetBrains Mono Variable", monospace; font-size: 0.55rem; font-weight: 800; }
.version-list button.active { border-color: color-mix(in oklab, var(--primary) 55%, transparent); background: var(--btn-regular-bg); color: var(--music-ink); }
audio { width: 100%; height: 2.7rem; margin-top: 0.9rem; accent-color: var(--primary); }

.no-recording { display: flex; align-items: flex-start; gap: 0.65rem; margin-top: 0.8rem; padding: 0.8rem; border-radius: 0.75rem; background: var(--btn-regular-bg); color: var(--music-muted); }
.no-recording > :global(svg) { flex: none; color: var(--primary); font-size: 1.25rem; }
.no-recording strong { color: var(--music-ink); font-size: 0.73rem; }
.no-recording p { margin: 0.2rem 0 0; font-size: 0.63rem; line-height: 1.55; }
code { padding: 0.1rem 0.28rem; border-radius: 0.3rem; background: var(--card-bg); color: var(--primary); font-family: "JetBrains Mono Variable", monospace; font-size: 0.9em; overflow-wrap: anywhere; }

.lyrics-pane { position: sticky; top: 5.5rem; min-height: 28rem; overflow: hidden; }
.lyrics-heading { padding: 1.15rem 1.25rem 0.95rem; border-bottom: 1px solid var(--music-faint); }
.lyrics-mark { align-self: flex-start; color: color-mix(in oklab, var(--primary) 35%, transparent); font-family: Georgia, serif; font-size: 3rem; line-height: 0.8; }
.lyrics-text { max-height: 38rem; margin: 0; padding: 1.5rem 1.4rem 2.25rem; overflow-y: auto; background: transparent; color: var(--music-ink); font-family: inherit; font-size: 0.88rem; line-height: 2.05; white-space: pre-wrap; word-break: break-word; scrollbar-width: thin; }
.lyrics-credits {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.45rem 0.7rem;
	padding: 0.85rem 1.25rem 1rem;
	border-top: 1px solid var(--music-faint);
	color: var(--music-muted);
	font-size: 0.64rem;
	line-height: 1.55;
}

.lyrics-credits a {
	display: inline-flex;
	align-items: center;
	gap: 0.2rem;
	color: var(--primary);
	text-decoration: none;
}

.lyrics-status {
	padding: 0.18rem 0.42rem;
	border-radius: 999px;
	background: var(--btn-regular-bg);
	color: var(--music-muted);
	font-weight: 700;
}

.lyrics-status.verified {
	background: color-mix(in oklab, #22c55e 15%, transparent);
	color: #16a34a;
}
.lyrics-empty,
.lyrics-loading { display: grid; min-height: 22rem; padding: 2rem; place-items: center; align-content: center; text-align: center; color: var(--music-muted); }
.lyrics-empty > :global(svg) { color: var(--primary); font-size: 2.2rem; }
.lyrics-empty strong { margin-top: 0.75rem; color: var(--music-ink); font-size: 0.86rem; }
.lyrics-empty p { max-width: 22rem; margin: 0.45rem 0 0; font-size: 0.72rem; line-height: 1.75; }
.lyrics-empty.missing { background: repeating-linear-gradient(-45deg, transparent, transparent 0.65rem, color-mix(in oklab, var(--primary) 2.5%, transparent) 0.65rem, color-mix(in oklab, var(--primary) 2.5%, transparent) 1.3rem); }
.lyrics-loading { grid-template-columns: repeat(3, 0.45rem); gap: 0.35rem; }
.lyrics-loading span { width: 0.45rem; height: 0.45rem; border-radius: 50%; background: var(--primary); animation: pulse 900ms ease-in-out infinite alternate; }
.lyrics-loading span:nth-child(2) { animation-delay: 160ms; }
.lyrics-loading span:nth-child(3) { animation-delay: 320ms; }
.lyrics-loading p { grid-column: 1 / -1; margin: 0.5rem 0 0; font-size: 0.7rem; }

.library-note { display: flex; align-items: flex-start; gap: 0.55rem; margin-top: 1.5rem; padding-top: 1.1rem; border-top: 1px solid var(--music-faint); color: var(--music-muted); }
.library-note > :global(svg) { flex: none; color: var(--primary); font-size: 1rem; }
.library-note p { margin: 0; font-size: 0.68rem; line-height: 1.6; }
.rights-note { margin-top: 0.65rem; }

@keyframes pulse { to { opacity: 0.25; transform: translateY(-0.25rem); } }

@media (max-width: 880px) {
	.music-hero { align-items: flex-start; flex-direction: column; }
	.album-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
	.library-grid { grid-template-columns: 1fr; }
	.lyrics-pane { position: static; }
}

@media (max-width: 640px) {
	.music-library { padding: 1.15rem; }
	.music-hero { gap: 1.4rem; padding-bottom: 1.7rem; }
	.hero-stats { width: 100%; justify-content: space-between; }
	.shelf-heading > span { display: none; }
	.album-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.25rem 0.8rem; }
	.album-name { font-size: 0.74rem; }
	.album-detail-header { align-items: flex-start; gap: 1rem; }
	.detail-cover { width: 5rem; }
	.detail-copy h2 { font-size: 1.35rem; }
	.detail-links { margin-top: 0.5rem; }
	.track-list { max-height: 25rem; }
}

@media (prefers-reduced-motion: reduce) {
	.album-art,
	.open-album,
	.lyrics-loading span { transition: none; animation: none; }
}
</style>
