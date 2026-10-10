/* ====================================================================
   LN DJ Mixer — Profile Bridge + Settings UI
   Profile events, playlist persistence, settings form, branding
   ==================================================================== */

import { dispatch, fill } from 'ln-ashlar';

let _deferredInstallPrompt = null;

export function setupSettings(mixer) {

	// PWA Install listeners
	window.addEventListener('beforeinstallprompt', function (e) {
		e.preventDefault();
		_deferredInstallPrompt = e;
		const field = document.querySelector('[data-mixer-install-field]');
		if (field) field.hidden = false;
	});

	window.addEventListener('appinstalled', function () {
		_deferredInstallPrompt = null;
		const field = document.querySelector('[data-mixer-install-field]');
		if (field) field.hidden = true;
	});

	/* ─── Settings Form Helpers ──────────────────────────────────── */

	mixer._populateSettingsForm = function () {
		this._pendingLogo = lnSettings.getBrandLogo();
		this._updateLogoPreview();
		this._updateCacheInfo();
	};

	mixer._updateLogoPreview = function () {
		const preview = document.querySelector('[data-mixer-logo-preview]');
		if (!preview) return;

		const logo = this._pendingLogo !== null ? this._pendingLogo : lnSettings.getBrandLogo();
		const img = preview.querySelector('img');
		const emptySpan = preview.querySelector('[data-empty]');

		if (img && emptySpan) {
			img.hidden = !logo;
			emptySpan.hidden = !!logo;
			if (logo) img.src = logo;
		}
	};

	/* ─── Scoped Event Bindings ──────────────────────────────────── */

	mixer._bindProfileBridge = function () {
		const self = this;

		// Profile → Playlist bridge (async: load playlists + track catalog from IDB)
		this.dom.addEventListener('ln-profile:switched', function (e) {
			const sidebar = self._getSidebar();
			if (!sidebar) return;

			const profileId = e.detail.profileId;
			sidebar.setAttribute('data-mixer-playlist-profile', profileId || '');

			if (!profileId) {
				dispatch(sidebar, 'ln-playlist:request-load-profile', { profileId: null, playlists: null, trackCatalog: null });
				return;
			}

			lnDb.getAllByIndex('playlists', 'profileId', profileId).then(function (playlistArr) {
				// Collect unique track URLs from all segments
				const urlSet = {};
				playlistArr.forEach(function (pl) {
					(pl.segments || []).forEach(function (seg) {
						if (seg.url) urlSet[seg.url] = true;
					});
				});

				const urls = Object.keys(urlSet);
				const trackPromises = urls.map(function (url) {
					return lnDb.get('tracks', url);
				});

				return Promise.all(trackPromises).then(function (trackRecords) {
					// Build keyed objects for ln-playlist
					const playlists = {};
					playlistArr.forEach(function (pl) {
						playlists[pl.id] = pl;
					});

					const trackCatalog = {};
					trackRecords.forEach(function (tr) {
						if (tr) trackCatalog[tr.url] = tr;
					});

					dispatch(sidebar, 'ln-playlist:request-load-profile', { profileId: profileId, playlists: playlists, trackCatalog: trackCatalog });
				});
			});
		});

		// Playlist persistence — save individual playlist
		this.dom.addEventListener('ln-playlist:changed', function (e) {
			const playlistId = e.detail.playlistId;
			if (!playlistId) return;

			const sidebar = self._getSidebar();
			if (!sidebar || !sidebar.lnPlaylist || !sidebar.lnPlaylist.playlists) return;

			const playlist = sidebar.lnPlaylist.playlists[playlistId];
			if (playlist) {
				lnDb.put('playlists', playlist);
			}
		});

		// Profile event reactions (toasts, modal close)

		this.dom.addEventListener('ln-profile:created', function (e) {
			self._updateEmptyState();
			lnDb.put('profiles', e.detail.profile);
			dispatch(window, 'ln-toast:enqueue', {
				type: 'success',
				message: (self.dict && self.dict['profile-created']) || 'Profile created'
			});
		});

		this.dom.addEventListener('ln-profile:deleted', function (e) {
			self._updateEmptyState();
			lnDb.delete('profiles', e.detail.profileId);
			lnDb.deleteByIndex('playlists', 'profileId', e.detail.profileId);
			const modalEl = document.getElementById('modal-settings');
			if (modalEl) modalEl.setAttribute('data-ln-modal', 'close');
			dispatch(window, 'ln-toast:enqueue', {
				type: 'info',
				message: (self.dict && self.dict['profile-deleted']) || 'Profile deleted'
			});
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
			dispatch(window, 'ln-toast:enqueue', {
				type: 'success',
				message: (self.dict && self.dict['playlist-created']) || 'Playlist created'
			});
		});

		this.dom.addEventListener('ln-playlist:track-edited', function () {
			const modalEl = document.getElementById('modal-edit-track');
			if (modalEl) modalEl.setAttribute('data-ln-modal', 'close');
			dispatch(window, 'ln-toast:enqueue', {
				type: 'success',
				message: (self.dict && self.dict['track-updated']) || 'Track updated'
			});
		});

		this.dom.addEventListener('ln-playlist:track-removed', function (e) {
			const modalEl = document.getElementById('modal-edit-track');
			if (modalEl) modalEl.setAttribute('data-ln-modal', 'close');
			dispatch(window, 'ln-toast:enqueue', {
				type: 'warn',
				message: (self.dict && self.dict['track-removed']) || 'Track removed'
			});

			// Adjust deck indices
			const removedIdx = e.detail.trackIndex;
			self.dom.querySelectorAll('[data-mixer-deck]').forEach(function (deckEl) {
				if (!deckEl.lnDeck) return;
				const currentIdx = deckEl.lnDeck.trackIndex;

				if (currentIdx === removedIdx) {
					dispatch(deckEl, 'ln-deck:request-reset');
				} else if (currentIdx > removedIdx) {
					dispatch(deckEl, 'ln-deck:request-adjust-index', { newIndex: currentIdx - 1 });
				}
			});

			self._refreshDeckHighlights();
			if (self._autoplay) self._autoplayPreloaded = false;
		});

		this.dom.addEventListener('ln-playlist:playlist-removed', function (e) {
			lnDb.delete('playlists', e.detail.playlistId);
			const deletedMsg = (self.dict && self.dict['playlist-deleted'])
				? self.dict['playlist-deleted'].replace('{name}', e.detail.name)
				: 'Playlist "' + e.detail.name + '" deleted';
			dispatch(window, 'ln-toast:enqueue', {
				type: 'warn',
				message: deletedMsg
			});

			// Reset decks if no playlists remain
			const sidebar = self._getSidebar();
			if (!sidebar || !sidebar.lnPlaylist || !sidebar.lnPlaylist.currentId) {
				self.dom.querySelectorAll('[data-mixer-deck]').forEach(function (deckEl) {
					if (deckEl.lnDeck) {
						dispatch(deckEl, 'ln-deck:request-reset');
					}
				});
			}

			self._refreshDeckHighlights();
		});

		// Normalize edit track modal at open boundary
		const editTrackModal = document.getElementById('modal-edit-track');
		if (editTrackModal) {
			editTrackModal.addEventListener('ln-modal:before-open', function () {
				const detail = self._pendingEditTrack;
				if (!detail) return;
				const track = detail.track || {};
				const form = document.querySelector('[data-ln-form="edit-track"]');
				if (form) {
					form.setAttribute('data-mixer-track-index', detail.index);
					form.setAttribute('data-mixer-playlist-id', detail.playlistId);
					fill(form, {
						'edit-track-title': track.title || '',
						'edit-track-artist': (track.artist || '') + (track.duration ? ' \u2014 ' + track.duration : '')
					});
					const notesInput = form.querySelector('[data-ln-field="edit-track-notes"]');
					if (notesInput) {
						notesInput.value = track.notes || '';
						notesInput.focus();
					}
				}
			});
		}

		// Edit track requested → store context + open modal
		this.dom.addEventListener('ln-playlist:open-edit', function (e) {
			self._pendingEditTrack = e.detail;
			const modalEl = document.getElementById('modal-edit-track');
			if (modalEl) modalEl.setAttribute('data-ln-modal', 'open');
		});
	};

	/* ─── Global Event Bindings ──────────────────────────────────── */

	mixer._bindProfileActions = function () {
		const self = this;

		// Delete current profile
		document.addEventListener('click', function (e) {
			if (e.target.closest('[data-mixer-action="delete-profile"]')) {
				const nav = self._getNav();
				if (nav && nav.lnProfile) {
					dispatch(nav, 'ln-profile:request-remove', { id: nav.lnProfile.currentId });
				}
			}
		});

		// Create profile from form submit
		document.addEventListener('ln-form:submit', function (e) {
			if (e.target.getAttribute('data-ln-form') !== 'new-profile') return;

			const form = e.target;
			const input = form.querySelector('[data-ln-field="new-profile-name"]');
			const name = input ? input.value.trim() : '';
			if (!name) {
				if (input) input.focus();
				return;
			}

			const nav = self._getNav();
			if (nav) {
				dispatch(nav, 'ln-profile:request-create', { name: name });
			}

			input.value = '';
			const modalEl = document.getElementById('modal-new-profile');
			if (modalEl) modalEl.setAttribute('data-ln-modal', 'close');
		});
	};

	mixer._bindSettingsActions = function () {
		const self = this;

		// Populate settings before opening
		const settingsModal = document.getElementById('modal-settings');
		if (settingsModal) {
			settingsModal.addEventListener('ln-modal:before-open', function () {
				self._populateSettingsForm();
			});
		}

		// Install app (PWA)
		document.addEventListener('click', function (e) {
			if (!e.target.closest('[data-mixer-action="install-app"]')) return;
			if (!_deferredInstallPrompt) return;

			_deferredInstallPrompt.prompt();
			_deferredInstallPrompt.userChoice.then(function (result) {
				if (result.outcome === 'accepted') {
					_deferredInstallPrompt = null;
					const field = document.querySelector('[data-mixer-install-field]');
					if (field) field.hidden = true;
				}
			});
		});

		// Upload logo button
		document.addEventListener('click', function (e) {
			if (e.target.closest('[data-mixer-action="upload-logo"]')) {
				const input = document.querySelector('[data-mixer-logo-input]');
				if (input) input.click();
			}
		});

		// Logo file input change
		const logoInput = document.querySelector('[data-mixer-logo-input]');
		if (logoInput) {
			logoInput.addEventListener('change', function () {
				const file = logoInput.files[0];
				if (!file) return;

				const reader = new FileReader();
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

			const brandLogo = self._pendingLogo !== null ? self._pendingLogo : lnSettings.getBrandLogo();

			lnSettings.apply({
				brandLogo: brandLogo
			});

			lnDb.put('settings', {
				key: 'app',
				brandLogo: brandLogo
			});

			self._pendingLogo = null;
			const modalEl = document.getElementById('modal-settings');
			if (modalEl) modalEl.setAttribute('data-ln-modal', 'close');
			dispatch(window, 'ln-toast:enqueue', {
				type: 'success',
				message: (self.dict && self.dict['settings-saved']) || 'Settings saved'
			});
		});
	};

}
