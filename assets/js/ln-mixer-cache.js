/* ====================================================================
   LN DJ Mixer — Download & Cache
   Audio blob downloads, IDB cache, library actions, playlist actions
   ==================================================================== */

function _isFileProtocol() {
	return location.protocol === 'file:';
}

export function setupCache(mixer) {

	/* ─── Progress Bar ───────────────────────────────────────────── */

	mixer._getGlobalProgressBar = function () {
		return this.dom.querySelector('[data-ln-global-progress]');
	};

	mixer._updateGlobalProgress = function () {
		const bar = this._getGlobalProgressBar();
		if (!bar) return;

		const urls = Object.keys(this._downloadProgress);
		if (urls.length === 0) {
			bar.hidden = true;
			return;
		}

		let totalLoaded = 0;
		let totalSize = 0;

		for (let i = 0; i < urls.length; i++) {
			const entry = this._downloadProgress[urls[i]];
			totalLoaded += entry.loaded;
			totalSize += entry.total;
		}

		const pct = (totalSize > 0) ? Math.round((totalLoaded / totalSize) * 100) : 0;

		bar.hidden = false;
		const markEl = bar.querySelector('[data-ln-progress]');
		if (markEl) {
			markEl.setAttribute('data-ln-progress', String(pct));
		}
	};

	/* ─── Download Blob ──────────────────────────────────────────── */

	mixer._downloadBlob = function (url, callback) {
		const self = this;

		if (this._downloading[url]) {
			if (callback) callback(false);
			return;
		}

		this._downloading[url] = true;
		this._downloadProgress[url] = { loaded: 0, total: 0 };
		this._updateGlobalProgress();

		const libraryEl = this._getLibraryEl();
		if (libraryEl) {
			libraryEl.dispatchEvent(new CustomEvent('ln-library:request-download-start', {
				detail: { url: url }
			}));
		}

		const xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = 'blob';
		xhr.timeout = 120000;

		xhr.ontimeout = function () {
			delete self._downloading[url];
			delete self._downloadProgress[url];
			self._updateGlobalProgress();

			if (libraryEl) {
				libraryEl.dispatchEvent(new CustomEvent('ln-library:request-download-done', {
					detail: { url: url, success: false }
				}));
			}
			if (callback) callback(false);
		};

		xhr.onprogress = function (e) {
			if (e.lengthComputable) {
				self._downloadProgress[url] = { loaded: e.loaded, total: e.total };
				self._updateGlobalProgress();

				if (libraryEl) {
					const pct = (e.loaded / e.total) * 100;
					libraryEl.dispatchEvent(new CustomEvent('ln-library:request-download-progress', {
						detail: { url: url, percent: pct }
					}));
				}
			}
		};

		xhr.onload = function () {
			delete self._downloading[url];
			delete self._downloadProgress[url];

			if (xhr.status >= 200 && xhr.status < 300) {
				const blob = xhr.response;

				lnDb.put('audioFiles', {
					url: url,
					blob: blob,
					size: blob.size,
					timestamp: Date.now()
				}).then(function () {
					self._updateGlobalProgress();
					if (libraryEl) {
						libraryEl.dispatchEvent(new CustomEvent('ln-library:request-download-done', {
							detail: { url: url, success: true }
						}));
					}
					if (callback) callback(true);
				}).catch(function () {
					self._updateGlobalProgress();
					if (libraryEl) {
						libraryEl.dispatchEvent(new CustomEvent('ln-library:request-download-done', {
							detail: { url: url, success: false }
						}));
					}
					if (callback) callback(false);
				});
			} else {
				self._updateGlobalProgress();
				if (libraryEl) {
					libraryEl.dispatchEvent(new CustomEvent('ln-library:request-download-done', {
						detail: { url: url, success: false }
					}));
				}
				if (callback) callback(false);
			}
		};

		xhr.onerror = function () {
			delete self._downloading[url];
			delete self._downloadProgress[url];
			self._updateGlobalProgress();

			if (libraryEl) {
				libraryEl.dispatchEvent(new CustomEvent('ln-library:request-download-done', {
					detail: { url: url, success: false }
				}));
			}
			if (callback) callback(false);
		};

		xhr.send();
	};

	/* ─── Add Track Helpers ──────────────────────────────────────── */

	mixer._addTrackToPlaylist = function (sidebar, title, artist, url) {
		let duration = '';
		let durationSec = 0;

		// Check track catalog for existing duration
		if (url && sidebar.lnPlaylist && sidebar.lnPlaylist.trackCatalog) {
			const existing = sidebar.lnPlaylist.trackCatalog[url];
			if (existing && existing.durationSec > 0) {
				duration = existing.duration;
				durationSec = existing.durationSec;
			}
		}

		// Upsert track to tracks store
		if (url) {
			lnDb.get('tracks', url).then(function (record) {
				const trackRecord = record || { url: url };
				trackRecord.title = title;
				trackRecord.artist = artist;
				if (!trackRecord.duration && duration) trackRecord.duration = duration;
				if (!trackRecord.durationSec && durationSec) trackRecord.durationSec = durationSec;
				return lnDb.put('tracks', trackRecord);
			}).catch(function (err) {
				console.warn('[ln-mixer-cache] Failed to persist track metadata:', err);
			});
		}

		sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-add-track', {
			detail: {
				title: title,
				artist: artist,
				duration: duration,
				durationSec: durationSec,
				url: url
			}
		}));
	};

	mixer._showAddFeedback = function (btn) {
		btn.textContent = 'Added!';
		btn.disabled = true;
		setTimeout(function () {
			btn.textContent = 'Add';
			btn.disabled = false;
		}, 1200);
	};

	mixer._downloadAndCache = function (url, title, artist, sidebar, btn) {
		const self = this;

		this._downloadBlob(url, function (success) {
			self._addTrackToPlaylist(sidebar, title, artist, url);
			self._showAddFeedback(btn);

			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: success
					? { type: 'success', message: 'Track downloaded' }
					: { type: 'warn', message: 'Download failed — using remote URL' }
			}));
		});
	};

	/* ─── Load Track to Deck (cache-aware) ───────────────────────── */

	mixer._loadTrackToDeck = function (deckId, trackIndex, track) {
		const self = this;
		const deckEl = this._getDeck(deckId);
		if (!deckEl) return;

		const trackUrl = track ? track.url : '';

		if (!trackUrl) {
			deckEl.dispatchEvent(new CustomEvent('ln-deck:request-load', {
				detail: { trackIndex: trackIndex, track: track }
			}));
			return;
		}

		// Revoke previous blob URL for this deck
		if (self._blobUrls[deckId]) {
			URL.revokeObjectURL(self._blobUrls[deckId]);
			delete self._blobUrls[deckId];
		}

		const waveformEl = deckEl.querySelector('[data-ln-waveform]');

		function _dispatchLoad(loadTrack, peaks, peaksDuration) {
			if (waveformEl) waveformEl.classList.remove('waveform--decoding');
			deckEl.dispatchEvent(new CustomEvent('ln-deck:request-load', {
				detail: { trackIndex: trackIndex, track: loadTrack, peaks: peaks, peaksDuration: peaksDuration }
			}));
		}

		// Resolve from cache: blob from audioFiles, peaks from tracks store
		Promise.all([
			lnDb.get('audioFiles', trackUrl),
			lnDb.get('tracks', trackUrl)
		]).then(function (results) {
			const cached = results[0];
			const trackRecord = results[1];
			const loadTrack = Object.assign({}, track);
			loadTrack._originalUrl = trackUrl;

			let peaks = null;
			let peaksDuration = 0;
			let hasCachedBlob = false;

			// Peaks from tracks store
			if (trackRecord && trackRecord.peaks && trackRecord.peaksDuration) {
				peaks = trackRecord.peaks;
				peaksDuration = trackRecord.peaksDuration;
			}

			// Blob from audioFiles
			if (cached && cached.blob) {
				hasCachedBlob = true;
				loadTrack.url = URL.createObjectURL(cached.blob);
				self._blobUrls[deckId] = loadTrack.url;
			}

			// Cached blob but no peaks → extract before loading
			if (hasCachedBlob && !peaks) {
				if (waveformEl) waveformEl.classList.add('waveform--decoding');

				self._extractPeaksFromBlob(cached.blob).then(function (result) {
					// Persist peaks to tracks store
					lnDb.get('tracks', trackUrl).then(function (record) {
						if (record) {
							record.peaks = result.peaks;
							record.peaksDuration = result.duration;
							lnDb.put('tracks', record);
						}
					});
					_dispatchLoad(loadTrack, result.peaks, result.duration);
				}).catch(function () {
					// Decode failed — load without peaks (WaveSurfer will decode)
					_dispatchLoad(loadTrack, null, 0);
				});
				return;
			}

			_dispatchLoad(loadTrack, peaks, peaksDuration);

			// Cache miss + remote URL → re-download in background
			if (!hasCachedBlob && trackUrl && !_isFileProtocol() && !self._downloading[trackUrl]) {
				self._downloadBlob(trackUrl, function (success) {
					if (success) {
						window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
							detail: { type: 'info', message: 'Track re-cached' }
						}));
					}
				});
			}
		}).catch(function () {
			// IDB error — fall back to remote URL, no peaks
			deckEl.dispatchEvent(new CustomEvent('ln-deck:request-load', {
				detail: { trackIndex: trackIndex, track: track }
			}));
		});
	};

	/* ─── Cache Info ─────────────────────────────────────────────── */

	mixer._updateCacheInfo = function () {
		const output = document.querySelector('[data-ln-cache-size]');
		if (!output) return;

		lnDb.getAll('audioFiles').then(function (records) {
			if (!records || records.length === 0) {
				output.textContent = 'No cached tracks';
				return;
			}
			let totalBytes = 0;
			records.forEach(function (r) { totalBytes += (r.size || 0); });

			let sizeLabel;
			if (totalBytes < 1024 * 1024) {
				sizeLabel = Math.round(totalBytes / 1024) + ' KB';
			} else {
				sizeLabel = (totalBytes / (1024 * 1024)).toFixed(1) + ' MB';
			}

			output.textContent = records.length + (records.length === 1 ? ' track' : ' tracks') + ' (' + sizeLabel + ')';
		}).catch(function () {
			output.textContent = 'Unable to read cache';
		});
	};

	/* ─── Global Event Bindings ──────────────────────────────────── */

	mixer._bindPlaylistActions = function () {
		const self = this;

		// Open new-playlist dialog
		document.addEventListener('click', function (e) {
			if (e.target.closest('[data-ln-action="new-playlist"]')) {
				const sidebar = self._getSidebar();
				if (!sidebar || !sidebar.lnPlaylist || !sidebar.lnPlaylist.playlists) {
					window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
						detail: { type: 'warn', message: 'Create a profile first' }
					}));
					return;
				}
				lnModal.open('modal-new-playlist');
			}
		});

		// Open library dialog → fetch tracks + open modal
		document.addEventListener('click', function (e) {
			if (e.target.closest('[data-ln-action="open-library"]')) {
				const libraryEl = self._getLibraryEl();
				if (libraryEl) {
					libraryEl.dispatchEvent(new CustomEvent('ln-library:request-fetch', {
						detail: { apiUrl: lnSettings.getApiUrl() }
					}));
				}
				lnModal.open('modal-track-library');
			}
		});

		// Remove track (from edit dialog)
		document.addEventListener('click', function (e) {
			if (e.target.closest('[data-ln-action="remove-track"]')) {
				const form = document.querySelector('[data-ln-form="edit-track"]');
				if (!form) return;
				const idx = parseInt(form.getAttribute('data-ln-track-index'), 10);
				const playlistId = form.getAttribute('data-ln-playlist-id');
				if (idx < 0 || !playlistId) return;

				const sidebar = self._getSidebar();
				if (sidebar) {
					sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-remove-track', {
						detail: { index: idx, playlistId: playlistId }
					}));
				}
			}
		});

		// Remove playlist — open confirmation modal
		document.addEventListener('click', function (e) {
			const btn = e.target.closest('[data-ln-action="remove-playlist"]');
			if (!btn) return;

			e.stopPropagation();

			const playlistId = btn.getAttribute('data-ln-playlist-id');
			if (!playlistId) return;

			const sidebar = self._getSidebar();
			if (!sidebar || !sidebar.lnPlaylist) return;

			const playlist = sidebar.lnPlaylist.playlists[playlistId];
			if (!playlist) return;

			const form = document.querySelector('[data-ln-form="confirm-delete-playlist"]');
			if (form) form.setAttribute('data-ln-playlist-id', playlistId);

			const msgEl = document.querySelector('[data-ln-field="confirm-delete-message"]');
			if (msgEl) {
				const trackCount = playlist.segments.length;
				msgEl.textContent = 'Delete playlist \u201C' + playlist.name + '\u201D? This removes ' +
					trackCount + (trackCount === 1 ? ' track.' : ' tracks.');
			}

			lnModal.open('modal-confirm-delete-playlist');
		});

		// Confirm delete playlist
		document.addEventListener('ln-form:submit', function (e) {
			if (e.target.getAttribute('data-ln-form') !== 'confirm-delete-playlist') return;

			const form = e.target;
			const playlistId = form.getAttribute('data-ln-playlist-id');
			if (!playlistId) return;

			const sidebar = self._getSidebar();
			if (sidebar) {
				sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-remove-playlist', {
					detail: { playlistId: playlistId }
				}));
			}

			lnModal.close('modal-confirm-delete-playlist');
		});

		// Add track to playlist (from library dialog) — download-aware
		document.addEventListener('click', function (e) {
			const btn = e.target.closest('[data-ln-action="add-to-playlist"]');
			if (!btn) return;

			const title = btn.getAttribute('data-track-title');
			const artist = btn.getAttribute('data-track-artist');
			const url = btn.getAttribute('data-track-url') || '';
			if (!title) return;

			const sidebar = self._getSidebar();
			if (!sidebar || !sidebar.lnPlaylist || !sidebar.lnPlaylist.getPlaylist()) {
				window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
					detail: { type: 'warn', message: 'Select a playlist first' }
				}));
				return;
			}

			// No URL — add metadata-only immediately
			if (!url) {
				self._addTrackToPlaylist(sidebar, title, artist, '');
				self._showAddFeedback(btn);
				return;
			}

			// Prevent double download
			if (self._downloading[url]) return;

			// file:// — cannot XHR download blobs, add track with remote URL directly
			if (_isFileProtocol()) {
				if (!self._fileProtocolWarned) {
					self._fileProtocolWarned = true;
					window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
						detail: { type: 'info', message: 'Offline caching unavailable (file:// mode)' }
					}));
				}
				self._addTrackToPlaylist(sidebar, title, artist, url);
				self._showAddFeedback(btn);
				return;
			}

			// Check cache first
			lnDb.get('audioFiles', url).then(function (cached) {
				if (cached) {
					// Already cached — add immediately
					self._addTrackToPlaylist(sidebar, title, artist, url);
					self._showAddFeedback(btn);
				} else {
					// Download, cache, then add
					self._downloadAndCache(url, title, artist, sidebar, btn);
				}
			}).catch(function () {
				// IDB error — fall back to remote URL
				self._addTrackToPlaylist(sidebar, title, artist, url);
				self._showAddFeedback(btn);
			});
		});

		// Create playlist from form submit
		document.addEventListener('ln-form:submit', function (e) {
			if (e.target.getAttribute('data-ln-form') !== 'new-playlist') return;

			const input = document.querySelector('[data-ln-field="new-playlist-name"]');
			const name = input ? input.value.trim() : '';
			if (!name) {
				if (input) input.focus();
				return;
			}

			const sidebar = self._getSidebar();
			if (sidebar) {
				sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-create', {
					detail: { name: name }
				}));
			}

			input.value = '';
			lnModal.close('modal-new-playlist');
		});

		// Edit track from form submit
		document.addEventListener('ln-form:submit', function (e) {
			if (e.target.getAttribute('data-ln-form') !== 'edit-track') return;

			const form = e.target;
			const idx = parseInt(form.getAttribute('data-ln-track-index'), 10);
			const playlistId = form.getAttribute('data-ln-playlist-id');
			if (idx < 0 || !playlistId) return;

			const notesInput = document.querySelector('[data-ln-field="edit-track-notes"]');
			const notes = notesInput ? notesInput.value.trim() : '';

			const sidebar = self._getSidebar();
			if (sidebar) {
				sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-edit-track', {
					detail: { index: idx, playlistId: playlistId, notes: notes }
				}));
			}
		});
	};

	mixer._bindLibraryReactions = function () {
		const self = this;

		document.addEventListener('ln-library:error', function (e) {
			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: { type: 'warn', message: e.detail.message || 'Library error' }
			}));
		});

		// Library fetched → mark cached tracks
		document.addEventListener('ln-library:fetched', function () {
			lnDb.getAllKeys('audioFiles').then(function (cachedUrls) {
				const libraryEl = self._getLibraryEl();
				if (libraryEl) {
					libraryEl.dispatchEvent(new CustomEvent('ln-library:request-mark-cached', {
						detail: { cachedUrls: cachedUrls }
					}));
				}
			});
		});
	};

	mixer._bindCacheActions = function () {
		const self = this;

		// Remove single cached track
		document.addEventListener('click', function (e) {
			const btn = e.target.closest('[data-ln-action="remove-cached"]');
			if (!btn) return;

			const li = btn.closest('[data-ln-library-track]');
			if (!li) return;

			const addBtn = li.querySelector('[data-ln-action="add-to-playlist"]');
			const url = addBtn ? addBtn.getAttribute('data-track-url') : '';
			if (!url) return;

			lnDb.delete('audioFiles', url).then(function () {
				const libraryEl = self._getLibraryEl();
				if (libraryEl) {
					libraryEl.dispatchEvent(new CustomEvent('ln-library:request-uncache', {
						detail: { url: url }
					}));
				}
				window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
					detail: { type: 'info', message: 'Track removed from cache' }
				}));
			});
		});

		// Clear all cached audio
		document.addEventListener('click', function (e) {
			if (!e.target.closest('[data-ln-action="clear-audio-cache"]')) return;

			lnDb.clear('audioFiles').then(function () {
				// Revoke any active blob URLs
				const decks = self.dom.querySelectorAll('[data-ln-deck]');
				decks.forEach(function (deckEl) {
					const id = deckEl.getAttribute('data-ln-deck');
					if (self._blobUrls[id]) {
						URL.revokeObjectURL(self._blobUrls[id]);
						delete self._blobUrls[id];
					}
				});

				const libraryEl = self._getLibraryEl();
				if (libraryEl) {
					libraryEl.dispatchEvent(new CustomEvent('ln-library:request-clear-all-cached'));
				}

				self._updateCacheInfo();

				window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
					detail: { type: 'info', message: 'Audio cache cleared' }
				}));
			});
		});
	};

}
