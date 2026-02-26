(function () {
	const DOM_SELECTOR = "data-ln-visible";
	const DOM_ATTRIBUTE = "lnVisible";

	if (window[DOM_ATTRIBUTE]) return;

	function constructor(root = document.body) {
		const radios = root.querySelectorAll(`input[type="radio"][${DOM_SELECTOR}]`);
		const targets = root.querySelectorAll(".toggle-visible");

		// Веќе иницијализирано? Прескокни
		if (root[DOM_ATTRIBUTE]) return;
		root[DOM_ATTRIBUTE] = true;

		function updateVisibility() {
			const selected = Array.from(radios).find(r => r.checked);
			const targetId = selected?.getAttribute(DOM_SELECTOR);

			targets.forEach(el => {
				el.style.display = (el.id === targetId) ? "inline-flex" : "none";
			});
		}

		radios.forEach(radio => {
			radio.addEventListener("change", updateVisibility);
		});

		updateVisibility();
	}

	function observeDOM() {
		const observer = new MutationObserver(mutations => {
			mutations.forEach(m => {
				m.addedNodes.forEach(node => {
					if (node.nodeType !== 1) return;

					if (node.hasAttribute?.(DOM_SELECTOR)) {
						constructor(node);
					}

					// Ако внатре има radios
					node.querySelectorAll?.(`[${DOM_SELECTOR}]`).forEach(inner => {
						constructor(inner.closest("form, .component, body")); // или друга логика за scope
					});
				});
			});
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true
		});
	}

	// Assign to global
	window[DOM_ATTRIBUTE] = constructor;

	// Init on load
	document.addEventListener("DOMContentLoaded", () => {
		document.querySelectorAll(`[${DOM_SELECTOR}]`).forEach(el => {
			constructor(el.closest("form, .component, body")); // или каков и да ти е scope-от
		});
	});

	// Start observing
	observeDOM();
})();
