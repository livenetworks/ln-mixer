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
		this._timer = null;

		// Cache DOM (all within this.dom)
		this._els = {
			title:       dom.querySelector('[data-ln-field="title"]'),
			artist:      dom.querySelector('[data-ln-field="artist"]'),
			timeCurrent: dom.querySelector('[data-ln-field="time-current"]'),
			timeTotal:   dom.querySelector('[data-ln-field="time-total"]'),
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
			self.loadTrack(e.detail.trackIndex, e.detail.track);
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
	   PUBLIC API — COMMANDS
	   ==================================================================== */

	_component.prototype.loadTrack = function (index, trackData) {
		if (this.trackIndex === index) return;

		this._stopProgress();
		this.trackIndex = index;
		this.track = trackData || null;
		this.progress = 0;
		this.isPlaying = false;

		this._render();
		this._updatePlayButton(false);

		_dispatch(this.dom, 'ln-deck:loaded', {
			deckId: this.deckId,
			trackIndex: index,
			track: this.track
		});
	};

	_component.prototype.play = function () {
		if (this.trackIndex < 0 || !this.track) return;

		this.isPlaying = true;
		this._updatePlayButton(true);
		this._startProgress();

		_dispatch(this.dom, 'ln-deck:played', {
			deckId: this.deckId,
			trackIndex: this.trackIndex
		});
	};

	_component.prototype.pause = function () {
		this.isPlaying = false;
		this._updatePlayButton(false);
		this._stopProgress();

		_dispatch(this.dom, 'ln-deck:paused', {
			deckId: this.deckId,
			trackIndex: this.trackIndex
		});
	};

	_component.prototype.stop = function () {
		this.isPlaying = false;
		this.progress = 0;
		this._stopProgress();
		this._updatePlayButton(false);
		this._render();

		_dispatch(this.dom, 'ln-deck:stopped', {
			deckId: this.deckId,
			trackIndex: this.trackIndex
		});
	};

	_component.prototype.reset = function () {
		this._stopProgress();
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
			e.title.textContent = '\u2014';
			e.artist.textContent = '';
			e.timeCurrent.textContent = '0:00';
			e.timeTotal.textContent = '0:00';
			e.progress.style.width = '0%';
			e.playhead.style.left = '0%';
			e.cueRegion.style.display = 'none';
			e.cueStart.style.display = 'none';
			e.cueEnd.style.display = 'none';
			return;
		}

		e.title.textContent = track.title;
		e.artist.textContent = track.artist;
		e.timeTotal.textContent = track.duration;

		var currentSec = Math.floor(track.durationSec * (this.progress / 100));
		e.timeCurrent.textContent = _formatTime(currentSec);

		e.progress.style.width = this.progress + '%';
		e.playhead.style.left = this.progress + '%';

		if (track.cueStartPct > 0 || track.cueEndPct > 0) {
			e.cueStart.style.left = track.cueStartPct + '%';
			e.cueStart.style.display = '';
			e.cueEnd.style.left = track.cueEndPct + '%';
			e.cueEnd.style.display = '';
			e.cueRegion.style.left = track.cueStartPct + '%';
			e.cueRegion.style.width = (track.cueEndPct - track.cueStartPct) + '%';
			e.cueRegion.style.display = '';
		} else {
			e.cueStart.style.display = 'none';
			e.cueEnd.style.display = 'none';
			e.cueRegion.style.display = 'none';
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
	   PROGRESS SIMULATION
	   ==================================================================== */

	_component.prototype._startProgress = function () {
		this._stopProgress();
		if (!this.track) return;

		var self = this;
		var e = this._els;
		var durationSec = this.track.durationSec;

		var intervalMs = (durationSec * 1000) / 100;
		if (intervalMs < 100) intervalMs = 100;

		this._timer = setInterval(function () {
			self.progress += 1;
			if (self.progress >= 100) {
				self.progress = 100;
				self._stopProgress();
				self.isPlaying = false;
				self._updatePlayButton(false);

				_dispatch(self.dom, 'ln-deck:ended', {
					deckId: self.deckId,
					trackIndex: self.trackIndex
				});
				return;
			}

			var currentSec = Math.floor(durationSec * (self.progress / 100));
			e.timeCurrent.textContent = _formatTime(currentSec);
			e.progress.style.width = self.progress + '%';
			e.playhead.style.left = self.progress + '%';
		}, intervalMs);
	};

	_component.prototype._stopProgress = function () {
		if (this._timer) {
			clearInterval(this._timer);
			this._timer = null;
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
