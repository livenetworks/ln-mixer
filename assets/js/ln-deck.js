(function () {
	'use strict';

	var DOM_SELECTOR = 'data-ln-deck';
	var DOM_ATTRIBUTE = 'lnDeck';

	if (window[DOM_ATTRIBUTE] !== undefined) return;

	/* ====================================================================
	   HELPERS
	   ==================================================================== */

	function _dispatch(element, eventName, detail) {
		element.dispatchEvent(new CustomEvent(eventName, {
			bubbles: true,
			detail: detail || {}
		}));
	}

	function _formatTime(seconds) {
		var m = Math.floor(seconds / 60);
		var s = Math.floor(seconds % 60);
		return m + ':' + (s < 10 ? '0' : '') + s;
	}

	/* ====================================================================
	   CONSTRUCTOR / DISCOVERY
	   ==================================================================== */

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

	/* ====================================================================
	   COMPONENT
	   ==================================================================== */

	function _component(dom) {
		this.dom = dom;
		dom[DOM_ATTRIBUTE] = this;

		this.deckId = dom.getAttribute(DOM_SELECTOR);

		// State
		this.trackIndex = -1;
		this.track = null;
		this.progress = 0;
		this.isPlaying = false;

		// Audio
		this._audio = dom.querySelector('[data-ln-audio]');
		this._surfer = null;

		// Cache DOM (all within this.dom)
		this._els = {
			title:       dom.querySelector('[data-ln-field="title"]'),
			artist:      dom.querySelector('[data-ln-field="artist"]'),
			timeCurrent: dom.querySelector('[data-ln-field="time-current"]'),
			timeTotal:   dom.querySelector('[data-ln-field="time-total"]'),
			waveform:    dom.querySelector('[class*="waveform"][data-ln-waveform]') || dom.querySelector('.waveform'),
			progress:    dom.querySelector('.waveform-progress'),
			playhead:    dom.querySelector('.waveform-playhead'),
			cueRegion:   dom.querySelector('.cue-region'),
			cueStart:    dom.querySelector('.cue-marker--start'),
			cueEnd:      dom.querySelector('.cue-marker--end'),
			playBtn:     dom.querySelector('[data-ln-transport="play"]')
		};

		this._bindEvents();

		return this;
	}

	/* ====================================================================
	   EVENT BINDING
	   ==================================================================== */

	_component.prototype._bindEvents = function () {
		var self = this;

		// Click delegation within this deck root
		this.dom.addEventListener('click', function (e) {
			var transportBtn = e.target.closest('[data-ln-transport]');
			if (transportBtn) {
				self._handleTransport(transportBtn);
				return;
			}

			var cueBtn = e.target.closest('[data-ln-cue]');
			if (cueBtn) {
				self._handleCue(cueBtn);
				return;
			}

			var editBtn = e.target.closest('[data-ln-action="edit-track"]');
			if (editBtn) {
				self._handleEditRequest();
				return;
			}
		});

		// Request events (from coordinator)
		this.dom.addEventListener('ln-deck:request-load', function (e) {
			self.loadTrack(e.detail.trackIndex, e.detail.track, e.detail.peaks, e.detail.peaksDuration);
		});

		this.dom.addEventListener('ln-deck:request-reset', function () {
			self.reset();
		});

		this.dom.addEventListener('ln-deck:request-play', function () {
			self.play();
		});

		this.dom.addEventListener('ln-deck:request-stop', function () {
			self.stop();
		});

		this.dom.addEventListener('ln-deck:request-adjust-index', function (e) {
			self.adjustIndex(e.detail.newIndex);
		});
	};

	/* ====================================================================
	   INTERNAL HANDLERS
	   ==================================================================== */

	_component.prototype._handleTransport = function (btn) {
		var action = btn.getAttribute('data-ln-transport');

		if (action === 'play') {
			if (this.isPlaying) {
				this.pause();
			} else {
				this.play();
			}
		} else if (action === 'stop') {
			this.stop();
		}
	};

	_component.prototype._handleCue = function (btn) {
		var action = btn.getAttribute('data-ln-cue');

		if (action === 'loop') {
			btn.classList.toggle('active');
		} else if (action === 'mark-start' || action === 'mark-end') {
			btn.classList.add('active');
			setTimeout(function () { btn.classList.remove('active'); }, 300);
		}
	};

	_component.prototype._handleEditRequest = function () {
		if (this.trackIndex < 0) return;

		_dispatch(this.dom, 'ln-deck:edit-requested', {
			deckId: this.deckId,
			trackIndex: this.trackIndex
		});
	};

	/* ====================================================================
	   WAVESURFER LIFECYCLE
	   ==================================================================== */

	_component.prototype._initWaveSurfer = function (peaks, peaksDuration) {
		var container = this._els.waveform;
		if (!container || !this._audio) return;

		var self = this;

		var opts = {
			container: container,
			waveColor: '#888',
			progressColor: 'transparent',
			cursorWidth: 0,
			barWidth: 2,
			barGap: 1,
			barRadius: 1,
			height: 100,
			media: this._audio
		};

		if (peaks && peaks.length > 0 && peaksDuration > 0) {
			opts.peaks = peaks;
			opts.duration = peaksDuration;
		}

		this._hasCachedPeaks = !!(peaks && peaks.length > 0 && peaksDuration > 0);

		this._surfer = WaveSurfer.create(opts);

		container.classList.add('waveform--loaded');

		this._surfer.on('ready', function () {
			self._onAudioMetadata();
		});

		this._surfer.on('timeupdate', function (currentTime) {
			self._onTimeUpdate(currentTime);
		});

		this._surfer.on('finish', function () {
			self._onEnded();
		});
	};

	_component.prototype._destroySurfer = function () {
		if (this._surfer) {
			this._surfer.destroy();
			this._surfer = null;
		}
		this._hasCachedPeaks = false;
		if (this._audio) {
			this._audio.removeAttribute('src');
			this._audio.load();
		}
		var container = this._els.waveform;
		if (container) {
			container.classList.remove('waveform--loaded');
		}
	};

	/* ====================================================================
	   AUDIO EVENT HANDLERS
	   ==================================================================== */

	_component.prototype._onAudioMetadata = function () {
		if (!this._audio || !this.track) return;
		var duration = this._audio.duration;
		if (!duration || !isFinite(duration) || duration <= 0) return;

		this.track.durationSec = duration;
		this.track.duration = _formatTime(duration);
		if (this._els.timeTotal) this._els.timeTotal.textContent = this.track.duration;

		_dispatch(this.dom, 'ln-deck:duration-detected', {
			deckId: this.deckId,
			trackIndex: this.trackIndex,
			durationSec: duration,
			duration: this.track.duration
		});

		// Export peaks if freshly generated (not pre-loaded from cache)
		if (!this._hasCachedPeaks && this._surfer) {
			var peaks = this._surfer.exportPeaks();
			if (peaks && peaks.length > 0) {
				_dispatch(this.dom, 'ln-deck:peaks-ready', {
					deckId: this.deckId,
					trackUrl: this.track._originalUrl || this.track.url,
					peaks: peaks,
					peaksDuration: duration
				});
			}
		}
	};

	_component.prototype._onTimeUpdate = function (currentTime) {
		if (!this.track || !this._audio) return;
		var duration = this._audio.duration;
		if (!duration || !isFinite(duration)) return;

		this.progress = (currentTime / duration) * 100;
		if (this._els.timeCurrent) this._els.timeCurrent.textContent = _formatTime(currentTime);
		if (this._els.progress) this._els.progress.style.width = this.progress + '%';
		if (this._els.playhead) this._els.playhead.style.left = this.progress + '%';
	};

	_component.prototype._onEnded = function () {
		this.progress = 100;
		this.isPlaying = false;
		this._updatePlayButton(false);

		_dispatch(this.dom, 'ln-deck:ended', {
			deckId: this.deckId,
			trackIndex: this.trackIndex
		});
	};

	/* ====================================================================
	   PUBLIC API — COMMANDS
	   ==================================================================== */

	_component.prototype.loadTrack = function (index, trackData, peaks, peaksDuration) {
		if (this.trackIndex === index) return;

		this._destroySurfer();
		this.trackIndex = index;
		this.track = trackData || null;
		this.progress = 0;
		this.isPlaying = false;

		this._render();
		this._updatePlayButton(false);

		if (this.track && this.track.url && this._audio) {
			this._audio.src = this.track.url;
			this._audio.load();
			this._initWaveSurfer(peaks, peaksDuration);
		}

		_dispatch(this.dom, 'ln-deck:loaded', {
			deckId: this.deckId,
			trackIndex: index,
			track: this.track
		});
	};

	_component.prototype.play = function () {
		if (this.trackIndex < 0 || !this.track) return;
		if (!this._audio || !this._audio.src) return;

		var self = this;
		this._audio.play().then(function () {
			self.isPlaying = true;
			self._updatePlayButton(true);

			_dispatch(self.dom, 'ln-deck:played', {
				deckId: self.deckId,
				trackIndex: self.trackIndex
			});
		}).catch(function (err) {
			console.warn('Play failed for deck ' + self.deckId + ':', err);
		});
	};

	_component.prototype.pause = function () {
		if (this._audio) {
			this._audio.pause();
		}
		this.isPlaying = false;
		this._updatePlayButton(false);

		_dispatch(this.dom, 'ln-deck:paused', {
			deckId: this.deckId,
			trackIndex: this.trackIndex
		});
	};

	_component.prototype.stop = function () {
		if (this._audio) {
			this._audio.pause();
			this._audio.currentTime = 0;
		}
		this.isPlaying = false;
		this.progress = 0;
		this._updatePlayButton(false);
		this._render();

		_dispatch(this.dom, 'ln-deck:stopped', {
			deckId: this.deckId,
			trackIndex: this.trackIndex
		});
	};

	_component.prototype.reset = function () {
		this._destroySurfer();
		this.trackIndex = -1;
		this.track = null;
		this.progress = 0;
		this.isPlaying = false;

		this._render();
		this._updatePlayButton(false);

		_dispatch(this.dom, 'ln-deck:reset', {
			deckId: this.deckId
		});
	};

	_component.prototype.adjustIndex = function (newIndex) {
		this.trackIndex = newIndex;
	};

	/* ====================================================================
	   PUBLIC API — QUERIES
	   ==================================================================== */

	_component.prototype.getTrackIndex = function () {
		return this.trackIndex;
	};

	_component.prototype.getTrack = function () {
		return this.track;
	};

	_component.prototype.getDeckId = function () {
		return this.deckId;
	};

	/* ====================================================================
	   RENDERING
	   ==================================================================== */

	_component.prototype._render = function () {
		var e = this._els;
		var track = this.track;

		if (!track) {
			if (e.title) e.title.textContent = '\u2014';
			if (e.artist) e.artist.textContent = '';
			if (e.timeCurrent) e.timeCurrent.textContent = '0:00';
			if (e.timeTotal) e.timeTotal.textContent = '0:00';
			if (e.progress) e.progress.style.width = '0%';
			if (e.playhead) e.playhead.style.left = '0%';
			if (e.cueRegion) e.cueRegion.style.display = 'none';
			if (e.cueStart) e.cueStart.style.display = 'none';
			if (e.cueEnd) e.cueEnd.style.display = 'none';
			return;
		}

		if (e.title) e.title.textContent = track.title;
		if (e.artist) e.artist.textContent = track.artist;
		if (e.timeTotal) e.timeTotal.textContent = track.duration;

		var currentSec = Math.floor(track.durationSec * (this.progress / 100));
		if (e.timeCurrent) e.timeCurrent.textContent = _formatTime(currentSec);

		if (e.progress) e.progress.style.width = this.progress + '%';
		if (e.playhead) e.playhead.style.left = this.progress + '%';

		if (track.cueStartPct > 0 || track.cueEndPct > 0) {
			if (e.cueStart) { e.cueStart.style.left = track.cueStartPct + '%'; e.cueStart.style.display = ''; }
			if (e.cueEnd) { e.cueEnd.style.left = track.cueEndPct + '%'; e.cueEnd.style.display = ''; }
			if (e.cueRegion) { e.cueRegion.style.left = track.cueStartPct + '%'; e.cueRegion.style.width = (track.cueEndPct - track.cueStartPct) + '%'; e.cueRegion.style.display = ''; }
		} else {
			if (e.cueStart) e.cueStart.style.display = 'none';
			if (e.cueEnd) e.cueEnd.style.display = 'none';
			if (e.cueRegion) e.cueRegion.style.display = 'none';
		}
	};

	_component.prototype._updatePlayButton = function (playing) {
		var btn = this._els.playBtn;
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
	};

	/* ====================================================================
	   DOM OBSERVER + INIT
	   ==================================================================== */

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
