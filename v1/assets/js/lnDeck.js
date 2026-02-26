(function () {
	const DOM_SELECTOR = "data-ln-deck";
	const DOM_ATTRIBUTE = "lnDeck";

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
		this.deck = container.getAttribute(DOM_SELECTOR);

		this.audio = container.querySelector("audio");
		this.label = container.querySelector(".current-track");
		this.image = container.querySelector("img");

		this._handleLoad = this._handleLoad.bind(this);
		document.addEventListener("deck:load", this._handleLoad);
		return this;
	}

	_Component.prototype._handleLoad = async function (e) {
		const { deck, id } = e.detail || {};
		if (deck !== this.deck || !id) return;

		try {
			const track = await idbKeyval.get(id);
			if (!track || !track.filename) return;

			const file = await lnFileAccess.getFile(track.filename);
			const blobUrl = URL.createObjectURL(file);

			// Store current track info on the container for other components
			this.container._lnCurrentTrack = track;

			if (this.audio) {
				this.audio.src = blobUrl;
				this.audio.load();
			}

			if (this.label) {
				this.label.textContent = `${track.artist} – ${track.title}`;
			}

			if (this.image && track.coverimage) {
				this.image.src = track.coverimage;
			}

			// Dispatch loaded event for audio router and waveform coordination
			document.dispatchEvent(new CustomEvent("ln-deck:loaded", {
				detail: { deck: this.deck, track: track, blobUrl: blobUrl },
				bubbles: true
			}));

		} catch (err) {
			console.warn("Failed to load track into Deck " + this.deck + ":", err);
		}
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
