(function () {
	const DOM_SELECTOR = "data-ln-transport";
	const DOM_ATTRIBUTE = "lnTransport";

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

	function _Component(button) {
		this.button = button;
		this.action = button.getAttribute(DOM_SELECTOR);
		this.deckEl = button.closest("[data-ln-deck]");
		if (!this.deckEl) return;

		this.deckId = this.deckEl.getAttribute("data-ln-deck");
		this.audio = this.deckEl.querySelector("audio");

		this.button.addEventListener("click", this._handleClick.bind(this));

		// Update play button icon on audio state changes
		if (this.action === "play" && this.audio) {
			this.audio.addEventListener("play", () => this._updatePlayState(true));
			this.audio.addEventListener("pause", () => this._updatePlayState(false));
			this.audio.addEventListener("ended", () => this._updatePlayState(false));
		}

		return this;
	}

	_Component.prototype._handleClick = function () {
		if (!this.audio) return;

		// Ensure AudioContext is running (browser autoplay policy)
		if (window.lnAudioRouter?.ensureContext) {
			window.lnAudioRouter.ensureContext();
		}

		if (this.action === "play") {
			if (this.audio.paused) {
				this.audio.play();
				_dispatch(this.deckEl, "ln-transport:play", { deck: this.deckId });
			} else {
				this.audio.pause();
				_dispatch(this.deckEl, "ln-transport:pause", { deck: this.deckId });
			}
		} else if (this.action === "stop") {
			this.audio.pause();
			this.audio.currentTime = 0;
			_dispatch(this.deckEl, "ln-transport:stop", { deck: this.deckId });
		}
	};

	_Component.prototype._updatePlayState = function (playing) {
		const iconEl = this.button.querySelector("[class*='ln-icon-']");
		if (!iconEl) return;

		if (playing) {
			iconEl.className = "ln-icon-pause";
			this.button.classList.add("active");
		} else {
			iconEl.className = "ln-icon-play";
			this.button.classList.remove("active");
		}
	};

	function _dispatch(el, name, detail) {
		el.dispatchEvent(new CustomEvent(name, {
			detail,
			bubbles: true
		}));
	}

	function _observeDomChanges() {
		new MutationObserver(muts => {
			muts.forEach(m => m.addedNodes.forEach(node => {
				if (node.nodeType === 1) _findElements(node);
			}));
		}).observe(document.body, { childList: true, subtree: true });
	}

	window[DOM_ATTRIBUTE] = constructor;
	constructor(document.body);
	_observeDomChanges();
})();
