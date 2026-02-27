/* ====================================================================
   LN DJ Mixer — Service Worker
   Strategy: cache-first for app shell, network-first for API
   ==================================================================== */

var CACHE_NAME = 'ln-mixer-v3';

var APP_SHELL = [
	'./',
	'./index.html',
	'./assets/css/style.css',
	'./assets/js/ln-db.js',
	'./assets/js/ln-profile.js',
	'./assets/js/ln-playlist.js',
	'./assets/js/ln-library.js',
	'./assets/js/ln-waveform.js',
	'./assets/js/ln-deck.js',
	'./assets/js/ln-mixer.js',
	'./assets/js/ln-settings.js',
	'./assets/js/wavesurfer.min.js',
	'./assets/img/placeholder.svg',
	'./assets/img/icon.svg',
	'./manifest.webmanifest'
];

var LN_ACME = [
	'./ln-acme/js/ln-toggle/ln-toggle.js',
	'./ln-acme/js/ln-accordion/ln-accordion.js',
	'./ln-acme/js/ln-modal/ln-modal.js',
	'./ln-acme/js/ln-toast/ln-toast.js',
	'./ln-acme/js/ln-search/ln-search.js',
	'./ln-acme/js/ln-sortable/ln-sortable.js',
	'./ln-acme/js/ln-progress/ln-progress.js'
];

/* ─── Install ─────────────────────────────────────────────────────── */

self.addEventListener('install', function (e) {
	e.waitUntil(
		caches.open(CACHE_NAME).then(function (cache) {
			// Core app shell — must succeed
			return cache.addAll(APP_SHELL).then(function () {
				// ln-acme components — cache individually, skip failures
				// (submodule may not be cloned in all environments)
				return Promise.all(
					LN_ACME.map(function (url) {
						return cache.add(url).catch(function () {
							// Silently skip — component not available
						});
					})
				);
			});
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

	// Skip blob: and data: URLs (audio blobs handled by IndexedDB)
	if (url.protocol === 'blob:' || url.protocol === 'data:') return;

	// Skip cross-origin requests
	if (url.origin !== self.location.origin) return;

	// API requests — network-first
	if (url.pathname.indexOf('/api/') !== -1) {
		e.respondWith(_networkFirst(e.request));
		return;
	}

	// Music files — skip (cached in IndexedDB by the app)
	if (url.pathname.indexOf('/music/') !== -1) return;

	// App shell — cache-first
	e.respondWith(_cacheFirst(e.request));
});

/* ─── Strategies ──────────────────────────────────────────────────── */

function _cacheFirst(request) {
	return caches.match(request).then(function (cached) {
		if (cached) {
			// Update cache in background (stale-while-revalidate)
			_updateCache(request);
			return cached;
		}
		return fetch(request).then(function (response) {
			if (response.ok) {
				var clone = response.clone();
				caches.open(CACHE_NAME).then(function (cache) {
					cache.put(request, clone);
				});
			}
			return response;
		});
	});
}

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

function _updateCache(request) {
	fetch(request).then(function (response) {
		if (response.ok) {
			caches.open(CACHE_NAME).then(function (cache) {
				cache.put(request, response);
			});
		}
	}).catch(function () {
		// Offline — skip background update
	});
}
