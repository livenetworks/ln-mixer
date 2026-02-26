(function () {
	const DOM_SELECTOR = "data-ln-potentiometer";
	const DOM_ATTRIBUTE = "lnPotentiometer";

	if (window[DOM_ATTRIBUTE]) return;

	function constructor(root) {
		_findElements(root || document.body);
	}

	function _findElements(root) {
		if (!root.querySelectorAll) return;

		const elements = Array.from(root.querySelectorAll(`[${DOM_SELECTOR}]`));
		if (root.hasAttribute && root.hasAttribute("data-ln-potentiometer")) {
			elements.push(root);
		}

		elements.forEach(el => {
			if (!el[DOM_ATTRIBUTE]) {
				el[DOM_ATTRIBUTE] = new _Component(el);
			}
		});
	}

	function _Component(input) {
		this.input = input;
		this._bind();
		this._update();
		return this;
	}

	_Component.prototype._bind = function () {
		this.input.addEventListener("input", this._update.bind(this));
	};

	_Component.prototype._update = function () {
		const val = this.input.value;
		const min = this.input.min || 0;
		const max = this.input.max || 100;
		const percent = ((val - min) / (max - min)) * 100;
		const name = this.input.getAttribute("data-ln-potentiometer");

		// Visual feedback for master volume (rotated slider)
		if (name === "master") {
			this.input.style.background = `linear-gradient(to right, #fff ${percent}%, transparent ${percent}%)`;
		}

		// Dispatch event for audio routing
		this.input.dispatchEvent(new CustomEvent("ln-potentiometer:change", {
			detail: { name: name, value: parseFloat(val) },
			bubbles: true
		}));
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
