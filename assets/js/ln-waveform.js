(function () {
	'use strict';

	var DOM_SELECTOR = 'data-ln-waveform';
	var DOM_ATTRIBUTE = 'lnWaveform';

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

	function _niceInterval(raw) {
		var nice = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600];
		for (var i = 0; i < nice.length; i++) {
			if (nice[i] >= raw) return nice[i];
		}
		return nice[nice.length - 1];
	}

	function _touchDistance(touches) {
		var dx = touches[0].clientX - touches[1].clientX;
		var dy = touches[0].clientY - touches[1].clientY;
		return Math.sqrt(dx * dx + dy * dy);
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

		// State
		this._surfer = null;
		this._audio = null;
		this._hasCachedPeaks = false;
		this._duration = 0;
		this._zoomLevel = 0;
		this._zoomFactors = [1, 2, 5, 10];

		// Cache DOM (all within this.dom)
		this._els = {
			progress:   dom.querySelector('.waveform-progress'),
			playhead:   dom.querySelector('.waveform-playhead'),
			cueRegion:  dom.querySelector('.cue-region'),
			cueStart:   dom.querySelector('.cue-marker--start'),
			cueEnd:     dom.querySelector('.cue-marker--end'),
			cuePending: dom.querySelector('.cue-marker--pending'),
			timeline:   dom.querySelector('.waveform-timeline')
		};

		this._bindEvents();

		return this;
	}

	/* ====================================================================
	   EVENT BINDING
	   ==================================================================== */

	_component.prototype._bindEvents = function () {
		var self = this;

		// Zoom buttons (in sibling nav within .waveform-container)
		var container = this.dom.closest('.waveform-container') || this.dom.parentElement;
		if (container) {
			container.addEventListener('click', function (e) {
				var zoomBtn = e.target.closest('[data-ln-zoom]');
				if (zoomBtn) {
					self.zoom(zoomBtn.getAttribute('data-ln-zoom'));
				}
			});
		}

		// Pinch-to-zoom via ctrl+wheel (trackpad/tablet pinch gesture)
		this.dom.addEventListener('wheel', function (e) {
			if (e.ctrlKey) {
				e.preventDefault();
				self.zoom(e.deltaY < 0 ? 'in' : 'out');
			}
		}, { passive: false });

		// Touch pinch-to-zoom
		var lastPinchDist = 0;
		this.dom.addEventListener('touchstart', function (e) {
			if (e.touches.length === 2) {
				lastPinchDist = _touchDistance(e.touches);
			}
		}, { passive: true });

		this.dom.addEventListener('touchmove', function (e) {
			if (e.touches.length === 2) {
				var dist = _touchDistance(e.touches);
				var delta = dist - lastPinchDist;
				if (Math.abs(delta) > 30) {
					self.zoom(delta > 0 ? 'in' : 'out');
					lastPinchDist = dist;
				}
			}
		}, { passive: true });

		// Request events (from parent component)
		this.dom.addEventListener('ln-waveform:request-init', function (e) {
			self.init(e.detail.audio, e.detail.peaks, e.detail.peaksDuration);
		});
		this.dom.addEventListener('ln-waveform:request-destroy', function () {
			self.destroy();
		});
		this.dom.addEventListener('ln-waveform:request-set-progress', function (e) {
			self.setProgress(e.detail.percent);
		});
		this.dom.addEventListener('ln-waveform:request-set-region', function (e) {
			self.setRegion(e.detail.startPct, e.detail.endPct);
		});
		this.dom.addEventListener('ln-waveform:request-clear-region', function () {
			self.clearRegion();
		});
		this.dom.addEventListener('ln-waveform:request-clear-all', function () {
			self.clearAll();
		});
		this.dom.addEventListener('ln-waveform:request-set-pending-cue', function (e) {
			self.setPendingCue(e.detail.percent);
		});
		this.dom.addEventListener('ln-waveform:request-clear-pending-cue', function () {
			self.clearPendingCue();
		});
	};

	/* ====================================================================
	   PUBLIC API
	   ==================================================================== */

	_component.prototype.init = function (audio, peaks, peaksDuration) {
		this.destroy();

		if (!audio) return;
		this._audio = audio;

		var self = this;
		var progressColor = getComputedStyle(this.dom).getPropertyValue('--deck-color').trim() || '#ffa500';

		var opts = {
			container: this.dom,
			waveColor: 'rgba(136, 136, 136, 0.5)',
			progressColor: progressColor,
			cursorWidth: 0,
			barWidth: 2,
			barGap: 1,
			barRadius: 1,
			height: 100,
			media: audio,
			autoScroll: true,
			autoCenter: false
		};

		if (peaks && peaks.length > 0 && peaksDuration > 0) {
			opts.peaks = peaks;
			opts.duration = peaksDuration;
		}

		this._hasCachedPeaks = !!(peaks && peaks.length > 0 && peaksDuration > 0);
		this._surfer = WaveSurfer.create(opts);
		this._zoomLevel = 0;
		this.dom.classList.add('waveform--loaded');
		this.dom.classList.remove('waveform--zoomed');

		// Relocate overlays into WaveSurfer's scroll wrapper
		this._relocateOverlays();

		// WaveSurfer events → ln-waveform CustomEvents
		this._surfer.on('ready', function () {
			self._duration = self._surfer.getDuration() || audio.duration || 0;
			self._renderTimeline();
			_dispatch(self.dom, 'ln-waveform:ready', { duration: self._duration });
		});

		this._surfer.on('decode', function (duration) {
			if (!self._duration && duration > 0) {
				self._duration = duration;
				self._renderTimeline();
			}
		});

		this._surfer.on('timeupdate', function (currentTime) {
			_dispatch(self.dom, 'ln-waveform:timeupdate', { currentTime: currentTime });
		});

		this._surfer.on('finish', function () {
			_dispatch(self.dom, 'ln-waveform:finish');
		});

		this._surfer.on('seeking', function (currentTime) {
			_dispatch(self.dom, 'ln-waveform:seeked', { currentTime: currentTime });
		});
	};

	_component.prototype.destroy = function () {
		if (this._surfer) {
			this._restoreOverlays();
			this._surfer.destroy();
			this._surfer = null;
		}
		this._audio = null;
		this._hasCachedPeaks = false;
		this._duration = 0;
		this._zoomLevel = 0;
		this.dom.classList.remove('waveform--loaded');
		this.dom.classList.remove('waveform--zoomed');
		this._clearTimeline();
	};

	_component.prototype.setProgress = function (percent) {
		if (this._els.progress) this._els.progress.style.width = percent + '%';
		if (this._els.playhead) this._els.playhead.style.left = percent + '%';
	};

	_component.prototype.setRegion = function (startPct, endPct) {
		var e = this._els;
		if (e.cueStart) { e.cueStart.style.left = startPct + '%'; e.cueStart.style.display = ''; }
		if (e.cueEnd) { e.cueEnd.style.left = endPct + '%'; e.cueEnd.style.display = ''; }
		if (e.cueRegion) {
			e.cueRegion.style.left = startPct + '%';
			e.cueRegion.style.width = (endPct - startPct) + '%';
			e.cueRegion.style.display = '';
		}
	};

	_component.prototype.clearRegion = function () {
		var e = this._els;
		if (e.cueStart) e.cueStart.style.display = 'none';
		if (e.cueEnd) e.cueEnd.style.display = 'none';
		if (e.cueRegion) e.cueRegion.style.display = 'none';
	};

	_component.prototype.clearAll = function () {
		this.setProgress(0);
		this.clearRegion();
		this.clearPendingCue();
	};

	_component.prototype.setPendingCue = function (pct) {
		if (this._els.cuePending) {
			this._els.cuePending.style.left = pct + '%';
			this._els.cuePending.style.display = '';
		}
	};

	_component.prototype.clearPendingCue = function () {
		if (this._els.cuePending) {
			this._els.cuePending.style.display = 'none';
		}
	};

	_component.prototype.exportPeaks = function () {
		if (this._surfer) {
			return this._surfer.exportPeaks();
		}
		return null;
	};

	_component.prototype.hasCachedPeaks = function () {
		return this._hasCachedPeaks;
	};

	_component.prototype.zoom = function (direction) {
		if (!this._surfer || !this._duration) return;

		if (direction === 'in' && this._zoomLevel < this._zoomFactors.length - 1) {
			this._zoomLevel++;
		} else if (direction === 'out' && this._zoomLevel > 0) {
			this._zoomLevel--;
		} else {
			return;
		}

		var factor = this._zoomFactors[this._zoomLevel];

		if (factor === 1) {
			// Reset to fit-to-container (avoids 1-2px residual scroll)
			this._surfer.zoom(0);
		} else {
			var containerWidth = this.dom.clientWidth;
			var minPxPerSec = (containerWidth / this._duration) * factor;
			this._surfer.zoom(minPxPerSec);
		}
		this._renderTimeline();
		this.dom.classList.toggle('waveform--zoomed', this._zoomLevel > 0);
	};

	/* ====================================================================
	   INTERNAL — OVERLAY RELOCATION
	   ==================================================================== */

	_component.prototype._relocateOverlays = function () {
		if (!this._surfer) return;

		var wrapper;
		if (typeof this._surfer.getWrapper === 'function') {
			wrapper = this._surfer.getWrapper();
		} else {
			wrapper = this.dom.querySelector('div > div');
		}
		if (!wrapper) return;

		wrapper.style.position = 'relative';
		wrapper.style.paddingBottom = '20px';

		var els = this._els;
		if (els.cueRegion) wrapper.appendChild(els.cueRegion);
		if (els.cueStart) wrapper.appendChild(els.cueStart);
		if (els.cueEnd) wrapper.appendChild(els.cueEnd);
		if (els.cuePending) wrapper.appendChild(els.cuePending);
		if (els.progress) wrapper.appendChild(els.progress);
		if (els.playhead) wrapper.appendChild(els.playhead);
		if (els.timeline) wrapper.appendChild(els.timeline);
	};

	_component.prototype._restoreOverlays = function () {
		var els = this._els;
		if (els.cueRegion) this.dom.appendChild(els.cueRegion);
		if (els.cueStart) this.dom.appendChild(els.cueStart);
		if (els.cueEnd) this.dom.appendChild(els.cueEnd);
		if (els.cuePending) this.dom.appendChild(els.cuePending);
		if (els.progress) this.dom.appendChild(els.progress);
		if (els.playhead) this.dom.appendChild(els.playhead);
		if (els.timeline) this.dom.appendChild(els.timeline);
	};

	/* ====================================================================
	   INTERNAL — TIMELINE RULER
	   ==================================================================== */

	_component.prototype._renderTimeline = function () {
		var timeline = this._els.timeline;
		if (!timeline || !this._duration) return;

		this._clearTimeline();

		var duration = this._duration;
		var factor = this._zoomFactors[this._zoomLevel] || 1;
		var containerWidth = this.dom.clientWidth * factor;
		var pxPerSec = containerWidth / duration;

		// Pick nice tick interval (~80px between major ticks)
		var rawInterval = 80 / pxPerSec;
		var majorInterval = _niceInterval(rawInterval);
		var minorInterval = majorInterval <= 2 ? majorInterval / 2 : majorInterval / 5;

		// Safety: cap ticks at 500
		var maxTicks = 500;
		var tickCount = 0;

		for (var t = 0; t <= duration && tickCount < maxTicks; t += minorInterval) {
			t = Math.round(t * 100) / 100;
			var isMajor = Math.abs(t % majorInterval) < 0.01 || Math.abs(majorInterval - (t % majorInterval)) < 0.01;

			var tick = document.createElement('span');
			tick.className = isMajor ? 'waveform-tick waveform-tick--major' : 'waveform-tick waveform-tick--minor';
			tick.style.left = ((t / duration) * 100) + '%';

			if (isMajor) {
				tick.setAttribute('data-time', _formatTime(t));
			}

			timeline.appendChild(tick);
			tickCount++;
		}
	};

	_component.prototype._clearTimeline = function () {
		var timeline = this._els.timeline;
		if (timeline) timeline.innerHTML = '';
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
