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

		// Loop state
		this._pendingLoopStart = null; // seconds — set on mark-start
		this._pendingCueBtn = null;    // Cue A button reference for active state
		this._activeLoopIndex = -1;    // index into track.loops[]
		this._loopEnabled = false;     // LED toggle

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
			playBtn:     dom.querySelector('[data-ln-transport="play"]'),
			loopBtn:     dom.querySelector('[data-ln-cue="loop"]'),
			loopSegments: dom.querySelector('[data-ln-loop-segments]')
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

		// Loop segment buttons
		var segContainer = this._els.loopSegments;
		if (segContainer) {
			segContainer.addEventListener('click', function (e) {
				var removeBtn = e.target.closest('.loop-seg-remove');
				if (removeBtn) {
					e.stopPropagation();
					var segBtn = removeBtn.closest('[data-ln-loop-index]');
					if (segBtn) {
						var idx = parseInt(segBtn.getAttribute('data-ln-loop-index'), 10);
						_dispatch(self.dom, 'ln-deck:loop-delete-requested', {
							deckId: self.deckId,
							trackIndex: self.trackIndex,
							loopIndex: idx
						});
					}
					return;
				}

				var loopBtn = e.target.closest('[data-ln-loop-index]');
				if (loopBtn) {
					var loopIdx = parseInt(loopBtn.getAttribute('data-ln-loop-index'), 10);
					self.activateLoop(loopIdx);
				}
			});
		}

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

		this.dom.addEventListener('ln-deck:request-set-loops', function (e) {
			if (self.track) {
				self.track.loops = e.detail.loops;
				self._renderLoopSegments();
			}
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
			this._loopEnabled = !this._loopEnabled;
			btn.classList.toggle('active', this._loopEnabled);
			btn.setAttribute('aria-pressed', this._loopEnabled ? 'true' : 'false');
			return;
		}

		if (!this._audio || !this.track || this.trackIndex < 0) return;
		var currentTime = this._audio.currentTime;
		var duration = this._audio.duration;
		if (!duration || !isFinite(duration)) return;

		if (action === 'mark-start') {
			this._pendingLoopStart = currentTime;
			if (this._pendingCueBtn) this._pendingCueBtn.classList.remove('active');
			this._pendingCueBtn = btn;
			btn.classList.add('active');
		} else if (action === 'mark-end') {
			if (this._pendingLoopStart === null) return;
			var startSec = this._pendingLoopStart;
			var endSec = currentTime;
			this._pendingLoopStart = null;
			if (this._pendingCueBtn) {
				this._pendingCueBtn.classList.remove('active');
				this._pendingCueBtn = null;
			}

			// Swap if needed
			if (endSec < startSec) {
				var tmp = startSec;
				startSec = endSec;
				endSec = tmp;
			}
			// Minimum 0.5s segment
			if (endSec - startSec < 0.5) return;

			btn.classList.add('active');
			setTimeout(function () { btn.classList.remove('active'); }, 300);

			_dispatch(this.dom, 'ln-deck:loop-captured', {
				deckId: this.deckId,
				trackIndex: this.trackIndex,
				startSec: startSec,
				endSec: endSec,
				startPct: (startSec / duration) * 100,
				endPct: (endSec / duration) * 100
			});
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

		var progressColor = this.deckId === 'b' ? '#44aaff' : '#ffa500';

		var opts = {
			container: container,
			waveColor: 'rgba(136, 136, 136, 0.5)',
			progressColor: progressColor,
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

		// Loop enforcement
		if (this._loopEnabled && this._activeLoopIndex >= 0 && this.track.loops) {
			var loop = this.track.loops[this._activeLoopIndex];
			if (loop && currentTime >= loop.endSec) {
				this._audio.currentTime = loop.startSec;
			}
		}
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

		// Reset loop state
		this._pendingLoopStart = null;
		if (this._pendingCueBtn) { this._pendingCueBtn.classList.remove('active'); this._pendingCueBtn = null; }
		this._activeLoopIndex = -1;
		this._loopEnabled = false;
		if (this._els.loopBtn) {
			this._els.loopBtn.classList.remove('active');
			this._els.loopBtn.setAttribute('aria-pressed', 'false');
		}

		this._render();
		this._renderLoopSegments();
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

		// Reset loop state
		this._pendingLoopStart = null;
		if (this._pendingCueBtn) { this._pendingCueBtn.classList.remove('active'); this._pendingCueBtn = null; }
		this._activeLoopIndex = -1;
		this._loopEnabled = false;
		if (this._els.loopBtn) {
			this._els.loopBtn.classList.remove('active');
			this._els.loopBtn.setAttribute('aria-pressed', 'false');
		}

		this._render();
		this._renderLoopSegments();
		this._updatePlayButton(false);

		_dispatch(this.dom, 'ln-deck:reset', {
			deckId: this.deckId
		});
	};

	_component.prototype.adjustIndex = function (newIndex) {
		this.trackIndex = newIndex;
	};

	_component.prototype.activateLoop = function (idx) {
		if (!this.track || !this.track.loops) return;

		// Toggle off if same
		if (this._activeLoopIndex === idx) {
			this._activeLoopIndex = -1;
		} else {
			this._activeLoopIndex = idx;
			var loop = this.track.loops[idx];
			if (loop && this._audio) {
				this._audio.currentTime = loop.startSec;
			}
		}

		this._renderActiveRegion();
		this._updateSegmentHighlight();

		_dispatch(this.dom, 'ln-deck:loop-activated', {
			deckId: this.deckId,
			loopIndex: this._activeLoopIndex
		});
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

		this._renderActiveRegion();
	};

	_component.prototype._renderActiveRegion = function () {
		var e = this._els;
		var loop = null;

		if (this._activeLoopIndex >= 0 && this.track && this.track.loops) {
			loop = this.track.loops[this._activeLoopIndex];
		}

		if (loop) {
			if (e.cueStart) { e.cueStart.style.left = loop.startPct + '%'; e.cueStart.style.display = ''; }
			if (e.cueEnd) { e.cueEnd.style.left = loop.endPct + '%'; e.cueEnd.style.display = ''; }
			if (e.cueRegion) {
				e.cueRegion.style.left = loop.startPct + '%';
				e.cueRegion.style.width = (loop.endPct - loop.startPct) + '%';
				e.cueRegion.style.display = '';
			}
		} else {
			if (e.cueStart) e.cueStart.style.display = 'none';
			if (e.cueEnd) e.cueEnd.style.display = 'none';
			if (e.cueRegion) e.cueRegion.style.display = 'none';
		}
	};

	_component.prototype._renderLoopSegments = function () {
		var container = this._els.loopSegments;
		if (!container) return;

		container.innerHTML = '';

		if (!this.track || !this.track.loops || this.track.loops.length === 0) return;

		for (var i = 0; i < this.track.loops.length; i++) {
			var loop = this.track.loops[i];
			var btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'loop-seg-btn' + (i === this._activeLoopIndex ? ' active' : '');
			btn.setAttribute('data-ln-loop-index', i);

			var label = document.createElement('span');
			label.className = 'loop-seg-label';

			var led = document.createElement('mark');
			led.className = 'led-indicator';
			label.appendChild(led);

			var nameSpan = document.createElement('span');
			nameSpan.textContent = loop.name;
			label.appendChild(nameSpan);

			btn.appendChild(label);

			var removeBtn = document.createElement('button');
			removeBtn.type = 'button';
			removeBtn.className = 'loop-seg-remove';
			removeBtn.title = 'Remove loop';
			var removeIcon = document.createElement('span');
			removeIcon.className = 'ln-icon-close';
			removeBtn.appendChild(removeIcon);

			btn.appendChild(removeBtn);

			container.appendChild(btn);
		}
	};

	_component.prototype._updateSegmentHighlight = function () {
		var container = this._els.loopSegments;
		if (!container) return;

		var btns = container.querySelectorAll('[data-ln-loop-index]');
		var self = this;
		btns.forEach(function (btn) {
			var idx = parseInt(btn.getAttribute('data-ln-loop-index'), 10);
			btn.classList.toggle('active', idx === self._activeLoopIndex);
		});
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
