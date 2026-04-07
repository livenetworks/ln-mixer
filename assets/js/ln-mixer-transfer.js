/* ====================================================================
   LN DJ Mixer — Data Transfer (Export / Import)
   Export profiles+tracks+playlists+settings as JSON, import from URL
   or file, batch-download audio for offline use.
   ==================================================================== */

const EXPORT_VERSION = 2;
const EXPORT_APP = 'ln-dj-mixer';
const EXPORT_FILENAME = 'ln-mixer-data.json';

export function setupTransfer(mixer) {

	/* ─── Export ──────────────────────────────────────────────────── */

	mixer._exportData = function () {
		Promise.all([
			lnDb.getAll('profiles'),
			lnDb.getAll('tracks'),
			lnDb.getAll('playlists'),
			lnDb.get('settings', 'app')
		]).then(function (results) {
			const profiles = results[0] || [];
			const tracks = results[1] || [];
			const playlists = results[2] || [];
			const settings = results[3] || {};

			// Strip peaks from export (too large, regenerated from audio)
			const exportTracks = tracks.map(function (t) {
				return {
					url: t.url,
					title: t.title || '',
					artist: t.artist || '',
					duration: t.duration || '',
					durationSec: t.durationSec || 0
				};
			});

			const payload = {
				version: EXPORT_VERSION,
				exportedAt: new Date().toISOString(),
				app: EXPORT_APP,
				settings: {
					apiUrl: settings.apiUrl || '',
					brandLogo: settings.brandLogo || ''
				},
				profiles: profiles,
				tracks: exportTracks,
				playlists: playlists
			};

			const json = JSON.stringify(payload, null, 2);
			const blob = new Blob([json], { type: 'application/json' });
			const url = URL.createObjectURL(blob);

			const a = document.createElement('a');
			a.href = url;
			a.download = EXPORT_FILENAME;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: { type: 'success', message: 'Data exported' }
			}));
		}).catch(function (err) {
			console.error('Export failed:', err);
			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: { type: 'warn', message: 'Export failed' }
			}));
		});
	};

	/* ─── Validate ────────────────────────────────────────────────── */

	mixer._validateImportData = function (data) {
		if (!data || typeof data !== 'object') return false;
		if (data.app !== EXPORT_APP) return false;
		if (typeof data.version !== 'number') return false;
		if (!Array.isArray(data.profiles)) return false;

		if (data.version === 1) {
			// v1: profiles have nested playlists
			for (let i = 0; i < data.profiles.length; i++) {
				const p = data.profiles[i];
				if (!p.id || !p.name || typeof p.playlists !== 'object') return false;
			}
		} else if (data.version >= 2) {
			// v2: slim profiles, separate tracks + playlists
			for (let j = 0; j < data.profiles.length; j++) {
				if (!data.profiles[j].id || !data.profiles[j].name) return false;
			}
			if (!Array.isArray(data.tracks)) return false;
			if (!Array.isArray(data.playlists)) return false;
		}

		return true;
	};

	/* ─── Import (shared core) ────────────────────────────────────── */

	mixer._processImport = function (data) {
		const self = this;

		if (!this._validateImportData(data)) {
			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: { type: 'warn', message: 'Invalid data file' }
			}));
			return;
		}

		const settings = data.settings || {};
		const settingsRecord = {
			key: 'app',
			apiUrl: settings.apiUrl || '',
			brandLogo: settings.brandLogo || ''
		};

		const promises = [lnDb.put('settings', settingsRecord)];

		if (data.version === 1) {
			// v1 import: extract tracks + segments from nested profiles
			const seenUrls = {};

			data.profiles.forEach(function (profile) {
				// Slim profile
				promises.push(lnDb.put('profiles', { id: profile.id, name: profile.name }));

				const playlists = profile.playlists || {};
				for (const pid in playlists) {
					if (!playlists.hasOwnProperty(pid)) continue;
					const pl = playlists[pid];
					const tracks = pl.tracks || [];

					// Extract unique tracks
					const segments = [];
					for (let i = 0; i < tracks.length; i++) {
						const t = tracks[i];
						if (t.url && !seenUrls[t.url]) {
							seenUrls[t.url] = true;
							promises.push(lnDb.put('tracks', {
								url: t.url,
								title: t.title || '',
								artist: t.artist || '',
								duration: t.duration || '',
								durationSec: t.durationSec || 0
							}));
						}
						segments.push({
							url: t.url || '',
							notes: t.notes || '',
							loops: t.loops || []
						});
					}

					const globalId = profile.id + '--' + pid;
					promises.push(lnDb.put('playlists', {
						id: globalId,
						profileId: profile.id,
						name: pl.name,
						segments: segments
					}));
				}
			});
		} else {
			// v2 import: profiles, tracks, playlists are already separate
			data.profiles.forEach(function (profile) {
				promises.push(lnDb.put('profiles', profile));
			});

			(data.tracks || []).forEach(function (track) {
				promises.push(lnDb.put('tracks', track));
			});

			(data.playlists || []).forEach(function (playlist) {
				promises.push(lnDb.put('playlists', playlist));
			});
		}

		Promise.all(promises).then(function () {
			lnSettings.apply({
				apiUrl: settingsRecord.apiUrl,
				brandLogo: settingsRecord.brandLogo
			});

			self._loadProfiles();

			const urls = self._collectTrackUrls(data);

			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: {
					type: 'success',
					message: 'Imported ' + data.profiles.length + ' profile' +
						(data.profiles.length !== 1 ? 's' : '')
				}
			}));

			if (urls.length > 0) {
				self._updateTransferStatus(
					urls.length + ' track' + (urls.length !== 1 ? 's' : '') + ' need audio download'
				);
			}
		}).catch(function (err) {
			console.error('Import failed:', err);
			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: { type: 'warn', message: 'Import failed' }
			}));
		});
	};

	/* ─── Import from URL ─────────────────────────────────────────── */

	mixer._importFromUrl = function (url) {
		const self = this;

		if (!url) {
			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: { type: 'warn', message: 'Enter a URL' }
			}));
			return;
		}

		self._updateTransferStatus('Downloading...');

		fetch(url).then(function (response) {
			if (!response.ok) throw new Error('HTTP ' + response.status);
			return response.json();
		}).then(function (data) {
			self._updateTransferStatus('');
			self._processImport(data);
		}).catch(function (err) {
			console.error('Import from URL failed:', err);
			self._updateTransferStatus('');
			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: { type: 'warn', message: 'Failed to fetch: ' + err.message }
			}));
		});
	};

	/* ─── Import from File ────────────────────────────────────────── */

	mixer._importFromFile = function (file) {
		const self = this;
		if (!file) return;

		const reader = new FileReader();
		reader.onload = function (ev) {
			try {
				const data = JSON.parse(ev.target.result);
				self._processImport(data);
			} catch (err) {
				window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
					detail: { type: 'warn', message: 'Invalid JSON file' }
				}));
			}
		};
		reader.onerror = function () {
			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: { type: 'warn', message: 'Failed to read file' }
			}));
		};
		reader.readAsText(file);
	};

	/* ─── Collect Track URLs ──────────────────────────────────────── */

	mixer._collectTrackUrls = function (data) {
		const urlSet = {};

		if (data.version === 1) {
			// v1: playlists nested in profiles
			(data.profiles || []).forEach(function (p) {
				if (!p.playlists) return;
				for (const pid in p.playlists) {
					if (!p.playlists.hasOwnProperty(pid)) continue;
					const tracks = p.playlists[pid].tracks || [];
					for (let i = 0; i < tracks.length; i++) {
						if (tracks[i].url) urlSet[tracks[i].url] = true;
					}
				}
			});
		} else {
			// v2: tracks as top-level array
			(data.tracks || []).forEach(function (t) {
				if (t.url) urlSet[t.url] = true;
			});
		}

		return Object.keys(urlSet);
	};

	/* ─── Batch Download Audio (sequential queue) ─────────────────── */

	mixer._batchDownloadAudio = function () {
		const self = this;

		// Collect all track URLs from tracks store
		lnDb.getAll('tracks').then(function (allTracks) {
			const urls = [];
			allTracks.forEach(function (t) {
				if (t.url) urls.push(t.url);
			});

			if (urls.length === 0) {
				window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
					detail: { type: 'info', message: 'No tracks to download' }
				}));
				return;
			}

			return lnDb.getAllKeys('audioFiles').then(function (cachedUrls) {
				const cachedSet = {};
				cachedUrls.forEach(function (u) { cachedSet[u] = true; });

				const uncached = urls.filter(function (u) { return !cachedSet[u]; });

				if (uncached.length === 0) {
					window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
						detail: { type: 'info', message: 'All tracks already cached' }
					}));
					return;
				}

				window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
					detail: {
						type: 'info',
						message: 'Downloading ' + uncached.length + ' track' +
							(uncached.length !== 1 ? 's' : '') + '...'
					}
				}));

				let completed = 0;
				let failed = 0;

				function downloadNext(idx) {
					if (idx >= uncached.length) {
						let msg = 'Download complete: ' + completed + ' cached';
						if (failed > 0) msg += ', ' + failed + ' failed';
						self._updateTransferStatus('');
						self._updateCacheInfo();
						window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
							detail: { type: completed > 0 ? 'success' : 'warn', message: msg }
						}));
						return;
					}

					self._updateTransferStatus(
						'Downloading ' + (idx + 1) + '/' + uncached.length + '...'
					);

					self._downloadBlob(uncached[idx], function (success) {
						if (success) completed++;
						else failed++;
						downloadNext(idx + 1);
					});
				}

				downloadNext(0);
			});
		});
	};

	/* ─── Transfer Status Display ─────────────────────────────────── */

	mixer._updateTransferStatus = function (text) {
		const el = document.querySelector('[data-ln-transfer-status]');
		if (!el) return;
		el.textContent = text || '';
		el.hidden = !text;
	};

	/* ─── Event Bindings ──────────────────────────────────────────── */

	mixer._bindTransferActions = function () {
		const self = this;

		document.addEventListener('click', function (e) {
			let btn;

			btn = e.target.closest('[data-ln-action="export-data"]');
			if (btn) {
				self._exportData();
				return;
			}

			btn = e.target.closest('[data-ln-action="import-file"]');
			if (btn) {
				const fileInput = document.querySelector('[data-ln-import-file]');
				if (fileInput) fileInput.click();
				return;
			}

			btn = e.target.closest('[data-ln-action="import-from-url"]');
			if (btn) {
				const urlInput = document.querySelector('[data-ln-field="import-url"]');
				const url = urlInput ? urlInput.value.trim() : '';
				self._importFromUrl(url);
				return;
			}

			btn = e.target.closest('[data-ln-action="batch-download"]');
			if (btn) {
				self._batchDownloadAudio();
				return;
			}
		});

		const fileInput = document.querySelector('[data-ln-import-file]');
		if (fileInput) {
			fileInput.addEventListener('change', function () {
				const file = fileInput.files[0];
				if (file) {
					self._importFromFile(file);
					fileInput.value = '';
				}
			});
		}
	};

}
