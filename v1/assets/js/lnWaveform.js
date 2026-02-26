(function () {
	const DOM_SELECTOR = "data-ln-waveform";
	const DOM_ATTRIBUTE = "lnWaveform";

	if (window[DOM_ATTRIBUTE]) return;

	function constructor(root) {
		_findElements(root || document.body);
	}

	function _findElements(root) {
		if (!root.querySelectorAll) return;

		const elements = Array.from(root.querySelectorAll(`[${DOM_SELECTOR}]`));
		if (root.hasAttribute && root.hasAttribute(DOM_SELECTOR)) {
			elements.push(root);
		}

		elements.forEach(el => {
			if (!el[DOM_ATTRIBUTE]) {
				el[DOM_ATTRIBUTE] = new _Component(el);
			}
		});
	}

	function _Component(container) {
		this.container = container;
		this.deckEl = container.closest("[data-ln-deck]");
		if (!this.deckEl) return;

		this.deck = this.deckEl.getAttribute("data-ln-deck");
		this.audio = this.deckEl.querySelector("audio");

		this._handleLoaded = this._handleLoaded.bind(this);
		document.addEventListener("ln-deck:loaded", this._handleLoaded);
		return this;
	}

	_Component.prototype._createWaveSurfer = function () {
		var options = {
			container: this.container,
			waveColor: "#888",
			progressColor: "#ffa500",
			cursorColor: "#fff",
			barWidth: 2,
			height: 100,
		};

		// Use shared audio element for playback sync
		if (this.audio) {
			options.media = this.audio;
		}

		return WaveSurfer.create(options);
	};

	_Component.prototype._handleLoaded = function (e) {
		var detail = e.detail || {};
		if (detail.deck !== this.deck) return;

		var blobUrl = detail.blobUrl;
		if (!blobUrl) return;

		// Clean up previous surfer
		if (this.surfer) {
			this.surfer.destroy();
			this.surfer = null;
			this.container.innerHTML = "";
		}

		this.surfer = this._createWaveSurfer();

		// Expose surfer instance on the container for other components (cue points, loop)
		this.container.lnWaveSurferInstance = this.surfer;

		// WaveSurfer with `media` option auto-syncs with the audio element.
		// We still need to load the waveform data from the URL for visualization.
		this.surfer.load(blobUrl);

		// Dispatch ready event for cue points and other components
		var self = this;
		this.surfer.on("ready", function () {
			document.dispatchEvent(new CustomEvent("ln-waveform:ready", {
				detail: { deck: self.deck, surfer: self.surfer },
				bubbles: true
			}));
		});
	};

	function _observeDomChanges() {
		new MutationObserver(muts => {
			muts.forEach(m => m.addedNodes.forEach(_findElements));
		}).observe(document.body, { childList: true, subtree: true });
	}

	window[DOM_ATTRIBUTE] = constructor;
	constructor(document.body);
	_observeDomChanges();
})();
