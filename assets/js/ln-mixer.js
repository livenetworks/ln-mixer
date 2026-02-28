(function () {
	'use strict';

	var DOM_SELECTOR = 'data-ln-mixer';
	var DOM_ATTRIBUTE = 'lnMixer';

	if (window[DOM_ATTRIBUTE] !== undefined) return;

	function _isFileProtocol() {
		return location.protocol === 'file:';
	}

	function _formatTime(seconds) {
		var m = Math.floor(seconds / 60);
		var s = Math.floor(seconds % 60);
		return m + ':' + (s < 10 ? '0' : '') + s;
	}

	/* ─── Constructor ─────────────────────────────────────────────── */

	function constructor(domRoot) {
		_findElements(domRoot);
	}

	function _findElements(root) {
		var items = Array.from(root.querySelectorAll('[' + DOM_SELECTOR + ']'));
		if (root.hasAttribute && root.hasAttribute(DOM_SELECTOR)) {
			items.push(root);
		}
		items.forEach(function (el) {
			if (!el[DOM_ATTRIBUTE]) {
				el[DOM_ATTRIBUTE] = new _component(el);
			}
		});
	}

	/* ─── Component ───────────────────────────────────────────────── */

	function _component(dom) {
		this.dom = dom;
		dom[DOM_ATTRIBUTE] = this;

		this._pendingLogo = null;

		// Audio routing
		this._audioCtx = null;
		this._masterGain = null;

		// Audio cache
		this._downloading = {};       // url → true (prevent duplicate downloads)
		this._downloadProgress = {};  // url → { loaded, total } (aggregate progress)
		this._blobUrls = {};          // deckId → blobUrl (for revokeObjectURL cleanup)
		this._fileProtocolWarned = false;

		this._bindScopedEvents();
		this._bindGlobalEvents();
		this._loadProfiles();

		return this;
	}

	/* ─── Init ────────────────────────────────────────────────────── */

	_component.prototype._loadProfiles = function () {
		var self = this;
		lnDb.open().then(function () {
			return lnDb.getAll('profiles');
		}).then(function (profiles) {
			var nav = self._getNav();
			if (nav) {
				nav.dispatchEvent(new CustomEvent('ln-profile:request-hydrate', {
					detail: { profiles: profiles }
				}));
			}
		});
	};

	/* ─── Empty State (coordinator owns UI visibility) ───────────── */

	_component.prototype._updateEmptyState = function () {
		var nav = this._getNav();
		var hasProfiles = nav && nav.lnProfile && Object.keys(nav.lnProfile.profiles).length > 0;

		var emptyState = this.dom.querySelector('[data-ln-empty-state]');
		var decksPanel = this.dom.querySelector('.decks-panel');
		var sidebar = this._getSidebar();

		if (emptyState) emptyState.hidden = hasProfiles;
		if (decksPanel) decksPanel.hidden = !hasProfiles;
		if (sidebar) sidebar.hidden = !hasProfiles;
	};

	/* ─── Child Component Queries (scoped to this.dom) ───────────── */

	_component.prototype._getNav = function () {
		return this.dom.querySelector('[data-ln-profile]');
	};

	_component.prototype._getSidebar = function () {
		return this.dom.querySelector('[data-ln-playlist]');
	};

	_component.prototype._getDeck = function (deckId) {
		return this.dom.querySelector('[data-ln-deck="' + deckId + '"]');
	};

	_component.prototype._getLibraryEl = function () {
		return document.querySelector('[data-ln-library]');
	};

	_component.prototype._refreshDeckHighlights = function () {
		var self = this;
		var sidebar = this._getSidebar();
		if (!sidebar) return;

		['a', 'b'].forEach(function (deckId) {
			var deckEl = self._getDeck(deckId);
			var idx = (deckEl && deckEl.lnDeck) ? deckEl.lnDeck.trackIndex : -1;
			sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-highlight', {
				detail: { deckId: deckId, index: idx }
			}));
		});
	};

	/* ====================================================================
	   AUDIO ROUTING
	   ==================================================================== */

	_component.prototype._ensureAudioContext = function () {
		if (this._audioCtx) {
			if (this._audioCtx.state === 'suspended') {
				this._audioCtx.resume();
			}
			return;
		}
		this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		this._masterGain = this._audioCtx.createGain();
		this._masterGain.connect(this._audioCtx.destination);

		var slider = this.dom.querySelector('[data-ln-potentiometer="master"]');
		this._masterGain.gain.value = slider ? slider.value / 100 : 0.8;
	};

	_component.prototype._connectDeckAudio = function (deckId) {
		var deckEl = this._getDeck(deckId);
		if (!deckEl) return;
		var audio = deckEl.querySelector('[data-ln-audio]');
		if (!audio || !audio.src) return;

		// Only route through Web Audio API for blob: URLs (same-origin).
		// Cross-origin audio without crossorigin attribute cannot be
		// connected to AudioContext — it would taint the context.
		if (audio.src.indexOf('blob:') !== 0) return;

		this._ensureAudioContext();

		if (!audio._lnSourceNode) {
			audio._lnSourceNode = this._audioCtx.createMediaElementSource(audio);
		}

		try { audio._lnSourceNode.disconnect(); } catch (e) { /* not connected */ }
		audio._lnSourceNode.connect(this._masterGain);
	};

	/* ====================================================================
	   AUDIO CACHE — download + blob URL lifecycle
	   ==================================================================== */

	_component.prototype._getGlobalProgressBar = function () {
		return this.dom.querySelector('[data-ln-global-progress]');
	};

	_component.prototype._updateGlobalProgress = function () {
		var bar = this._getGlobalProgressBar();
		if (!bar) return;

		var urls = Object.keys(this._downloadProgress);
		if (urls.length === 0) {
			bar.hidden = true;
			return;
		}

		var totalLoaded = 0;
		var totalSize = 0;

		for (var i = 0; i < urls.length; i++) {
			var entry = this._downloadProgress[urls[i]];
			totalLoaded += entry.loaded;
			totalSize += entry.total;
		}

		var pct = (totalSize > 0) ? Math.round((totalLoaded / totalSize) * 100) : 0;

		bar.hidden = false;
		var markEl = bar.querySelector('[data-ln-progress]');
		if (markEl) {
			markEl.setAttribute('data-ln-progress', String(pct));
		}
	};

	_component.prototype._downloadBlob = function (url, callback) {
		var self = this;

		if (this._downloading[url]) {
			if (callback) callback(false);
			return;
		}

		this._downloading[url] = true;
		this._downloadProgress[url] = { loaded: 0, total: 0 };
		this._updateGlobalProgress();

		var libraryEl = this._getLibraryEl();
		if (libraryEl) {
			libraryEl.dispatchEvent(new CustomEvent('ln-library:request-download-start', {
				detail: { url: url }
			}));
		}

		var xhr = new XMLHttpRequest();
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
					var pct = (e.loaded / e.total) * 100;
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
				var blob = xhr.response;

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

	_component.prototype._addTrackToPlaylist = function (sidebar, title, artist, url) {
		var duration = '';
		var durationSec = 0;

		if (url) {
			var nav = this._getNav();
			if (nav && nav.lnProfile) {
				var profile = nav.lnProfile.getProfile(nav.lnProfile.currentId);
				if (profile && profile.playlists) {
					var found = false;
					for (var pid in profile.playlists) {
						if (!profile.playlists.hasOwnProperty(pid) || found) continue;
						var tracks = profile.playlists[pid].tracks;
						for (var i = 0; i < tracks.length; i++) {
							if (tracks[i].url === url && tracks[i].durationSec > 0) {
								duration = tracks[i].duration;
								durationSec = tracks[i].durationSec;
								found = true;
								break;
							}
						}
					}
				}
			}
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

	_component.prototype._showAddFeedback = function (btn) {
		btn.textContent = 'Added!';
		btn.disabled = true;
		setTimeout(function () {
			btn.innerHTML = '<span class="ln-icon-add--white ln-icon--sm"></span> Add';
			btn.disabled = false;
		}, 1200);
	};

	_component.prototype._downloadAndCache = function (url, title, artist, sidebar, btn) {
		var self = this;

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

	_component.prototype._loadTrackToDeck = function (deckId, trackIndex, track) {
		var self = this;
		var deckEl = this._getDeck(deckId);
		if (!deckEl) return;

		var trackUrl = track ? track.url : '';

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

		// Try to resolve from cache (audio blob + waveform peaks)
		lnDb.get('audioFiles', trackUrl).then(function (cached) {
			var loadTrack = Object.assign({}, track);
			loadTrack._originalUrl = trackUrl;

			var peaks = null;
			var peaksDuration = 0;
			var hasCachedBlob = false;

			if (cached) {
				if (cached.peaks && cached.peaksDuration) {
					peaks = cached.peaks;
					peaksDuration = cached.peaksDuration;
				}
				if (cached.blob) {
					hasCachedBlob = true;
					loadTrack.url = URL.createObjectURL(cached.blob);
					self._blobUrls[deckId] = loadTrack.url;
				}
			}

			deckEl.dispatchEvent(new CustomEvent('ln-deck:request-load', {
				detail: { trackIndex: trackIndex, track: loadTrack, peaks: peaks, peaksDuration: peaksDuration }
			}));

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

	_component.prototype._updateCacheInfo = function () {
		var output = document.querySelector('[data-ln-cache-size]');
		if (!output) return;

		lnDb.getAll('audioFiles').then(function (records) {
			if (!records || records.length === 0) {
				output.textContent = 'No cached tracks';
				return;
			}
			var totalBytes = 0;
			records.forEach(function (r) { totalBytes += (r.size || 0); });

			var sizeLabel;
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

	/* ====================================================================
	   SETTINGS — form helpers
	   ==================================================================== */

	_component.prototype._populateSettingsForm = function () {
		var apiInput = document.querySelector('[data-ln-setting="api-url"]');
		if (apiInput) apiInput.value = lnSettings.getApiUrl();
		this._pendingLogo = lnSettings.getBrandLogo();
		this._updateLogoPreview();
		this._updateCacheInfo();
	};

	_component.prototype._updateLogoPreview = function () {
		var preview = document.querySelector('[data-ln-logo-preview]');
		if (!preview) return;

		var logo = this._pendingLogo !== null ? this._pendingLogo : lnSettings.getBrandLogo();
		if (logo) {
			preview.innerHTML = '';
			var img = document.createElement('img');
			img.src = logo;
			img.alt = 'Logo preview';
			preview.appendChild(img);
		} else {
			preview.innerHTML = '<span>No logo</span>';
		}
	};

	/* ====================================================================
	   SCOPED EVENTS — bubbled from child components within this.dom
	   ==================================================================== */

	_component.prototype._bindScopedEvents = function () {
		var self = this;

		// ─── Profile → Playlist bridge ───────────────────────────────
		this.dom.addEventListener('ln-profile:switched', function (e) {
			var sidebar = self._getSidebar();
			if (!sidebar) return;

			var profileId = e.detail.profileId;
			var playlists = null;

			if (profileId) {
				var nav = self._getNav();
				var profile = (nav && nav.lnProfile) ? nav.lnProfile.getProfile(profileId) : null;
				playlists = profile ? profile.playlists : null;
			}

			sidebar.setAttribute('data-ln-playlist-profile', profileId || '');
			sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-load-profile', {
				detail: { profileId: profileId, playlists: playlists }
			}));
		});

		// ─── Playlist persistence ────────────────────────────────────
		this.dom.addEventListener('ln-playlist:changed', function (e) {
			var nav = self._getNav();
			if (nav && nav.lnProfile) {
				var profileId = e.detail.profileId || nav.lnProfile.currentId;
				var profile = nav.lnProfile.getProfile(profileId);
				if (profile) {
					lnDb.put('profiles', profile);
				}
			}
		});

		// ─── Profile event reactions (toasts, modal close) ───────────

		this.dom.addEventListener('ln-profile:created', function (e) {
			self._updateEmptyState();
			lnDb.put('profiles', e.detail.profile);
			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: { type: 'success', message: 'Profile created' }
			}));
		});

		this.dom.addEventListener('ln-profile:deleted', function (e) {
			self._updateEmptyState();
			lnDb.delete('profiles', e.detail.profileId);
			lnModal.close('modal-settings');
			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: { type: 'info', message: 'Profile deleted' }
			}));
		});

		// ─── Profile ready — update empty state ──────────────────────
		this.dom.addEventListener('ln-profile:ready', function () {
			self._updateEmptyState();
		});

		// ─── Profile init — load from DB ─────────────────────────────
		this.dom.addEventListener('ln-profile:request-load', function () {
			self._loadProfiles();
		});

		// ─── Playlist event reactions (toasts, modals) ───────────────

		this.dom.addEventListener('ln-playlist:created', function () {
			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: { type: 'success', message: 'Playlist created' }
			}));
		});

		this.dom.addEventListener('ln-playlist:track-edited', function () {
			lnModal.close('modal-edit-track');
			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: { type: 'success', message: 'Track updated' }
			}));
		});

		this.dom.addEventListener('ln-playlist:track-removed', function (e) {
			lnModal.close('modal-edit-track');
			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: { type: 'warn', message: 'Track removed' }
			}));

			// Adjust deck indices
			var removedIdx = e.detail.trackIndex;
			['a', 'b'].forEach(function (deckId) {
				var deckEl = self._getDeck(deckId);
				if (!deckEl || !deckEl.lnDeck) return;
				var currentIdx = deckEl.lnDeck.trackIndex;

				if (currentIdx === removedIdx) {
					deckEl.dispatchEvent(new CustomEvent('ln-deck:request-reset'));
				} else if (currentIdx > removedIdx) {
					deckEl.dispatchEvent(new CustomEvent('ln-deck:request-adjust-index', {
						detail: { newIndex: currentIdx - 1 }
					}));
				}
			});

			self._refreshDeckHighlights();
		});

		this.dom.addEventListener('ln-playlist:playlist-removed', function (e) {
			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: { type: 'warn', message: 'Playlist "' + e.detail.name + '" deleted' }
			}));

			// Reset decks if no playlists remain
			var sidebar = self._getSidebar();
			if (!sidebar || !sidebar.lnPlaylist || !sidebar.lnPlaylist.currentId) {
				['a', 'b'].forEach(function (deckId) {
					var deckEl = self._getDeck(deckId);
					if (deckEl && deckEl.lnDeck) {
						deckEl.dispatchEvent(new CustomEvent('ln-deck:request-reset'));
					}
				});
			}

			self._refreshDeckHighlights();
		});

		// Edit track requested → set form context + populate + open modal
		this.dom.addEventListener('ln-playlist:open-edit', function (e) {
			var track = e.detail.track;

			var form = document.querySelector('[data-ln-form="edit-track"]');
			if (form) {
				form.setAttribute('data-ln-track-index', e.detail.index);
				form.setAttribute('data-ln-playlist-id', e.detail.playlistId);
			}

			var titleEl = document.querySelector('[data-ln-field="edit-track-title"]');
			var artistEl = document.querySelector('[data-ln-field="edit-track-artist"]');
			var notesInput = document.querySelector('[data-ln-field="edit-track-notes"]');

			if (titleEl) titleEl.textContent = track.title;
			if (artistEl) artistEl.textContent = track.artist + ' \u2014 ' + track.duration;
			if (notesInput) notesInput.value = track.notes || '';

			lnModal.open('modal-edit-track');

			if (notesInput) notesInput.focus();
		});

		// ─── Deck wiring ────────────────────────────────────────────

		// Profile switch → revoke blob URLs + reset both decks
		this.dom.addEventListener('ln-profile:switched', function () {
			['a', 'b'].forEach(function (deckId) {
				if (self._blobUrls[deckId]) {
					URL.revokeObjectURL(self._blobUrls[deckId]);
					delete self._blobUrls[deckId];
				}
				var deckEl = self._getDeck(deckId);
				if (deckEl) {
					deckEl.dispatchEvent(new CustomEvent('ln-deck:request-reset'));
				}
			});
		});

		// Playlist load-to-deck → cache-aware load
		this.dom.addEventListener('ln-playlist:load-to-deck', function (e) {
			self._loadTrackToDeck(e.detail.deckId, e.detail.trackIndex, e.detail.track);
		});

		// Deck loaded → update sidebar highlight + connect audio routing
		this.dom.addEventListener('ln-deck:loaded', function (e) {
			var sidebar = self._getSidebar();
			if (sidebar) {
				sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-highlight', {
					detail: { deckId: e.detail.deckId, index: e.detail.trackIndex }
				}));
			}
			if (e.detail.track && e.detail.track.url) {
				self._connectDeckAudio(e.detail.deckId);
			}
		});

		// Duration auto-detected → update all matching tracks in sidebar + persist
		this.dom.addEventListener('ln-deck:duration-detected', function (e) {
			var sidebar = self._getSidebar();
			if (!sidebar || !sidebar.lnPlaylist) return;

			var playlist = sidebar.lnPlaylist.getPlaylist();
			if (!playlist || !playlist.tracks) return;

			var idx = e.detail.trackIndex;
			if (idx < 0 || idx >= playlist.tracks.length) return;

			var track = playlist.tracks[idx];
			if (!track.url) return;

			sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-update-duration', {
				detail: {
					url: track.url,
					duration: e.detail.duration,
					durationSec: e.detail.durationSec
				}
			}));
		});

		// Waveform peaks generated → persist to audioFiles record
		this.dom.addEventListener('ln-deck:peaks-ready', function (e) {
			var trackUrl = e.detail.trackUrl;
			if (!trackUrl) return;

			lnDb.get('audioFiles', trackUrl).then(function (record) {
				if (record) {
					record.peaks = e.detail.peaks;
					record.peaksDuration = e.detail.peaksDuration;
					return lnDb.put('audioFiles', record);
				}
			});
		});

		// Reordered → remap deck indices
		this.dom.addEventListener('ln-playlist:reordered', function (e) {
			var oldToNew = e.detail.oldToNew;

			['a', 'b'].forEach(function (deckId) {
				var deckEl = self._getDeck(deckId);
				if (!deckEl || !deckEl.lnDeck) return;
				var oldIdx = deckEl.lnDeck.trackIndex;

				if (oldIdx >= 0 && oldToNew.hasOwnProperty(oldIdx)) {
					deckEl.dispatchEvent(new CustomEvent('ln-deck:request-adjust-index', {
						detail: { newIndex: oldToNew[oldIdx] }
					}));
				}
			});

			self._refreshDeckHighlights();
		});

		// Track added → auto-load to deck B if empty (cache-aware)
		this.dom.addEventListener('ln-playlist:track-added', function (e) {
			var deckB = self._getDeck('b');
			if (deckB && deckB.lnDeck && deckB.lnDeck.trackIndex < 0) {
				self._loadTrackToDeck('b', e.detail.trackIndex, e.detail.track);
			}
		});

		// Edit-track button (from deck) → bridge to playlist
		this.dom.addEventListener('ln-deck:edit-requested', function (e) {
			var sidebar = self._getSidebar();
			if (sidebar) {
				sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-open-edit', {
					detail: { index: e.detail.trackIndex }
				}));
			}
		});

		// ─── Loop segment wiring ─────────────────────────────────────

		// Loop captured → open name-loop modal
		this.dom.addEventListener('ln-deck:loop-captured', function (e) {
			var form = document.querySelector('[data-ln-form="name-loop"]');
			if (!form) return;

			form.setAttribute('data-ln-deck-id', e.detail.deckId);
			form.setAttribute('data-ln-track-index', e.detail.trackIndex);
			form.setAttribute('data-ln-loop-start', e.detail.startSec);
			form.setAttribute('data-ln-loop-end', e.detail.endSec);
			form.setAttribute('data-ln-loop-start-pct', e.detail.startPct);
			form.setAttribute('data-ln-loop-end-pct', e.detail.endPct);

			var rangeEl = document.querySelector('[data-ln-field="loop-range"]');
			if (rangeEl) {
				rangeEl.textContent = _formatTime(e.detail.startSec) + ' – ' + _formatTime(e.detail.endSec);
			}

			var nameInput = document.querySelector('[data-ln-field="loop-name"]');
			if (nameInput) nameInput.value = '';

			lnModal.open('modal-name-loop');
			if (nameInput) nameInput.focus();
		});

		// Loop delete requested → remove from playlist + refresh deck
		this.dom.addEventListener('ln-deck:loop-delete-requested', function (e) {
			var sidebar = self._getSidebar();
			if (!sidebar || !sidebar.lnPlaylist) return;

			var playlistId = sidebar.lnPlaylist.currentId;
			if (!playlistId) return;

			sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-remove-loop', {
				detail: {
					playlistId: playlistId,
					trackIndex: e.detail.trackIndex,
					loopIndex: e.detail.loopIndex
				}
			}));

			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: { type: 'info', message: 'Loop removed' }
			}));
		});

		// Loop added/removed → refresh deck segment buttons
		this.dom.addEventListener('ln-playlist:loop-added', function (e) {
			var d = e.detail;
			['a', 'b'].forEach(function (deckId) {
				var deckEl = self._getDeck(deckId);
				if (deckEl && deckEl.lnDeck && deckEl.lnDeck.trackIndex === d.trackIndex) {
					deckEl.dispatchEvent(new CustomEvent('ln-deck:request-set-loops', {
						detail: { loops: d.loops }
					}));
				}
			});
		});

		this.dom.addEventListener('ln-playlist:loop-removed', function (e) {
			var d = e.detail;
			['a', 'b'].forEach(function (deckId) {
				var deckEl = self._getDeck(deckId);
				if (deckEl && deckEl.lnDeck && deckEl.lnDeck.trackIndex === d.trackIndex) {
					deckEl.dispatchEvent(new CustomEvent('ln-deck:request-set-loops', {
						detail: { loops: d.loops }
					}));
				}
			});
		});

		// ─── Settings load after profile ready ──────────────────────
		this.dom.addEventListener('ln-profile:ready', function () {
			lnDb.open().then(function () {
				return lnDb.get('settings', 'app');
			}).then(function (record) {
				lnSettings.hydrate(record);
			});
		});

		// ─── Volume slider ──────────────────────────────────────────

		var volumeSlider = this.dom.querySelector('[data-ln-potentiometer="master"]');
		if (volumeSlider) {
			var _handleVolume = function () {
				var val = volumeSlider.value;
				var pct = val + '%';
				volumeSlider.style.background =
					'linear-gradient(to right, hsl(var(--accent)) ' + pct + ', var(--button-bg) ' + pct + ')';
				if (self._masterGain) {
					self._masterGain.gain.value = val / 100;
				}
			};
			volumeSlider.addEventListener('input', _handleVolume);
			_handleVolume();
		}

		// ─── Resume AudioContext on first user gesture ──────────────

		var _contextResumed = false;
		this.dom.addEventListener('click', function () {
			if (!_contextResumed && self._audioCtx) {
				self._audioCtx.resume();
				_contextResumed = true;
			}
		});
	};

	/* ====================================================================
	   GLOBAL EVENTS — modals, forms, click actions (outside this.dom)
	   ==================================================================== */

	_component.prototype._bindGlobalEvents = function () {
		var self = this;

		// ─── Profile UI actions ──────────────────────────────────────

		// Open new-profile dialog
		document.addEventListener('click', function (e) {
			if (e.target.closest('[data-ln-action="new-profile"]')) {
				lnModal.open('modal-new-profile');
			}
		});

		// Delete current profile
		document.addEventListener('click', function (e) {
			if (e.target.closest('[data-ln-action="delete-profile"]')) {
				var nav = self._getNav();
				if (nav && nav.lnProfile) {
					nav.dispatchEvent(new CustomEvent('ln-profile:request-remove', {
						detail: { id: nav.lnProfile.currentId }
					}));
				}
			}
		});

		// Create profile from form submit
		document.addEventListener('ln-form:submit', function (e) {
			if (e.target.getAttribute('data-ln-form') !== 'new-profile') return;

			var input = document.querySelector('[data-ln-field="new-profile-name"]');
			var name = input ? input.value.trim() : '';
			if (!name) {
				if (input) input.focus();
				return;
			}

			var nav = self._getNav();
			if (nav) {
				nav.dispatchEvent(new CustomEvent('ln-profile:request-create', {
					detail: { name: name }
				}));
			}

			input.value = '';
			lnModal.close('modal-new-profile');
		});

		// ─── Playlist UI actions ─────────────────────────────────────

		// Open new-playlist dialog
		document.addEventListener('click', function (e) {
			if (e.target.closest('[data-ln-action="new-playlist"]')) {
				var sidebar = self._getSidebar();
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
				var libraryEl = self._getLibraryEl();
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
				var form = document.querySelector('[data-ln-form="edit-track"]');
				if (!form) return;
				var idx = parseInt(form.getAttribute('data-ln-track-index'), 10);
				var playlistId = form.getAttribute('data-ln-playlist-id');
				if (idx < 0 || !playlistId) return;

				var sidebar = self._getSidebar();
				if (sidebar) {
					sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-remove-track', {
						detail: { index: idx, playlistId: playlistId }
					}));
				}
			}
		});

		// Remove playlist — open confirmation modal
		document.addEventListener('click', function (e) {
			var btn = e.target.closest('[data-ln-action="remove-playlist"]');
			if (!btn) return;

			e.stopPropagation();

			var playlistId = btn.getAttribute('data-ln-playlist-id');
			if (!playlistId) return;

			var sidebar = self._getSidebar();
			if (!sidebar || !sidebar.lnPlaylist) return;

			var playlist = sidebar.lnPlaylist.playlists[playlistId];
			if (!playlist) return;

			var form = document.querySelector('[data-ln-form="confirm-delete-playlist"]');
			if (form) form.setAttribute('data-ln-playlist-id', playlistId);

			var msgEl = document.querySelector('[data-ln-field="confirm-delete-message"]');
			if (msgEl) {
				var trackCount = playlist.tracks.length;
				msgEl.textContent = 'Delete playlist \u201C' + playlist.name + '\u201D? This removes ' +
					trackCount + (trackCount === 1 ? ' track.' : ' tracks.');
			}

			lnModal.open('modal-confirm-delete-playlist');
		});

		// Confirm delete playlist
		document.addEventListener('ln-form:submit', function (e) {
			if (e.target.getAttribute('data-ln-form') !== 'confirm-delete-playlist') return;

			var form = e.target;
			var playlistId = form.getAttribute('data-ln-playlist-id');
			if (!playlistId) return;

			var sidebar = self._getSidebar();
			if (sidebar) {
				sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-remove-playlist', {
					detail: { playlistId: playlistId }
				}));
			}

			lnModal.close('modal-confirm-delete-playlist');
		});

		// Add track to playlist (from library dialog) — download-aware
		document.addEventListener('click', function (e) {
			var btn = e.target.closest('[data-ln-action="add-to-playlist"]');
			if (!btn) return;

			var title = btn.getAttribute('data-track-title');
			var artist = btn.getAttribute('data-track-artist');
			var url = btn.getAttribute('data-track-url') || '';
			if (!title) return;

			var sidebar = self._getSidebar();
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

			var input = document.querySelector('[data-ln-field="new-playlist-name"]');
			var name = input ? input.value.trim() : '';
			if (!name) {
				if (input) input.focus();
				return;
			}

			var sidebar = self._getSidebar();
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

			var form = e.target;
			var idx = parseInt(form.getAttribute('data-ln-track-index'), 10);
			var playlistId = form.getAttribute('data-ln-playlist-id');
			if (idx < 0 || !playlistId) return;

			var notesInput = document.querySelector('[data-ln-field="edit-track-notes"]');
			var notes = notesInput ? notesInput.value.trim() : '';

			var sidebar = self._getSidebar();
			if (sidebar) {
				sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-edit-track', {
					detail: { index: idx, playlistId: playlistId, notes: notes }
				}));
			}
		});

		// ─── Name loop form submit ──────────────────────────────────

		document.addEventListener('ln-form:submit', function (e) {
			if (e.target.getAttribute('data-ln-form') !== 'name-loop') return;

			var form = e.target;
			var nameInput = document.querySelector('[data-ln-field="loop-name"]');
			var name = nameInput ? nameInput.value.trim() : '';
			if (!name) {
				if (nameInput) nameInput.focus();
				return;
			}

			var deckId = form.getAttribute('data-ln-deck-id');
			var trackIndex = parseInt(form.getAttribute('data-ln-track-index'), 10);
			var startSec = parseFloat(form.getAttribute('data-ln-loop-start'));
			var endSec = parseFloat(form.getAttribute('data-ln-loop-end'));
			var startPct = parseFloat(form.getAttribute('data-ln-loop-start-pct'));
			var endPct = parseFloat(form.getAttribute('data-ln-loop-end-pct'));

			var loopData = {
				name: name,
				startSec: startSec,
				endSec: endSec,
				startPct: startPct,
				endPct: endPct
			};

			var sidebar = self._getSidebar();
			if (sidebar && sidebar.lnPlaylist) {
				var playlistId = sidebar.lnPlaylist.currentId;
				sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-add-loop', {
					detail: {
						playlistId: playlistId,
						trackIndex: trackIndex,
						loop: loopData
					}
				}));
			}

			lnModal.close('modal-name-loop');
			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: { type: 'success', message: 'Loop "' + name + '" saved' }
			}));
		});

		// Open settings from library empty state
		document.addEventListener('click', function (e) {
			if (e.target.closest('[data-ln-action="open-settings-from-library"]')) {
				lnModal.close('modal-track-library');
				self._populateSettingsForm();
				lnModal.open('modal-settings');
			}
		});

		// ─── Library event reactions (global — library modal is outside mixer DOM) ──

		document.addEventListener('ln-library:error', function (e) {
			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: { type: 'warn', message: e.detail.message || 'Library error' }
			}));
		});

		// Library fetched → mark cached tracks
		document.addEventListener('ln-library:fetched', function () {
			lnDb.getAllKeys('audioFiles').then(function (cachedUrls) {
				var libraryEl = self._getLibraryEl();
				if (libraryEl) {
					libraryEl.dispatchEvent(new CustomEvent('ln-library:request-mark-cached', {
						detail: { cachedUrls: cachedUrls }
					}));
				}
			});
		});

		// ─── Audio cache actions ────────────────────────────────────

		// Remove single cached track (from progress bar uncache button)
		document.addEventListener('click', function (e) {
			var btn = e.target.closest('[data-ln-action="remove-cached"]');
			if (!btn) return;

			var li = btn.closest('[data-ln-library-track]');
			if (!li) return;

			var addBtn = li.querySelector('[data-ln-action="add-to-playlist"]');
			var url = addBtn ? addBtn.getAttribute('data-track-url') : '';
			if (!url) return;

			lnDb.delete('audioFiles', url).then(function () {
				var libraryEl = self._getLibraryEl();
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

		// Clear all cached audio (from settings dialog)
		document.addEventListener('click', function (e) {
			if (!e.target.closest('[data-ln-action="clear-audio-cache"]')) return;

			lnDb.clear('audioFiles').then(function () {
				// Revoke any active blob URLs
				['a', 'b'].forEach(function (deckId) {
					if (self._blobUrls[deckId]) {
						URL.revokeObjectURL(self._blobUrls[deckId]);
						delete self._blobUrls[deckId];
					}
				});

				var libraryEl = self._getLibraryEl();
				if (libraryEl) {
					libraryEl.dispatchEvent(new CustomEvent('ln-library:request-clear-all-cached'));
				}

				self._updateCacheInfo();

				window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
					detail: { type: 'info', message: 'Audio cache cleared' }
				}));
			});
		});

		// ─── Settings UI actions ────────────────────────────────────

		// Open settings dialog
		document.addEventListener('click', function (e) {
			if (e.target.closest('[data-ln-action="open-settings"]')) {
				self._populateSettingsForm();
				lnModal.open('modal-settings');
			}
		});

		// Upload logo button
		document.addEventListener('click', function (e) {
			if (e.target.closest('[data-ln-action="upload-logo"]')) {
				var input = document.querySelector('[data-ln-logo-input]');
				if (input) input.click();
			}
		});

		// Logo file input change
		var logoInput = document.querySelector('[data-ln-logo-input]');
		if (logoInput) {
			logoInput.addEventListener('change', function () {
				var file = logoInput.files[0];
				if (!file) return;

				var reader = new FileReader();
				reader.onload = function (ev) {
					self._pendingLogo = ev.target.result;
					self._updateLogoPreview();
				};
				reader.readAsDataURL(file);
			});
		}

		// Settings form submit
		document.addEventListener('ln-form:submit', function (e) {
			if (e.target.getAttribute('data-ln-form') !== 'settings') return;

			var apiInput = document.querySelector('[data-ln-setting="api-url"]');
			var apiUrl = apiInput ? apiInput.value.trim() : '';
			var brandLogo = self._pendingLogo !== null ? self._pendingLogo : lnSettings.getBrandLogo();

			lnSettings.apply({
				apiUrl: apiUrl,
				brandLogo: brandLogo
			});

			lnDb.put('settings', {
				key: 'app',
				apiUrl: apiUrl,
				brandLogo: brandLogo
			});

			self._pendingLogo = null;
			lnModal.close('modal-settings');
			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: { type: 'success', message: 'Settings saved' }
			}));
		});
	};

	/* ─── DOM Observer ────────────────────────────────────────────── */

	function _domObserver() {
		var observer = new MutationObserver(function (mutations) {
			mutations.forEach(function (mutation) {
				if (mutation.type === 'childList') {
					mutation.addedNodes.forEach(function (node) {
						if (node.nodeType === 1) {
							_findElements(node);
						}
					});
				}
			});
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true
		});
	}

	/* ─── Init ────────────────────────────────────────────────────── */

	window[DOM_ATTRIBUTE] = constructor;
	_domObserver();

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function () {
			constructor(document.body);
		});
	} else {
		constructor(document.body);
	}
})();
