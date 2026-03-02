/* ====================================================================
   LN DJ Mixer — Data Transfer (Export / Import)
   Export profiles+settings as JSON, import from URL or file,
   batch-download audio for offline use.
   ==================================================================== */

(function () {
	'use strict';

	var _component = window._LnMixerComponent;
	if (!_component) return;

	var EXPORT_VERSION = 1;
	var EXPORT_APP = 'ln-dj-mixer';
	var EXPORT_FILENAME = 'ln-mixer-data.json';

	/* ─── Export ──────────────────────────────────────────────────── */

	_component.prototype._exportData = function () {
		Promise.all([
			lnDb.getAll('profiles'),
			lnDb.get('settings', 'app')
		]).then(function (results) {
			var profiles = results[0] || [];
			var settings = results[1] || {};

			var payload = {
				version: EXPORT_VERSION,
				exportedAt: new Date().toISOString(),
				app: EXPORT_APP,
				settings: {
					apiUrl: settings.apiUrl || '',
					brandLogo: settings.brandLogo || ''
				},
				profiles: profiles
			};

			var json = JSON.stringify(payload, null, 2);
			var blob = new Blob([json], { type: 'application/json' });
			var url = URL.createObjectURL(blob);

			var a = document.createElement('a');
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

	_component.prototype._validateImportData = function (data) {
		if (!data || typeof data !== 'object') return false;
		if (data.app !== EXPORT_APP) return false;
		if (typeof data.version !== 'number') return false;
		if (!Array.isArray(data.profiles)) return false;

		for (var i = 0; i < data.profiles.length; i++) {
			var p = data.profiles[i];
			if (!p.id || !p.name || typeof p.playlists !== 'object') return false;
		}
		return true;
	};

	/* ─── Import (shared core) ────────────────────────────────────── */

	_component.prototype._processImport = function (data) {
		var self = this;

		if (!this._validateImportData(data)) {
			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: { type: 'warn', message: 'Invalid data file' }
			}));
			return;
		}

		var settings = data.settings || {};
		var settingsRecord = {
			key: 'app',
			apiUrl: settings.apiUrl || '',
			brandLogo: settings.brandLogo || ''
		};

		var promises = [lnDb.put('settings', settingsRecord)];

		data.profiles.forEach(function (profile) {
			promises.push(lnDb.put('profiles', profile));
		});

		Promise.all(promises).then(function () {
			lnSettings.apply({
				apiUrl: settingsRecord.apiUrl,
				brandLogo: settingsRecord.brandLogo
			});

			self._loadProfiles();

			var urls = self._collectTrackUrls(data.profiles);

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

	_component.prototype._importFromUrl = function (url) {
		var self = this;

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

	_component.prototype._importFromFile = function (file) {
		var self = this;
		if (!file) return;

		var reader = new FileReader();
		reader.onload = function (ev) {
			try {
				var data = JSON.parse(ev.target.result);
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

	_component.prototype._collectTrackUrls = function (profiles) {
		var urlSet = {};
		profiles.forEach(function (p) {
			if (!p.playlists) return;
			for (var pid in p.playlists) {
				if (!p.playlists.hasOwnProperty(pid)) continue;
				var tracks = p.playlists[pid].tracks || [];
				for (var i = 0; i < tracks.length; i++) {
					if (tracks[i].url) urlSet[tracks[i].url] = true;
				}
			}
		});
		return Object.keys(urlSet);
	};

	/* ─── Batch Download Audio (sequential queue) ─────────────────── */

	_component.prototype._batchDownloadAudio = function () {
		var self = this;
		var nav = this._getNav();
		if (!nav || !nav.lnProfile) return;

		var allProfiles = [];
		var keys = Object.keys(nav.lnProfile.profiles);
		keys.forEach(function (id) {
			allProfiles.push(nav.lnProfile.profiles[id]);
		});

		var urls = this._collectTrackUrls(allProfiles);
		if (urls.length === 0) {
			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: { type: 'info', message: 'No tracks to download' }
			}));
			return;
		}

		lnDb.getAllKeys('audioFiles').then(function (cachedUrls) {
			var cachedSet = {};
			cachedUrls.forEach(function (u) { cachedSet[u] = true; });

			var uncached = urls.filter(function (u) { return !cachedSet[u]; });

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

			var completed = 0;
			var failed = 0;

			function downloadNext(idx) {
				if (idx >= uncached.length) {
					var msg = 'Download complete: ' + completed + ' cached';
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
	};

	/* ─── Transfer Status Display ─────────────────────────────────── */

	_component.prototype._updateTransferStatus = function (text) {
		var el = document.querySelector('[data-ln-transfer-status]');
		if (!el) return;
		el.textContent = text || '';
		el.hidden = !text;
	};

	/* ─── Event Bindings ──────────────────────────────────────────── */

	_component.prototype._bindTransferActions = function () {
		var self = this;

		document.addEventListener('click', function (e) {
			var btn;

			btn = e.target.closest('[data-ln-action="export-data"]');
			if (btn) {
				self._exportData();
				return;
			}

			btn = e.target.closest('[data-ln-action="import-file"]');
			if (btn) {
				var fileInput = document.querySelector('[data-ln-import-file]');
				if (fileInput) fileInput.click();
				return;
			}

			btn = e.target.closest('[data-ln-action="import-from-url"]');
			if (btn) {
				var urlInput = document.querySelector('[data-ln-field="import-url"]');
				var url = urlInput ? urlInput.value.trim() : '';
				self._importFromUrl(url);
				return;
			}

			btn = e.target.closest('[data-ln-action="batch-download"]');
			if (btn) {
				self._batchDownloadAudio();
				return;
			}
		});

		var fileInput = document.querySelector('[data-ln-import-file]');
		if (fileInput) {
			fileInput.addEventListener('change', function () {
				var file = fileInput.files[0];
				if (file) {
					self._importFromFile(file);
					fileInput.value = '';
				}
			});
		}
	};

})();
