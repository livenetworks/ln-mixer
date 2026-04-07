const DOM_ATTRIBUTE = 'lnDb';

if (!window[DOM_ATTRIBUTE]) {

	const DB_NAME = 'lnDjMixer';
	const DB_VERSION = 3;
	let _db = null;
	let _opening = null;

	function open() {
		if (_db) return Promise.resolve(_db);
		if (_opening) return _opening;

		_opening = new Promise(function (resolve, reject) {
			const req = indexedDB.open(DB_NAME, DB_VERSION);

			req.onupgradeneeded = function (e) {
				const d = e.target.result;
				const tx = e.target.transaction;

				/* ── v1/v2 stores ─────────────────────────────── */
				if (!d.objectStoreNames.contains('profiles')) {
					d.createObjectStore('profiles', { keyPath: 'id' });
				}
				if (!d.objectStoreNames.contains('settings')) {
					d.createObjectStore('settings', { keyPath: 'key' });
				}
				if (!d.objectStoreNames.contains('audioFiles')) {
					d.createObjectStore('audioFiles', { keyPath: 'url' });
				}

				/* ── v3 stores ────────────────────────────────── */
				let tracksStore;
				if (!d.objectStoreNames.contains('tracks')) {
					tracksStore = d.createObjectStore('tracks', { keyPath: 'url' });
				} else {
					tracksStore = tx.objectStore('tracks');
				}

				if (!d.objectStoreNames.contains('playlists')) {
					const playlistStore = d.createObjectStore('playlists', { keyPath: 'id' });
					playlistStore.createIndex('profileId', 'profileId', { unique: false });
				}

				/* ── v2 → v3 migration ────────────────────────── */
				if (e.oldVersion < 3 && e.newVersion >= 3) {
					_migrateV2toV3(tx, tracksStore);
				}
			};

			req.onsuccess = function (e) {
				_db = e.target.result;
				resolve(_db);
			};

			req.onerror = function (e) {
				_opening = null;
				reject(e.target.error);
			};
		});

		return _opening;
	}

	/* ── Migration: extract tracks + playlists from profiles ───── */

	function _migrateV2toV3(tx, tracksStore) {
		const profileStore = tx.objectStore('profiles');
		const playlistStore = tx.objectStore('playlists');
		const audioStore = tx.objectStore('audioFiles');

		const seenTrackUrls = {};
		const seenPlaylistIds = {};

		/* Pass 1: profiles → extract tracks + playlists */
		const cursorReq = profileStore.openCursor();
		cursorReq.onsuccess = function (ev) {
			const cursor = ev.target.result;
			if (!cursor) {
				/* Pass 2: move peaks from audioFiles → tracks */
				_migratePeaks(audioStore, tracksStore);
				return;
			}

			const profile = cursor.value;

			if (profile.playlists && typeof profile.playlists === 'object') {
				for (const pid in profile.playlists) {
					if (!profile.playlists.hasOwnProperty(pid)) continue;
					const pl = profile.playlists[pid];
					const tracks = pl.tracks || [];

					/* Extract unique tracks to catalog */
					const segments = [];
					for (let i = 0; i < tracks.length; i++) {
						const t = tracks[i];
						if (t.url && !seenTrackUrls[t.url]) {
							seenTrackUrls[t.url] = true;
							tracksStore.put({
								url: t.url,
								title: t.title || '',
								artist: t.artist || '',
								duration: t.duration || '',
								durationSec: t.durationSec || 0
							});
						}

						segments.push({
							url: t.url || '',
							notes: t.notes || '',
							loops: t.loops || []
						});
					}

					/* Globally unique playlist ID */
					let globalId = profile.id + '--' + pid;
					if (seenPlaylistIds[globalId]) {
						globalId = globalId + '-' + Date.now().toString(36);
					}
					seenPlaylistIds[globalId] = true;

					playlistStore.put({
						id: globalId,
						profileId: profile.id,
						name: pl.name,
						segments: segments
					});
				}
			}

			/* Slim the profile */
			cursor.update({ id: profile.id, name: profile.name });
			cursor.continue();
		};
	}

	function _migratePeaks(audioStore, tracksStore) {
		const peakCursor = audioStore.openCursor();
		peakCursor.onsuccess = function (ev) {
			const cursor = ev.target.result;
			if (!cursor) return;

			const record = cursor.value;
			if (record.peaks && record.peaksDuration) {
				/* Copy peaks to tracks store (merge with existing) */
				const getReq = tracksStore.get(record.url);
				getReq.onsuccess = function () {
					const trackRecord = getReq.result;
					if (trackRecord) {
						trackRecord.peaks = record.peaks;
						trackRecord.peaksDuration = record.peaksDuration;
						tracksStore.put(trackRecord);
					} else {
						/* Track not in catalog yet (peaks for uncatalogued file) */
						tracksStore.put({
							url: record.url,
							title: '',
							artist: '',
							duration: '',
							durationSec: 0,
							peaks: record.peaks,
							peaksDuration: record.peaksDuration
						});
					}
				};

				/* Strip peaks from audioFiles */
				delete record.peaks;
				delete record.peaksDuration;
				cursor.update(record);
			}

			cursor.continue();
		};
	}

	/* ── DB helpers ────────────────────────────────────────────── */

	function _ensureDb() {
		if (_db) return Promise.resolve(_db);
		return open();
	}

	function get(storeName, key) {
		return _ensureDb().then(function () {
			return new Promise(function (resolve, reject) {
				const tx = _db.transaction(storeName, 'readonly');
				const store = tx.objectStore(storeName);
				const req = store.get(key);
				req.onsuccess = function () { resolve(req.result || null); };
				req.onerror = function () { reject(req.error); };
			});
		});
	}

	function getAll(storeName) {
		return _ensureDb().then(function () {
			return new Promise(function (resolve, reject) {
				const tx = _db.transaction(storeName, 'readonly');
				const store = tx.objectStore(storeName);
				const req = store.getAll();
				req.onsuccess = function () { resolve(req.result || []); };
				req.onerror = function () { reject(req.error); };
			});
		});
	}

	function getAllKeys(storeName) {
		return _ensureDb().then(function () {
			return new Promise(function (resolve, reject) {
				const tx = _db.transaction(storeName, 'readonly');
				const store = tx.objectStore(storeName);
				const req = store.getAllKeys();
				req.onsuccess = function () { resolve(req.result || []); };
				req.onerror = function () { reject(req.error); };
			});
		});
	}

	function getAllByIndex(storeName, indexName, value) {
		return _ensureDb().then(function () {
			return new Promise(function (resolve, reject) {
				const tx = _db.transaction(storeName, 'readonly');
				const store = tx.objectStore(storeName);
				const index = store.index(indexName);
				const req = index.getAll(value);
				req.onsuccess = function () { resolve(req.result || []); };
				req.onerror = function () { reject(req.error); };
			});
		});
	}

	function deleteByIndex(storeName, indexName, value) {
		return _ensureDb().then(function () {
			return new Promise(function (resolve, reject) {
				const tx = _db.transaction(storeName, 'readwrite');
				const store = tx.objectStore(storeName);
				const index = store.index(indexName);
				const req = index.openCursor(IDBKeyRange.only(value));
				req.onsuccess = function (ev) {
					const cursor = ev.target.result;
					if (cursor) {
						cursor.delete();
						cursor.continue();
					}
				};
				tx.oncomplete = function () { resolve(); };
				tx.onerror = function () { reject(tx.error); };
			});
		});
	}

	function put(storeName, value) {
		return _ensureDb().then(function () {
			return new Promise(function (resolve, reject) {
				const tx = _db.transaction(storeName, 'readwrite');
				const store = tx.objectStore(storeName);
				const req = store.put(value);
				req.onsuccess = function () { resolve(); };
				req.onerror = function () { reject(req.error); };
			});
		});
	}

	function del(storeName, key) {
		return _ensureDb().then(function () {
			return new Promise(function (resolve, reject) {
				const tx = _db.transaction(storeName, 'readwrite');
				const store = tx.objectStore(storeName);
				const req = store.delete(key);
				req.onsuccess = function () { resolve(); };
				req.onerror = function () { reject(req.error); };
			});
		});
	}

	function clear(storeName) {
		return _ensureDb().then(function () {
			return new Promise(function (resolve, reject) {
				const tx = _db.transaction(storeName, 'readwrite');
				const store = tx.objectStore(storeName);
				const req = store.clear();
				req.onsuccess = function () { resolve(); };
				req.onerror = function () { reject(req.error); };
			});
		});
	}

	window[DOM_ATTRIBUTE] = {
		open: open,
		get: get,
		getAll: getAll,
		getAllKeys: getAllKeys,
		getAllByIndex: getAllByIndex,
		deleteByIndex: deleteByIndex,
		put: put,
		delete: del,
		clear: clear
	};

}
