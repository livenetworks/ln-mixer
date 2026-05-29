/* ====================================================================
   LN DJ Mixer — Service Worker
   Strategy: pre-cache app shell on install, network-first at runtime
   ==================================================================== */

const CACHE_NAME = 'ln-mixer-v23';

const APP_SHELL = [
	'./',
	'./index.html',
	'./assets/css/ln-ashlar-icons.css',
	'./assets/css/app.css',
	// Vendor bundle (ln-ashlar, rebuilt from source)
	'./assets/js/ln-ashlar.build.js',
	'./assets/js/vendor/wavesurfer.js',
	// Project entry + unminified component files (loaded as native ES modules)
	'./assets/js/main.js',
	'./assets/js/ln-db.js',
	'./assets/js/ln-profile.js',
	'./assets/js/ln-playlist.js',
	'./assets/js/ln-settings.js',
	'./assets/js/ln-library.js',
	'./assets/js/ln-waveform.js',
	'./assets/js/ln-deck.js',
	'./assets/js/ln-mixer.js',
	'./assets/js/ln-mixer-audio.js',
	'./assets/js/ln-mixer-cache.js',
	'./assets/js/ln-mixer-deck.js',
	'./assets/js/ln-mixer-settings.js',
	'./assets/js/ln-mixer-transfer.js',
	'./assets/img/placeholder.svg',
	'./assets/img/icon.svg'
];

// ln-core helpers — imported live by project files via the importmap.
// Sourced from the ln-ashlar submodule, so cache-add failures are tolerated.
const LN_ASHLAR = [
	'./ln-ashlar/js/ln-core/index.js',
	'./ln-ashlar/js/ln-core/helpers.js',
	'./ln-ashlar/js/ln-core/reactive.js',
	'./ln-ashlar/js/ln-core/persist.js',
	'./ln-ashlar/js/ln-core/positioning.js',
	'./ln-ashlar/js/ln-core/crypto.js'
];

/* ─── Install ─────────────────────────────────────────────────────── */

self.addEventListener('install', function (e) {
	e.waitUntil(
		caches.open(CACHE_NAME).then(function (cache) {
			return cache.addAll(APP_SHELL).then(function () {
				// ln-ashlar files — skip failures (submodule may differ)
				return Promise.allSettled(
					LN_ASHLAR.map(function (url) { return cache.add(url); })
				);
			});
		}).then(function () {
			return self.skipWaiting();
		})
	);
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
	var url = new URL(e.request.url);

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
			var clone = response.clone();
			caches.open(CACHE_NAME).then(function (cache) {
				cache.put(request, clone);
			});
		}
		return response;
	}).catch(function () {
		return caches.match(request);
	});
}
