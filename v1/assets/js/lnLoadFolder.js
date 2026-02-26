(function () {
	const DOM_SELECTOR = "data-ln-load-folder";
	const DOM_ATTRIBUTE = "lnLoadFolder";

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
		this.filter = button.getAttribute(DOM_SELECTOR) || "*.*";
		this.button.addEventListener("click", this._handleClick.bind(this));
		return this;
	}

	_Component.prototype._handleClick = async function () {
		const extensions = this.filter
			.split(",")
			.map(e => e.trim().replace("*.", "").toLowerCase());

		let files = [];

		try {
			const dirHandle = await window.showDirectoryPicker();

			// ⬇️ испрати евент за lnFileAccess
			document.dispatchEvent(new CustomEvent("folder:select", {
				detail: { handle: dirHandle },
				bubbles: true
			}));

			for await (const [name, handle] of dirHandle.entries()) {
				if (handle.kind !== "file") continue;
				const ext = name.split('.').pop().toLowerCase();
				if (extensions.includes(ext)) {
					const file = await handle.getFile();
					files.push(file);
				}
			}
		} catch (err) {
			console.warn("Folder load cancelled or failed:", err);
			return;
		}

		if (files.length) {
			const event = new CustomEvent("files:loaded", {
				detail: {
					files,
					extensions
				},
				bubbles: true
			});
			this.button.dispatchEvent(event);
		}
	};

	function _observeDomChanges() {
		const observer = new MutationObserver(mutations => {
			mutations.forEach(m => {
				m.addedNodes.forEach(node => {
					if (node.nodeType === 1) {
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
