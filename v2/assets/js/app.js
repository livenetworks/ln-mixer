(function () {
	'use strict';

	/* ====================================================================
	   STATE
	   ==================================================================== */

	var deckState = {
		a: { trackIndex: -1, progress: 0, isPlaying: false, timer: null },
		b: { trackIndex: -1, progress: 0, isPlaying: false, timer: null }
	};

	/* ====================================================================
	   DOM REFERENCES
	   ==================================================================== */

	var els = {};

	function _cacheDom() {
		els.volumeSlider = document.querySelector('[data-ln-potentiometer="master"]');

		// Deck A DOM
		els.deckA = document.querySelector('[data-ln-deck="a"]');
		els.deckATitle = els.deckA.querySelector('[data-ln-field="title"]');
		els.deckAArtist = els.deckA.querySelector('[data-ln-field="artist"]');
		els.deckATimeCurrent = els.deckA.querySelector('[data-ln-field="time-current"]');
		els.deckATimeTotal = els.deckA.querySelector('[data-ln-field="time-total"]');
		els.deckAProgress = els.deckA.querySelector('.waveform-progress');
		els.deckAPlayhead = els.deckA.querySelector('.waveform-playhead');
		els.deckACueRegion = els.deckA.querySelector('.cue-region');
		els.deckACueStart = els.deckA.querySelector('.cue-marker--start');
		els.deckACueEnd = els.deckA.querySelector('.cue-marker--end');

		// Deck B DOM
		els.deckB = document.querySelector('[data-ln-deck="b"]');
		els.deckBTitle = els.deckB.querySelector('[data-ln-field="title-b"]');
		els.deckBArtist = els.deckB.querySelector('[data-ln-field="artist-b"]');
		els.deckBTimeCurrent = els.deckB.querySelector('[data-ln-field="time-current-b"]');
		els.deckBTimeTotal = els.deckB.querySelector('[data-ln-field="time-total-b"]');
		els.deckBProgress = els.deckB.querySelector('.waveform-progress');
		els.deckBPlayhead = els.deckB.querySelector('.waveform-playhead');
		els.deckBCueRegion = els.deckB.querySelector('.cue-region');
		els.deckBCueStart = els.deckB.querySelector('.cue-marker--start');
		els.deckBCueEnd = els.deckB.querySelector('.cue-marker--end');
	}

	/* ====================================================================
	   HELPERS
	   ==================================================================== */

	function _formatTime(seconds) {
		var m = Math.floor(seconds / 60);
		var s = Math.floor(seconds % 60);
		return m + ':' + (s < 10 ? '0' : '') + s;
	}

	function _getSidebar() {
		return document.querySelector('[data-ln-playlist]');
	}

	function _getTrack(deckId) {
		var sidebar = _getSidebar();
		if (!sidebar || !sidebar.lnPlaylist) return null;
		return sidebar.lnPlaylist.getTrack(deckState[deckId].trackIndex);
	}

	function _getDeckEls(deckId) {
		if (deckId === 'a') {
			return {
				title: els.deckATitle,
				artist: els.deckAArtist,
				timeCurrent: els.deckATimeCurrent,
				timeTotal: els.deckATimeTotal,
				progress: els.deckAProgress,
				playhead: els.deckAPlayhead,
				cueRegion: els.deckACueRegion,
				cueStart: els.deckACueStart,
				cueEnd: els.deckACueEnd,
				root: els.deckA
			};
		}
		return {
			title: els.deckBTitle,
			artist: els.deckBArtist,
			timeCurrent: els.deckBTimeCurrent,
			timeTotal: els.deckBTimeTotal,
			progress: els.deckBProgress,
			playhead: els.deckBPlayhead,
			cueRegion: els.deckBCueRegion,
			cueStart: els.deckBCueStart,
			cueEnd: els.deckBCueEnd,
			root: els.deckB
		};
	}

	/* ====================================================================
	   UPDATE DECK DISPLAY
	   ==================================================================== */

	function _updateDeck(deckId) {
		var track = _getTrack(deckId);
		var d = _getDeckEls(deckId);
		var state = deckState[deckId];

		if (!track) {
			d.title.textContent = '\u2014';
			d.artist.textContent = '';
			d.timeCurrent.textContent = '0:00';
			d.timeTotal.textContent = '0:00';
			d.progress.style.width = '0%';
			d.playhead.style.left = '0%';
			d.cueRegion.style.display = 'none';
			d.cueStart.style.display = 'none';
			d.cueEnd.style.display = 'none';
			return;
		}

		d.title.textContent = track.title;
		d.artist.textContent = track.artist;
		d.timeTotal.textContent = track.duration;

		var currentSec = Math.floor(track.durationSec * (state.progress / 100));
		d.timeCurrent.textContent = _formatTime(currentSec);

		d.progress.style.width = state.progress + '%';
		d.playhead.style.left = state.progress + '%';

		// Cue markers
		if (track.cueStartPct > 0 || track.cueEndPct > 0) {
			d.cueStart.style.left = track.cueStartPct + '%';
			d.cueStart.style.display = '';
			d.cueEnd.style.left = track.cueEndPct + '%';
			d.cueEnd.style.display = '';
			d.cueRegion.style.left = track.cueStartPct + '%';
			d.cueRegion.style.width = (track.cueEndPct - track.cueStartPct) + '%';
			d.cueRegion.style.display = '';
		} else {
			d.cueStart.style.display = 'none';
			d.cueEnd.style.display = 'none';
			d.cueRegion.style.display = 'none';
		}
	}

	/* ====================================================================
	   TRANSPORT
	   ==================================================================== */

	function _handleTransport(e) {
		var btn = e.target.closest('[data-ln-transport]');
		if (!btn) return;

		var action = btn.getAttribute('data-ln-transport');
		var deckId = btn.getAttribute('data-ln-deck-target');
		if (!deckId) return;

		var state = deckState[deckId];

		if (action === 'play') {
			state.isPlaying = !state.isPlaying;
			_updatePlayButton(deckId, state.isPlaying);
			if (state.isPlaying) {
				_startProgress(deckId);
			} else {
				_stopProgress(deckId);
			}
		} else if (action === 'stop') {
			state.isPlaying = false;
			state.progress = 0;
			_stopProgress(deckId);
			_updatePlayButton(deckId, false);
			_updateDeck(deckId);
		}
	}

	function _updatePlayButton(deckId, playing) {
		var btn = document.querySelector('[data-ln-transport="play"][data-ln-deck-target="' + deckId + '"]');
		if (!btn) return;

		var icon = btn.querySelector('[class*="ln-icon-"]');
		var label = btn.querySelector('.label');

		if (playing) {
			if (icon) icon.className = 'ln-icon-pause';
			if (label) label.textContent = 'Pause';
			btn.classList.add('active');
		} else {
			if (icon) icon.className = 'ln-icon-play';
			if (label) label.textContent = 'Play';
			btn.classList.remove('active');
		}
	}

	/* ====================================================================
	   CUE & LOOP BUTTONS
	   ==================================================================== */

	function _handleCue(e) {
		var btn = e.target.closest('[data-ln-cue]');
		if (!btn) return;

		var action = btn.getAttribute('data-ln-cue');

		if (action === 'loop') {
			btn.classList.toggle('active');
		} else if (action === 'mark-start' || action === 'mark-end') {
			btn.classList.add('active');
			setTimeout(function () { btn.classList.remove('active'); }, 300);
		}
	}

	/* ====================================================================
	   PROGRESS SIMULATION
	   ==================================================================== */

	function _startProgress(deckId) {
		_stopProgress(deckId);
		var track = _getTrack(deckId);
		if (!track) return;

		var state = deckState[deckId];
		var d = _getDeckEls(deckId);

		var intervalMs = (track.durationSec * 1000) / 100;
		if (intervalMs < 100) intervalMs = 100;

		state.timer = setInterval(function () {
			state.progress += 1;
			if (state.progress >= 100) {
				state.progress = 100;
				_stopProgress(deckId);
				state.isPlaying = false;
				_updatePlayButton(deckId, false);
				return;
			}

			var currentSec = Math.floor(track.durationSec * (state.progress / 100));
			d.timeCurrent.textContent = _formatTime(currentSec);
			d.progress.style.width = state.progress + '%';
			d.playhead.style.left = state.progress + '%';
		}, intervalMs);
	}

	function _stopProgress(deckId) {
		var state = deckState[deckId];
		if (state.timer) {
			clearInterval(state.timer);
			state.timer = null;
		}
	}

	/* ====================================================================
	   DECK ← PLAYLIST EVENTS
	   ==================================================================== */

	function _loadToDeck(deckId, trackIndex) {
		// Don't reload if already on this deck
		if (deckState[deckId].trackIndex === trackIndex) return;

		_stopProgress(deckId);
		deckState[deckId].trackIndex = trackIndex;
		deckState[deckId].progress = 0;
		deckState[deckId].isPlaying = false;

		_updateDeck(deckId);
		_updatePlayButton(deckId, false);

		// Update highlight in sidebar
		var sidebar = _getSidebar();
		if (sidebar) {
			sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-highlight', {
				detail: { deckId: deckId, index: trackIndex }
			}));
		}
	}

	function _handleTrackRemoved(e) {
		var idx = e.detail.trackIndex;

		['a', 'b'].forEach(function (deckId) {
			if (deckState[deckId].trackIndex === idx) {
				deckState[deckId].trackIndex = -1;
				deckState[deckId].progress = 0;
				deckState[deckId].isPlaying = false;
				_stopProgress(deckId);
				_updateDeck(deckId);
				_updatePlayButton(deckId, false);
			} else if (deckState[deckId].trackIndex > idx) {
				deckState[deckId].trackIndex--;
			}
		});

		// Update highlights after index changes
		var sidebar = _getSidebar();
		if (sidebar) {
			sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-highlight', {
				detail: { deckId: 'a', index: deckState.a.trackIndex }
			}));
			sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-highlight', {
				detail: { deckId: 'b', index: deckState.b.trackIndex }
			}));
		}
	}

	function _handleReordered(e) {
		var oldToNew = e.detail.oldToNew;

		['a', 'b'].forEach(function (deckId) {
			var oldIdx = deckState[deckId].trackIndex;
			if (oldIdx >= 0 && oldToNew.hasOwnProperty(oldIdx)) {
				deckState[deckId].trackIndex = oldToNew[oldIdx];
			}
		});

		// Update highlights after index changes
		var sidebar = _getSidebar();
		if (sidebar) {
			sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-highlight', {
				detail: { deckId: 'a', index: deckState.a.trackIndex }
			}));
			sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-highlight', {
				detail: { deckId: 'b', index: deckState.b.trackIndex }
			}));
		}
	}

	function _handleTrackAdded(e) {
		// Auto-load to deck B if empty
		if (deckState.b.trackIndex < 0) {
			_loadToDeck('b', e.detail.trackIndex);
		}
	}

	/* ====================================================================
	   DECK DIALOG ACTIONS
	   ==================================================================== */

	function _handleDialogActions(e) {
		// Edit track (from deck "Opis" button)
		var btn = e.target.closest('[data-ln-action="edit-track"]');
		if (btn) {
			var deckId = btn.getAttribute('data-ln-deck-target');
			if (deckId && deckState[deckId].trackIndex >= 0) {
				var sidebar = _getSidebar();
				if (sidebar) {
					sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-open-edit', {
						detail: { index: deckState[deckId].trackIndex }
					}));
				}
			}
		}
	}

	/* ====================================================================
	   VOLUME SLIDER
	   ==================================================================== */

	function _handleVolume() {
		var val = els.volumeSlider.value;
		var pct = val + '%';
		els.volumeSlider.style.background =
			'linear-gradient(to right, var(--accent) ' + pct + ', var(--track-bg) ' + pct + ')';
	}

	/* ====================================================================
	   INIT
	   ==================================================================== */

	function _init() {
		_cacheDom();

		// Global click delegation (deck-related actions only)
		document.addEventListener('click', function (e) {
			if (e.target.closest('[data-ln-transport]')) {
				_handleTransport(e);
				return;
			}
			if (e.target.closest('[data-ln-cue]')) {
				_handleCue(e);
				return;
			}
			_handleDialogActions(e);
		});

		// Volume
		if (els.volumeSlider) {
			els.volumeSlider.addEventListener('input', _handleVolume);
			_handleVolume();
		}

		// ln-profile events
		document.addEventListener('ln-profile:switched', function () {
			_stopProgress('a');
			_stopProgress('b');

			deckState.a = { trackIndex: -1, progress: 0, isPlaying: false, timer: null };
			deckState.b = { trackIndex: -1, progress: 0, isPlaying: false, timer: null };

			_updateDeck('a');
			_updateDeck('b');
			_updatePlayButton('a', false);
			_updatePlayButton('b', false);
		});

		// ln-playlist events
		document.addEventListener('ln-playlist:load-to-deck', function (e) {
			_loadToDeck(e.detail.deckId, e.detail.trackIndex);
		});

		document.addEventListener('ln-playlist:track-removed', _handleTrackRemoved);
		document.addEventListener('ln-playlist:reordered', _handleReordered);
		document.addEventListener('ln-playlist:track-added', _handleTrackAdded);
	}

	// Boot
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', _init);
	} else {
		_init();
	}

})();
