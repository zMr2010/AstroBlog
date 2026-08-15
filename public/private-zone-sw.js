const PRIVATE_ZONE_CACHE_PREFIX = "private-zone-assets-";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
	event.waitUntil((async () => {
		const cacheNames = await caches.keys();
		await Promise.all(
			cacheNames
				.filter((cacheName) => cacheName.startsWith(PRIVATE_ZONE_CACHE_PREFIX))
				.map((cacheName) => caches.delete(cacheName)),
		);
		await self.clients.claim();
		await self.registration.unregister();
	})());
});
