(function () {
	const DOM_SELECTOR = "data-ln-load-deck";
	const DOM_ATTRIBUTE = "lnLoadDeck";

	if (window[DOM_ATTRIBUTE]) return;

	function constructor(root) {
		_findElements(root || document.body);
	}

	function _findElements(root) {
		if (!root.querySelectorAll) return;

		const elements = Array.from(root.querySelectorAll(`[${DOM_SELECTOR}]`));
		if (root.hasAttribute && root.hasAttribute("data-ln-load-deck")) {
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
		this.deck = button.getAttribute("data-ln-load-deck");
		this.button.addEventListener("click", this._handleClick.bind(this));
		return this;
	}

	_Component.prototype._handleClick = function (e) {
		const li = this.button.closest("[data-track-id]");
		if (!li) return;

		const id = li.getAttribute("data-track-id");
		if (!id) return;

		const event = new CustomEvent("deck:load", {
			detail: {
				deck: this.deck,
				id: id
			},
			bubbles: true
		});

		this.button.dispatchEvent(event);
	};

	function _observeDomChanges() {
		const observer = new MutationObserver(mutations => {
			mutations.forEach(m => {
				m.addedNodes.forEach(node => {
					if (node.nodeType === Node.ELEMENT_NODE) {
						_findElements(node);
					}
				});
			});
		});
		observer.observe(document.body, { childList: true, subtree: true });
	}

	window[DOM_ATTRIBUTE] = constructor;

	constructor(document.body);
	_observeDomChanges();
})();
