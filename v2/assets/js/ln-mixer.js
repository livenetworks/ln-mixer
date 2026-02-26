(function () {
	'use strict';

	if (window.lnMixer !== undefined) return;
	window.lnMixer = true;

	function _getNav() {
		return document.querySelector('[data-ln-profile]');
	}

	function _getSidebar() {
		return document.querySelector('[data-ln-playlist]');
	}

	function _getDeck(deckId) {
		return document.querySelector('[data-ln-deck="' + deckId + '"]');
	}

	function _refreshDeckHighlights() {
		var sidebar = _getSidebar();
		if (!sidebar) return;

		['a', 'b'].forEach(function (deckId) {
			var deckEl = _getDeck(deckId);
			var idx = (deckEl && deckEl.lnDeck) ? deckEl.lnDeck.trackIndex : -1;
			sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-highlight', {
				detail: { deckId: deckId, index: idx }
			}));
		});
	}

	/* ====================================================================
	   SETTINGS — form helpers
	   ==================================================================== */

	var _pendingLogo = null;

	function _populateSettingsForm() {
		var apiInput = document.querySelector('[data-ln-setting="api-url"]');
		if (apiInput) apiInput.value = lnSettings.getApiUrl();
		_pendingLogo = lnSettings.getBrandLogo();
		_updateLogoPreview();
	}

	function _updateLogoPreview() {
		var preview = document.querySelector('[data-ln-logo-preview]');
		if (!preview) return;

		var logo = _pendingLogo !== null ? _pendingLogo : lnSettings.getBrandLogo();
		if (logo) {
			preview.innerHTML = '';
			var img = document.createElement('img');
			img.src = logo;
			img.alt = 'Logo preview';
			preview.appendChild(img);
		} else {
			preview.innerHTML = '<span>No logo</span>';
		}
	}

	function _init() {
		// ─── Profile → Playlist bridge ───────────────────────────────
		document.addEventListener('ln-profile:switched', function (e) {
			var sidebar = _getSidebar();
			if (!sidebar) return;

			var profileId = e.detail.profileId;
			if (profileId) {
				sidebar.setAttribute('data-ln-playlist-profile', profileId);
			} else {
				sidebar.removeAttribute('data-ln-playlist-profile');
			}
		});

		// ─── Playlist persistence ────────────────────────────────────
		document.addEventListener('ln-playlist:changed', function () {
			var nav = _getNav();
			if (nav) {
				nav.dispatchEvent(new CustomEvent('ln-profile:request-persist'));
			}
		});

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
				var nav = _getNav();
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

			var nav = _getNav();
			if (nav) {
				nav.dispatchEvent(new CustomEvent('ln-profile:request-create', {
					detail: { name: name }
				}));
			}

			input.value = '';
			lnModal.close('modal-new-profile');
		});

		// ─── Profile event reactions (toasts, modal close) ───────────

		document.addEventListener('ln-profile:created', function () {
			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: { type: 'success', message: 'Profile created' }
			}));
		});

		document.addEventListener('ln-profile:deleted', function () {
			lnModal.close('modal-settings');
			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: { type: 'info', message: 'Profile deleted' }
			}));
		});

		// ─── Playlist UI actions ─────────────────────────────────────

		// Open new-playlist dialog
		document.addEventListener('click', function (e) {
			if (e.target.closest('[data-ln-action="new-playlist"]')) {
				var sidebar = _getSidebar();
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
				var libraryEl = document.querySelector('[data-ln-library]');
				if (libraryEl) {
					libraryEl.dispatchEvent(new CustomEvent('ln-library:request-fetch'));
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

				var sidebar = _getSidebar();
				if (sidebar) {
					sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-remove-track', {
						detail: { index: idx, playlistId: playlistId }
					}));
				}
			}
		});

		// Add track to playlist (from library dialog)
		document.addEventListener('click', function (e) {
			var btn = e.target.closest('[data-ln-action="add-to-playlist"]');
			if (!btn) return;

			var title = btn.getAttribute('data-track-title');
			var artist = btn.getAttribute('data-track-artist');
			if (!title) return;

			var sidebar = _getSidebar();
			if (sidebar) {
				sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-add-track', {
					detail: {
						title: title,
						artist: artist,
						duration: '',
						durationSec: 0,
						url: btn.getAttribute('data-track-url') || ''
					}
				}));
			}

			// Button feedback (UI concern — stays in coordinator)
			btn.textContent = 'Added!';
			btn.disabled = true;
			setTimeout(function () {
				btn.innerHTML = '<span class="ln-icon-add ln-icon--sm"></span> Add';
				btn.disabled = false;
			}, 1200);
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

			var sidebar = _getSidebar();
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

			var sidebar = _getSidebar();
			if (sidebar) {
				sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-edit-track', {
					detail: { index: idx, playlistId: playlistId, notes: notes }
				}));
			}
		});

		// ─── Library event reactions ────────────────────────────────

		document.addEventListener('ln-library:error', function (e) {
			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: { type: 'warn', message: e.detail.message || 'Library error' }
			}));
		});

		// Open settings from library empty state
		document.addEventListener('click', function (e) {
			if (e.target.closest('[data-ln-action="open-settings-from-library"]')) {
				lnModal.close('modal-track-library');
				_populateSettingsForm();
				lnModal.open('modal-settings');
			}
		});

		// ─── Playlist event reactions (toasts, modals) ───────────────

		document.addEventListener('ln-playlist:created', function () {
			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: { type: 'success', message: 'Playlist created' }
			}));
		});

		document.addEventListener('ln-playlist:track-edited', function () {
			lnModal.close('modal-edit-track');
			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: { type: 'success', message: 'Track updated' }
			}));
		});

		document.addEventListener('ln-playlist:track-removed', function () {
			lnModal.close('modal-edit-track');
			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: { type: 'warn', message: 'Track removed' }
			}));
		});

		// Edit track requested → populate form + open modal
		document.addEventListener('ln-playlist:open-edit', function (e) {
			var track = e.detail.track;

			var titleEl = document.querySelector('[data-ln-field="edit-track-title"]');
			var artistEl = document.querySelector('[data-ln-field="edit-track-artist"]');
			var notesInput = document.querySelector('[data-ln-field="edit-track-notes"]');

			if (titleEl) titleEl.textContent = track.title;
			if (artistEl) artistEl.textContent = track.artist + ' \u2014 ' + track.duration;
			if (notesInput) notesInput.value = track.notes || '';

			lnModal.open('modal-edit-track');

			if (notesInput) notesInput.focus();
		});

		// ─── Settings UI actions ────────────────────────────────────

		// Open settings dialog
		document.addEventListener('click', function (e) {
			if (e.target.closest('[data-ln-action="open-settings"]')) {
				_populateSettingsForm();
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
					_pendingLogo = ev.target.result;
					_updateLogoPreview();
				};
				reader.readAsDataURL(file);
			});
		}

		// Settings form submit
		document.addEventListener('ln-form:submit', function (e) {
			if (e.target.getAttribute('data-ln-form') !== 'settings') return;

			var apiInput = document.querySelector('[data-ln-setting="api-url"]');
			var apiUrl = apiInput ? apiInput.value.trim() : '';

			lnSettings.save({
				apiUrl: apiUrl,
				brandLogo: _pendingLogo !== null ? _pendingLogo : lnSettings.getBrandLogo()
			});

			_pendingLogo = null;
			lnModal.close('modal-settings');
			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: { type: 'success', message: 'Settings saved' }
			}));
		});

		// Load settings when profile system is ready
		document.addEventListener('ln-profile:ready', function () {
			lnDb.open().then(function () {
				return lnSettings.load();
			});
		});

		// ─── Deck wiring ────────────────────────────────────────────

		// Profile switch → reset both decks
		document.addEventListener('ln-profile:switched', function () {
			['a', 'b'].forEach(function (deckId) {
				var deckEl = _getDeck(deckId);
				if (deckEl) {
					deckEl.dispatchEvent(new CustomEvent('ln-deck:request-reset'));
				}
			});
		});

		// Playlist load-to-deck → dispatch request-load on target deck
		document.addEventListener('ln-playlist:load-to-deck', function (e) {
			var deckEl = _getDeck(e.detail.deckId);
			if (deckEl) {
				deckEl.dispatchEvent(new CustomEvent('ln-deck:request-load', {
					detail: {
						trackIndex: e.detail.trackIndex,
						track: e.detail.track
					}
				}));
			}
		});

		// Deck loaded → update sidebar highlight
		document.addEventListener('ln-deck:loaded', function (e) {
			var sidebar = _getSidebar();
			if (sidebar) {
				sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-highlight', {
					detail: { deckId: e.detail.deckId, index: e.detail.trackIndex }
				}));
			}
		});

		// Track removed → adjust deck indices
		document.addEventListener('ln-playlist:track-removed', function (e) {
			var removedIdx = e.detail.trackIndex;

			['a', 'b'].forEach(function (deckId) {
				var deckEl = _getDeck(deckId);
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

			_refreshDeckHighlights();
		});

		// Reordered → remap deck indices
		document.addEventListener('ln-playlist:reordered', function (e) {
			var oldToNew = e.detail.oldToNew;

			['a', 'b'].forEach(function (deckId) {
				var deckEl = _getDeck(deckId);
				if (!deckEl || !deckEl.lnDeck) return;
				var oldIdx = deckEl.lnDeck.trackIndex;

				if (oldIdx >= 0 && oldToNew.hasOwnProperty(oldIdx)) {
					deckEl.dispatchEvent(new CustomEvent('ln-deck:request-adjust-index', {
						detail: { newIndex: oldToNew[oldIdx] }
					}));
				}
			});

			_refreshDeckHighlights();
		});

		// Track added → auto-load to deck B if empty
		document.addEventListener('ln-playlist:track-added', function (e) {
			var deckB = _getDeck('b');
			if (deckB && deckB.lnDeck && deckB.lnDeck.trackIndex < 0) {
				deckB.dispatchEvent(new CustomEvent('ln-deck:request-load', {
					detail: {
						trackIndex: e.detail.trackIndex,
						track: e.detail.track
					}
				}));
			}
		});

		// Edit-track button (from deck) → bridge to playlist
		document.addEventListener('ln-deck:edit-requested', function (e) {
			var sidebar = _getSidebar();
			if (sidebar) {
				sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-open-edit', {
					detail: { index: e.detail.trackIndex }
				}));
			}
		});

		// ─── Volume slider ──────────────────────────────────────────

		var volumeSlider = document.querySelector('[data-ln-potentiometer="master"]');
		if (volumeSlider) {
			var _handleVolume = function () {
				var val = volumeSlider.value;
				var pct = val + '%';
				volumeSlider.style.background =
					'linear-gradient(to right, var(--accent) ' + pct + ', var(--track-bg) ' + pct + ')';
			};
			volumeSlider.addEventListener('input', _handleVolume);
			_handleVolume();
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', _init);
	} else {
		_init();
	}
})();
