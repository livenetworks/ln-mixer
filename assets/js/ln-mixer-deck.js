/* ====================================================================
   LN DJ Mixer — Deck Wiring + Autoplay + Loops
   Deck transport, highlights, autoplay sequencing, loop segments
   ==================================================================== */

function _formatTime(seconds) {
	const m = Math.floor(seconds / 60);
	const s = Math.floor(seconds % 60);
	return m + ':' + (s < 10 ? '0' : '') + s;
}

export function setupDeck(mixer) {

	/* ─── Autoplay ───────────────────────────────────────────────── */

	mixer._autoplayTick = function () {
		if (!this._autoplay || this._autoplayPreloaded) return;

		const decks = this.dom.querySelectorAll('[data-ln-deck]');
		let playing = null, free = null;
		decks.forEach(function (d) {
			if (!d.lnDeck) return;
			if (d.lnDeck.isPlaying) playing = d;
			else if (!free) free = d;
		});
		if (!playing || !free || playing.lnDeck.progress < 50) return;

		const sidebar = this._getSidebar();
		if (!sidebar || !sidebar.lnPlaylist) return;
		const plId = playing.dataset.lnFromPlaylist;
		const pl = plId && sidebar.lnPlaylist.playlists[plId];
		if (!pl || !pl.segments) return;

		const nextIdx = playing.lnDeck.trackIndex + 1;
		if (nextIdx >= pl.segments.length) return;
		if (free.lnDeck.trackIndex === nextIdx) { this._autoplayPreloaded = true; return; }

		// Resolve full track data from segment + catalog
		const seg = pl.segments[nextIdx];
		const cat = sidebar.lnPlaylist.trackCatalog[seg.url] || {};
		const nextTrack = {
			url: seg.url,
			title: cat.title || '',
			artist: cat.artist || '',
			duration: cat.duration || '',
			durationSec: cat.durationSec || 0,
			notes: seg.notes || '',
			loops: seg.loops || []
		};

		free.dataset.lnFromPlaylist = plId;
		this._loadTrackToDeck(free.getAttribute('data-ln-deck'), nextIdx, nextTrack);
		this._autoplayPreloaded = true;
	};

	mixer._autoplayOnEnded = function (endedEl) {
		if (!this._autoplay) return;
		const decks = this.dom.querySelectorAll('[data-ln-deck]');
		for (let i = 0; i < decks.length; i++) {
			if (decks[i] !== endedEl && decks[i].lnDeck && decks[i].lnDeck.trackIndex >= 0) {
				this._autoplayPreloaded = false;
				decks[i].dispatchEvent(new CustomEvent('ln-deck:request-play'));
				return;
			}
		}
	};

	/* ─── Scoped Event Bindings ──────────────────────────────────── */

	mixer._bindDeckWiring = function () {
		const self = this;

		// Profile switch → revoke blob URLs + reset decks + reset autoplay
		this.dom.addEventListener('ln-profile:switched', function () {
			if (self._autoplayTimer) { clearInterval(self._autoplayTimer); self._autoplayTimer = null; }
			self._autoplayPreloaded = false;

			const decks = self.dom.querySelectorAll('[data-ln-deck]');
			decks.forEach(function (deckEl) {
				const id = deckEl.getAttribute('data-ln-deck');
				if (self._blobUrls[id]) {
					URL.revokeObjectURL(self._blobUrls[id]);
					delete self._blobUrls[id];
				}
				deckEl.dispatchEvent(new CustomEvent('ln-deck:request-reset'));
			});
		});

		// Playlist load-to-deck → cache-aware load + track playlist context
		this.dom.addEventListener('ln-playlist:load-to-deck', function (e) {
			const deckEl = self._getDeck(e.detail.deckId);
			if (deckEl) deckEl.dataset.lnFromPlaylist = e.detail.playlistId;
			self._loadTrackToDeck(e.detail.deckId, e.detail.trackIndex, e.detail.track);
			self._autoplayPreloaded = false;
		});

		// Exclusive play — stop all other decks (accordion-style) + autoplay timer
		this.dom.addEventListener('ln-deck:played', function (e) {
			const allDecks = self.dom.querySelectorAll('[data-ln-deck]');
			allDecks.forEach(function (deck) {
				if (deck !== e.target) {
					deck.dispatchEvent(new CustomEvent('ln-deck:request-stop'));
				}
			});

			self._autoplayPreloaded = false;
			if (self._autoplay && !self._autoplayTimer) {
				self._autoplayTimer = setInterval(function () { self._autoplayTick(); }, 1000);
			}
		});

		// Autoplay — track ended → play other deck
		this.dom.addEventListener('ln-deck:ended', function (e) {
			self._autoplayOnEnded(e.target);
		});

		// Autoplay — stop timer when no deck is playing
		['ln-deck:stopped', 'ln-deck:paused'].forEach(function (evt) {
			self.dom.addEventListener(evt, function () {
				if (!self._autoplayTimer) return;
				let any = false;
				self.dom.querySelectorAll('[data-ln-deck]').forEach(function (d) {
					if (d.lnDeck && d.lnDeck.isPlaying) any = true;
				});
				if (!any) { clearInterval(self._autoplayTimer); self._autoplayTimer = null; }
			});
		});

		// Deck loaded → update sidebar highlight + connect audio routing
		this.dom.addEventListener('ln-deck:loaded', function (e) {
			const sidebar = self._getSidebar();
			if (sidebar) {
				sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-highlight', {
					detail: { deckId: e.detail.deckId, index: e.detail.trackIndex }
				}));
			}
			if (e.detail.track && e.detail.track.url) {
				self._connectDeckAudio(e.detail.deckId);
			}
		});

		// Duration auto-detected → update tracks store + notify sidebar
		this.dom.addEventListener('ln-deck:duration-detected', function (e) {
			const url = e.detail.trackUrl;
			if (!url) return;

			// Persist to tracks store
			lnDb.get('tracks', url).then(function (record) {
				if (!record) record = { url: url, title: '', artist: '' };
				record.duration = e.detail.duration;
				record.durationSec = e.detail.durationSec;
				lnDb.put('tracks', record);
			});

			// Update sidebar catalog + DOM
			const sidebar = self._getSidebar();
			if (sidebar) {
				sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-update-catalog', {
					detail: {
						url: url,
						track: {
							duration: e.detail.duration,
							durationSec: e.detail.durationSec
						}
					}
				}));
			}
		});

		// Waveform peaks generated → persist to tracks store
		this.dom.addEventListener('ln-deck:peaks-ready', function (e) {
			const trackUrl = e.detail.trackUrl;
			if (!trackUrl) return;

			lnDb.get('tracks', trackUrl).then(function (record) {
				if (!record) record = { url: trackUrl, title: '', artist: '', duration: '', durationSec: 0 };
				record.peaks = e.detail.peaks;
				record.peaksDuration = e.detail.peaksDuration;
				return lnDb.put('tracks', record);
			});
		});

		// Reordered → remap deck indices
		this.dom.addEventListener('ln-playlist:reordered', function (e) {
			const oldToNew = e.detail.oldToNew;

			self.dom.querySelectorAll('[data-ln-deck]').forEach(function (deckEl) {
				if (!deckEl.lnDeck) return;
				const oldIdx = deckEl.lnDeck.trackIndex;

				if (oldIdx >= 0 && oldToNew.hasOwnProperty(oldIdx)) {
					deckEl.dispatchEvent(new CustomEvent('ln-deck:request-adjust-index', {
						detail: { newIndex: oldToNew[oldIdx] }
					}));
				}
			});

			self._refreshDeckHighlights();
			if (self._autoplay) self._autoplayPreloaded = false;
		});

		// Track added → auto-load to first empty deck (cache-aware)
		this.dom.addEventListener('ln-playlist:track-added', function (e) {
			const decks = self.dom.querySelectorAll('[data-ln-deck]');
			for (let i = 0; i < decks.length; i++) {
				if (decks[i].lnDeck && decks[i].lnDeck.trackIndex < 0) {
					self._loadTrackToDeck(decks[i].getAttribute('data-ln-deck'), e.detail.trackIndex, e.detail.track);
					return;
				}
			}
		});

		// Edit-track button (from deck) → bridge to playlist
		this.dom.addEventListener('ln-deck:edit-requested', function (e) {
			const sidebar = self._getSidebar();
			if (sidebar) {
				sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-open-edit', {
					detail: { index: e.detail.trackIndex }
				}));
			}
		});
	};

	/* ─── Loop Segment Wiring ────────────────────────────────────── */

	mixer._bindLoopWiring = function () {
		const self = this;

		// Loop captured → open name-loop modal
		this.dom.addEventListener('ln-deck:loop-captured', function (e) {
			const form = document.querySelector('[data-ln-form="name-loop"]');
			if (!form) return;

			form.setAttribute('data-ln-deck-id', e.detail.deckId);
			form.setAttribute('data-ln-track-index', e.detail.trackIndex);
			form.setAttribute('data-ln-loop-start', e.detail.startSec);
			form.setAttribute('data-ln-loop-end', e.detail.endSec);
			form.setAttribute('data-ln-loop-start-pct', e.detail.startPct);
			form.setAttribute('data-ln-loop-end-pct', e.detail.endPct);

			const rangeEl = document.querySelector('[data-ln-field="loop-range"]');
			if (rangeEl) {
				rangeEl.textContent = _formatTime(e.detail.startSec) + ' \u2013 ' + _formatTime(e.detail.endSec);
			}

			const nameInput = document.querySelector('[data-ln-field="loop-name"]');
			if (nameInput) nameInput.value = '';

			lnModal.open('modal-name-loop');
			if (nameInput) nameInput.focus();
		});

		// Loop delete requested → remove from playlist
		this.dom.addEventListener('ln-deck:loop-delete-requested', function (e) {
			const sidebar = self._getSidebar();
			if (!sidebar || !sidebar.lnPlaylist) return;

			const playlistId = sidebar.lnPlaylist.currentId;
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
			const d = e.detail;
			self.dom.querySelectorAll('[data-ln-deck]').forEach(function (deckEl) {
				if (deckEl.lnDeck && deckEl.lnDeck.trackIndex === d.trackIndex) {
					deckEl.dispatchEvent(new CustomEvent('ln-deck:request-set-loops', {
						detail: { loops: d.loops }
					}));
				}
			});
		});

		this.dom.addEventListener('ln-playlist:loop-removed', function (e) {
			const d = e.detail;
			self.dom.querySelectorAll('[data-ln-deck]').forEach(function (deckEl) {
				if (deckEl.lnDeck && deckEl.lnDeck.trackIndex === d.trackIndex) {
					deckEl.dispatchEvent(new CustomEvent('ln-deck:request-set-loops', {
						detail: { loops: d.loops }
					}));
				}
			});
		});
	};

	/* ─── Global Event Bindings ──────────────────────────────────── */

	mixer._bindAutoplayToggle = function () {
		const self = this;

		document.addEventListener('click', function (e) {
			const btn = e.target.closest('[data-ln-action="toggle-autoplay"]');
			if (!btn) return;

			self._autoplay = !self._autoplay;
			btn.classList.toggle('active', self._autoplay);
			btn.setAttribute('aria-pressed', String(self._autoplay));

			if (!self._autoplay && self._autoplayTimer) {
				clearInterval(self._autoplayTimer);
				self._autoplayTimer = null;
			}

			window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
				detail: { type: 'info', message: self._autoplay ? 'Autoplay ON' : 'Autoplay OFF' }
			}));
		});
	};

	mixer._bindLoopActions = function () {
		const self = this;

		// Name loop form submit
		document.addEventListener('ln-form:submit', function (e) {
			if (e.target.getAttribute('data-ln-form') !== 'name-loop') return;

			const form = e.target;
			const nameInput = document.querySelector('[data-ln-field="loop-name"]');
			const name = nameInput ? nameInput.value.trim() : '';
			if (!name) {
				if (nameInput) nameInput.focus();
				return;
			}

			const deckId = form.getAttribute('data-ln-deck-id');
			const trackIndex = parseInt(form.getAttribute('data-ln-track-index'), 10);
			const startSec = parseFloat(form.getAttribute('data-ln-loop-start'));
			const endSec = parseFloat(form.getAttribute('data-ln-loop-end'));
			const startPct = parseFloat(form.getAttribute('data-ln-loop-start-pct'));
			const endPct = parseFloat(form.getAttribute('data-ln-loop-end-pct'));

			const loopData = {
				name: name,
				startSec: startSec,
				endSec: endSec,
				startPct: startPct,
				endPct: endPct
			};

			const sidebar = self._getSidebar();
			if (sidebar && sidebar.lnPlaylist) {
				const playlistId = sidebar.lnPlaylist.currentId;
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
	};

}
