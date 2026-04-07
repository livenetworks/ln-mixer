/* ====================================================================
   LN DJ Mixer — Service Worker
   Strategy: network-first for all app assets, cache fallback offline
   ==================================================================== */

const CACHE_NAME = 'ln-mixer-v14';

/* ─── Install ─────────────────────────────────────────────────────── */

self.addEventListener('install', function (e) {
	e.waitUntil(self.skipWaiting());
});

/* ─── Activate ────────────────────────────────────────────────────── */

self.addEventListener('activate', function (e) {
	e.waitUntil(
		caches.keys().then(function (names) {
			return Promise.all(
				names.filter(function (name) {
					return name !== CACHE_NAME;
				}).map(function (name) {
					return caches.delete(name);
				})
			);
		}).then(function () {
			return self.clients.claim();
		})
	);
});

/* ─── Fetch ───────────────────────────────────────────────────────── */

self.addEventListener('fetch', function (e) {
	const url = new URL(e.request.url);

	// Skip non-GET requests
	if (e.request.method !== 'GET') return;

	// Skip blob: and chrome-extension: URLs
	if (url.protocol === 'blob:' || url.protocol === 'chrome-extension:') return;

	// Skip cross-origin requests
	if (url.origin !== self.location.origin) return;

	// Music files — skip (cached in IndexedDB by the app)
	if (url.pathname.indexOf('/music/') !== -1) return;

	// All same-origin requests — network-first
	e.respondWith(_networkFirst(e.request));
});

/* ─── Strategy ────────────────────────────────────────────────────── */

function _networkFirst(request) {
	return fetch(request).then(function (response) {
		if (response.ok) {
			const clone = response.clone();
			caches.open(CACHE_NAME).then(function (cache) {
				cache.put(request, clone);
			});
		}
		return response;
	}).catch(function () {
		return caches.match(request);
	});
}
