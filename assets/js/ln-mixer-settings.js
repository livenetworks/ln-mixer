/* ====================================================================
   LN DJ Mixer — Profile Bridge + Settings UI
   Profile events, playlist persistence, settings form, branding
   ==================================================================== */

(function () {
	'use strict';

	var _component = window._LnMixerComponent;
	if (!_component) return;

	/* ─── PWA Install ───────────────────────────────────────────── */

	var _deferredInstallPrompt = null;

	window.addEventListener('beforeinstallprompt', function (e) {
		e.preventDefault();
		_deferredInstallPrompt = e;
		var field = document.querySelector('[data-ln-install-field]');
		if (field) field.hidden = false;
	});

	window.addEventListener('appinstalled', function () {
		_deferredInstallPrompt = null;
		var field = document.querySelector('[data-ln-install-field]');
		if (field) field.hidden = true;
	});

	/* ─── Settings Form Helpers ──────────────────────────────────── */

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

	/* ─── Scoped Event Bindings ──────────────────────────────────── */

	_component.prototype._bindProfileBridge = function () {
		var self = this;

		// Profile → Playlist bridge (async: load playlists + track catalog from IDB)
		this.dom.addEventListener('ln-profile:switched', function (e) {
			var sidebar = self._getSidebar();
			if (!sidebar) return;

			var profileId = e.detail.profileId;
			sidebar.setAttribute('data-ln-playlist-profile', profileId || '');

			if (!profileId) {
				sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-load-profile', {
					detail: { profileId: null, playlists: null, trackCatalog: null }
				}));
				return;
			}

			lnDb.getAllByIndex('playlists', 'profileId', profileId).then(function (playlistArr) {
				// Collect unique track URLs from all segments
				var urlSet = {};
				playlistArr.forEach(function (pl) {
					(pl.segments || []).forEach(function (seg) {
						if (seg.url) urlSet[seg.url] = true;
					});
				});

				var urls = Object.keys(urlSet);
				var trackPromises = urls.map(function (url) {
					return lnDb.get('tracks', url);
				});

				return Promise.all(trackPromises).then(function (trackRecords) {
					// Build keyed objects for ln-playlist
					var playlists = {};
					playlistArr.forEach(function (pl) {
						playlists[pl.id] = pl;
					});

					var trackCatalog = {};
					trackRecords.forEach(function (tr) {
						if (tr) trackCatalog[tr.url] = tr;
					});

					sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-load-profile', {
						detail: { profileId: profileId, playlists: playlists, trackCatalog: trackCatalog }
					}));
				});
			});
		});

		// Playlist persistence — save individual playlist
		this.dom.addEventListener('ln-playlist:changed', function (e) {
			var playlistId = e.detail.playlistId;
			if (!playlistId) return;

			var sidebar = self._getSidebar();
			if (!sidebar || !sidebar.lnPlaylist || !sidebar.lnPlaylist.playlists) return;

			var playlist = sidebar.lnPlaylist.playlists[playlistId];
			if (playlist) {
				lnDb.put('playlists', playlist);
			}
		});

		// Profile event reactions (toasts, modal close)

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
			lnDb.deleteByIndex('playlists', 'profileId', e.detail.profileId);
			lnModal.close('modal-settings');
			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: { type: 'info', message: 'Profile deleted' }
			}));
		});

		// Profile ready — update empty state
		this.dom.addEventListener('ln-profile:ready', function () {
			self._updateEmptyState();
		});

		// Profile init — load from DB
		this.dom.addEventListener('ln-profile:request-load', function () {
			self._loadProfiles();
		});

		// Playlist event reactions (toasts, modals)

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
			self.dom.querySelectorAll('[data-ln-deck]').forEach(function (deckEl) {
				if (!deckEl.lnDeck) return;
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
			if (self._autoplay) self._autoplayPreloaded = false;
		});

		this.dom.addEventListener('ln-playlist:playlist-removed', function (e) {
			lnDb.delete('playlists', e.detail.playlistId);
			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: { type: 'warn', message: 'Playlist "' + e.detail.name + '" deleted' }
			}));

			// Reset decks if no playlists remain
			var sidebar = self._getSidebar();
			if (!sidebar || !sidebar.lnPlaylist || !sidebar.lnPlaylist.currentId) {
				self.dom.querySelectorAll('[data-ln-deck]').forEach(function (deckEl) {
					if (deckEl.lnDeck) {
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
	};

	/* ─── Global Event Bindings ──────────────────────────────────── */

	_component.prototype._bindProfileActions = function () {
		var self = this;

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
	};

	_component.prototype._bindSettingsActions = function () {
		var self = this;

		// Open settings dialog
		document.addEventListener('click', function (e) {
			if (e.target.closest('[data-ln-action="open-settings"]')) {
				self._populateSettingsForm();
				lnModal.open('modal-settings');
			}
		});

		// Install app (PWA)
		document.addEventListener('click', function (e) {
			if (!e.target.closest('[data-ln-action="install-app"]')) return;
			if (!_deferredInstallPrompt) return;

			_deferredInstallPrompt.prompt();
			_deferredInstallPrompt.userChoice.then(function (result) {
				if (result.outcome === 'accepted') {
					_deferredInstallPrompt = null;
					var field = document.querySelector('[data-ln-install-field]');
					if (field) field.hidden = true;
				}
			});
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

})();
