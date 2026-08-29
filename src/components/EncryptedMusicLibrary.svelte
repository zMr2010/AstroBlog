<script lang="ts">
import Icon from "@iconify/svelte";
import { onDestroy, onMount } from "svelte";
import type {
	EncryptedMusicAsset,
	EncryptedMusicContent,
	EncryptedMusicPayload,
} from "../utils/music-library";
import MusicLibrary from "./MusicLibrary.svelte";

export let payload: EncryptedMusicPayload;

let password = "";
let state: "locked" | "unlocking" | "unlocked" = "locked";
let statusMessage = "";
let content: EncryptedMusicContent | null = null;
let decryptionKey: CryptoKey | null = null;
let assetGeneration = 0;
let unlockRequest = 0;
let destroyed = false;
const decryptedAssetUrls = new Map<string, string>();
const pendingAssetUrls = new Map<string, Promise<string>>();
const pendingControllers = new Set<AbortController>();

function base64Bytes(value: string) {
	return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function deriveDecryptionKey(
	encryptedPayload: EncryptedMusicPayload,
	passwordValue: string,
) {
	if (
		encryptedPayload.version !== 1 ||
		!Number.isSafeInteger(encryptedPayload.iterations) ||
		encryptedPayload.iterations < 100_000 ||
		encryptedPayload.iterations > 2_000_000
	) {
		throw new Error("Unsupported encrypted payload");
	}
	const salt = base64Bytes(encryptedPayload.salt);
	const iv = base64Bytes(encryptedPayload.iv);
	if (salt.byteLength !== 16 || iv.byteLength !== 12) {
		throw new Error("Invalid encrypted payload parameters");
	}
	const passwordDigest = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(passwordValue),
	);
	const baseKey = await crypto.subtle.importKey(
		"raw",
		passwordDigest,
		"PBKDF2",
		false,
		["deriveKey"],
	);
	return crypto.subtle.deriveKey(
		{
			name: "PBKDF2",
			hash: "SHA-256",
			salt,
			iterations: encryptedPayload.iterations,
		},
		baseKey,
		{ name: "AES-GCM", length: 256 },
		false,
		["decrypt"],
	);
}

async function decryptContent(key: CryptoKey) {
	const plaintext = await crypto.subtle.decrypt(
		{
			name: "AES-GCM",
			iv: base64Bytes(payload.iv),
			additionalData: base64Bytes(payload.aad),
			tagLength: 128,
		},
		key,
		base64Bytes(payload.ciphertext),
	);
	const parsed = JSON.parse(
		new TextDecoder().decode(plaintext),
	) as EncryptedMusicContent;
	if (!parsed || !Array.isArray(parsed.albums)) {
		throw new Error("Invalid Music catalog");
	}
	return parsed;
}

function assetCacheKey(asset: EncryptedMusicAsset) {
	return `${asset.encryptedSrc}\u0000${asset.iv}`;
}

async function sha256Hex(value: ArrayBuffer) {
	const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", value));
	return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function resolveAsset(asset: EncryptedMusicAsset) {
	const key = decryptionKey;
	if (!key || state !== "unlocked") {
		throw new Error("Music is locked");
	}
	if (!Number.isSafeInteger(asset.size) || asset.size < 0) {
		throw new Error("Invalid encrypted asset manifest");
	}
	const cacheKey = assetCacheKey(asset);
	const cached = decryptedAssetUrls.get(cacheKey);
	if (cached) return cached;
	const pending = pendingAssetUrls.get(cacheKey);
	if (pending) return pending;

	const decryption = (async () => {
		const generation = assetGeneration;
		const assetUrl = new URL(asset.encryptedSrc, window.location.href);
		const encryptedDirectory = new URL(
			"/music-zone/encrypted/",
			window.location.origin,
		).pathname;
		const fileName = assetUrl.pathname.slice(encryptedDirectory.length);
		if (
			assetUrl.origin !== window.location.origin ||
			!assetUrl.pathname.startsWith(encryptedDirectory) ||
			!/^[a-f0-9]{64}\.pze$/.test(fileName) ||
			Boolean(assetUrl.search) ||
			Boolean(assetUrl.hash)
		) {
			throw new Error("Refusing to load an invalid Music asset URL");
		}
		const controller = new AbortController();
		pendingControllers.add(controller);
		try {
			const response = await fetch(assetUrl, {
				credentials: "same-origin",
				cache: "force-cache",
				signal: controller.signal,
			});
			if (!response.ok) {
				throw new Error(`Encrypted asset request failed: ${response.status}`);
			}
			const ciphertext = await response.arrayBuffer();
			if (ciphertext.byteLength !== asset.size + 16) {
				throw new Error(
					"Encrypted asset size does not match its authenticated manifest",
				);
			}
			const plaintext = await crypto.subtle.decrypt(
				{
					name: "AES-GCM",
					iv: base64Bytes(asset.iv),
					additionalData: base64Bytes(asset.aad),
					tagLength: 128,
				},
				key,
				ciphertext,
			);
			if (asset.digest && (await sha256Hex(plaintext)) !== asset.digest) {
				throw new Error("Decrypted asset digest does not match its manifest");
			}
			if (generation !== assetGeneration) {
				throw new Error("Music asset decryption was cancelled");
			}
			const objectUrl = URL.createObjectURL(
				new Blob([plaintext], { type: asset.mime }),
			);
			if (generation !== assetGeneration) {
				URL.revokeObjectURL(objectUrl);
				throw new Error("Music asset decryption was cancelled");
			}
			decryptedAssetUrls.set(cacheKey, objectUrl);
			return objectUrl;
		} finally {
			pendingControllers.delete(controller);
		}
	})();
	pendingAssetUrls.set(cacheKey, decryption);
	try {
		return await decryption;
	} finally {
		pendingAssetUrls.delete(cacheKey);
	}
}

function releaseAsset(asset: EncryptedMusicAsset) {
	if (!asset.mime.startsWith("audio/")) return;
	const cacheKey = assetCacheKey(asset);
	const objectUrl = decryptedAssetUrls.get(cacheKey);
	if (!objectUrl) return;
	URL.revokeObjectURL(objectUrl);
	decryptedAssetUrls.delete(cacheKey);
}

function clearProtectedState() {
	assetGeneration += 1;
	for (const controller of pendingControllers) controller.abort();
	pendingControllers.clear();
	for (const objectUrl of decryptedAssetUrls.values()) {
		URL.revokeObjectURL(objectUrl);
	}
	decryptedAssetUrls.clear();
	pendingAssetUrls.clear();
	decryptionKey = null;
	content = null;
}

async function unlock() {
	if (!password || state === "unlocking") return;
	const request = ++unlockRequest;
	state = "unlocking";
	statusMessage = "正在验证并解密…";
	try {
		const key = await deriveDecryptionKey(payload, password);
		if (destroyed || request !== unlockRequest) return;
		const decryptedContent = await decryptContent(key);
		if (destroyed || request !== unlockRequest) return;
		clearProtectedState();
		decryptionKey = key;
		content = decryptedContent;
		password = "";
		state = "unlocked";
		statusMessage = "";
	} catch {
		if (destroyed || request !== unlockRequest) return;
		clearProtectedState();
		state = "locked";
		statusMessage = "密码错误，或加密内容已损坏。";
	}
}

onMount(() => {
	if (!window.location.hash) return;
	const url = `${window.location.pathname}${window.location.search}`;
	window.history.replaceState(
		{ ...(window.history.state ?? {}), url },
		"",
		url,
	);
});

onDestroy(() => {
	destroyed = true;
	unlockRequest += 1;
	password = "";
	clearProtectedState();
});
</script>

{#if state !== "unlocked" || !content}
	<section class="music-gate card-base" data-pagefind-ignore>
		<div class="lock-mark" aria-hidden="true">
			<Icon icon="material-symbols:lock-outline-rounded" />
		</div>
		<p class="eyebrow">ENCRYPTED MUSIC ARCHIVE</p>
		<h1>Music</h1>
		<p class="gate-description">
			专辑资料、歌词、封面与翻唱录音均已加密。请输入密码后在此设备的浏览器中解密。
		</p>
		<form on:submit|preventDefault={unlock}>
			<label for="music-zone-password">访问密码</label>
			<div class="password-row">
				<input
					id="music-zone-password"
					bind:value={password}
					type="password"
					inputmode="numeric"
					autocomplete="off"
					placeholder="请输入密码"
					disabled={state === "unlocking"}
					required
				/>
				<button type="submit" disabled={state === "unlocking"}>
					{state === "unlocking" ? "解密中…" : "进入"}
				</button>
			</div>
			<p class:error={state === "locked" && Boolean(statusMessage)} class="status" role="status" aria-live="polite">
				{statusMessage}
			</p>
		</form>
		<p class="privacy-note">
			本站不会主动将密码或解密密钥写入本地/会话存储；刷新或离开页面后需要重新输入。
		</p>
	</section>
{:else}
	<MusicLibrary albums={content.albums} {resolveAsset} {releaseAsset} />
{/if}

<style>
.music-gate {
	display: flex;
	min-height: 31rem;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	padding: clamp(1.5rem, 4vw, 3rem);
	text-align: center;
	background:
		radial-gradient(circle at 50% 0%, color-mix(in oklab, var(--primary) 16%, transparent), transparent 24rem),
		var(--card-bg);
}

.lock-mark {
	display: grid;
	width: 4.2rem;
	height: 4.2rem;
	place-items: center;
	margin-bottom: 1rem;
	border-radius: 1.25rem;
	color: var(--primary);
	font-size: 2rem;
	background: var(--btn-regular-bg);
}

.eyebrow {
	margin: 0;
	color: var(--primary);
	font-size: 0.68rem;
	font-weight: 800;
	letter-spacing: 0.18em;
}

h1 {
	margin: 0.3rem 0 0;
	color: rgb(0 0 0 / 0.86);
	font-size: clamp(2.8rem, 8vw, 4.8rem);
	font-weight: 750;
	letter-spacing: -0.06em;
	line-height: 1;
}

:global(.dark) h1 { color: rgb(255 255 255 / 0.9); }

.gate-description {
	max-width: 32rem;
	margin: 1rem 0 0;
	color: rgb(0 0 0 / 0.5);
	font-size: 0.88rem;
	line-height: 1.75;
}

:global(.dark) .gate-description { color: rgb(255 255 255 / 0.52); }

form {
	width: min(100%, 25rem);
	margin-top: 1.6rem;
	text-align: left;
}

label {
	display: block;
	margin: 0 0 0.45rem 0.15rem;
	color: rgb(0 0 0 / 0.62);
	font-size: 0.78rem;
	font-weight: 700;
}

:global(.dark) label { color: rgb(255 255 255 / 0.62); }

.password-row { display: flex; gap: 0.55rem; }

input {
	min-width: 0;
	flex: 1;
	border: 1px solid rgb(0 0 0 / 0.11);
	border-radius: 0.75rem;
	outline: 0;
	padding: 0.74rem 0.9rem;
	color: rgb(0 0 0 / 0.82);
	background: var(--page-bg);
}

:global(.dark) input {
	border-color: rgb(255 255 255 / 0.12);
	color: rgb(255 255 255 / 0.84);
}

input:focus {
	border-color: var(--primary);
	box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 18%, transparent);
}

button {
	border-radius: 0.75rem;
	padding: 0.74rem 1.2rem;
	color: white;
	font-weight: 700;
	background: var(--primary);
}

button:disabled, input:disabled { opacity: 0.58; }

.status {
	min-height: 1.25rem;
	margin: 0.45rem 0.2rem 0;
	color: var(--primary);
	font-size: 0.76rem;
}

.status.error { color: oklch(0.62 0.2 25); }

.privacy-note {
	max-width: 30rem;
	margin: 0.3rem 0 0;
	color: rgb(0 0 0 / 0.38);
	font-size: 0.7rem;
	line-height: 1.6;
}

:global(.dark) .privacy-note { color: rgb(255 255 255 / 0.4); }

@media (max-width: 480px) {
	.password-row { flex-direction: column; }
	button { width: 100%; }
}
</style>
