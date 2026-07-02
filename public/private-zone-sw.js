const CACHE_NAME = "private-zone-assets-v1";
const MEDIA_PATHS = ["/private-zone/images/", "/private-zone/music/"];

function isPrivateZoneMedia(url) {
	return url.origin === self.location.origin
		&& MEDIA_PATHS.some((path) => url.pathname.includes(path));
}

async function cacheAsset(cache, url) {
	const request = new Request(url, { credentials: "same-origin" });
	if (await cache.match(request, { ignoreSearch: true, ignoreVary: true })) return;
	const response = await fetch(request);
	if (response.ok && response.status === 200) await cache.put(request, response);
}

async function createRangeResponse(response, rangeHeader) {
	const match = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader);
	if (!match) return response;
	const buffer = await response.arrayBuffer();
	const size = buffer.byteLength;

	let start = match[1] ? Number(match[1]) : 0;
	let end = match[2] ? Number(match[2]) : size - 1;
	if (!match[1] && match[2]) {
		const suffixLength = Number(match[2]);
		start = Math.max(size - suffixLength, 0);
		end = size - 1;
	}
	end = Math.min(end, size - 1);
	if (start > end || start >= size) {
		return new Response(null, {
			status: 416,
			headers: { "Content-Range": `bytes */${size}` },
		});
	}

	const headers = new Headers(response.headers);
	headers.set("Accept-Ranges", "bytes");
	headers.set("Content-Length", String(end - start + 1));
	headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
	return new Response(buffer.slice(start, end + 1), {
		status: 206,
		statusText: "Partial Content",
		headers,
	});
}

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
	event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
	if (event.data?.type !== "CACHE_PRIVATE_ZONE_ASSETS" || !Array.isArray(event.data.urls)) return;
	event.waitUntil((async () => {
		const cache = await caches.open(CACHE_NAME);
		await Promise.allSettled(
			event.data.urls
				.map((url) => new URL(url, self.location.origin))
				.filter(isPrivateZoneMedia)
				.map((url) => cacheAsset(cache, url.href)),
		);
	})());
});

self.addEventListener("fetch", (event) => {
	if (event.request.method !== "GET" || !isPrivateZoneMedia(new URL(event.request.url))) return;
	event.respondWith((async () => {
		const cache = await caches.open(CACHE_NAME);
		const cached = await cache.match(event.request, { ignoreSearch: true, ignoreVary: true });
		if (cached) {
			const range = event.request.headers.get("Range");
			return range ? createRangeResponse(cached, range) : cached;
		}

		const response = await fetch(event.request);
		if (response.ok && response.status === 200) {
			await cache.put(event.request, response.clone());
		}
		return response;
	})());
});
