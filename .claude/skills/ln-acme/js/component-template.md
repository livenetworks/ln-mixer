# ln-acme — JS Component Template

> Full IIFE boilerplate for creating new ln-acme components.
> For architecture principles → global js skill.

---

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Data attribute | `data-ln-{component}` | `data-ln-modal` |
| Window API | `window.ln{Component}` | `window.lnModal` |
| Custom event | `ln-{component}:{action}` | `ln-modal:open` |
| Private function | `_functionName` | `_initComponent` |
| Dictionary | `data-ln-{component}-dict` | `data-ln-toast-dict` |
| Initialized flag | `data-ln-{component}-initialized` | `data-ln-modal-initialized` |
| State attribute | `data-ln-{component}-{prop}` | `data-ln-profile-mode` |
| Trigger | `data-ln-{component}-for` | `data-ln-modal-for` |

---

## Complete Component Template

```javascript
import { cloneTemplate, dispatch, dispatchCancelable, fill, renderList } from '../ln-core';
import { deepReactive, createBatcher } from '../ln-core';

(function () {
	const DOM_SELECTOR = 'data-ln-{name}';
	const DOM_ATTRIBUTE = 'ln{Name}';
	if (window[DOM_ATTRIBUTE] !== undefined) return;

	function _component(dom) {
		this.dom = dom;
		const self = this;

		const queueRender = createBatcher(
			function () { self._render(); },
			function () { dispatch(self.dom, 'ln-{name}:changed', {}); }
		);

		this.state = deepReactive({
			// initial state
		}, queueRender);

		this._bindEvents();
		return this;
	}

	_component.prototype._bindEvents = function () {
		const self = this;
		this.dom.addEventListener('ln-{name}:request-{action}', function (e) {
			// Just change state — render is automatic
			self.state.prop = e.detail.value;
		});
	};

	_component.prototype._render = function () {
		fill(this.dom, { /* scalar bindings */ });
		renderList(container, this.state.items, 'tmpl',
			function (i) { return i.id; },
			function (el, item) { fill(el, { /* item data */ }); },
			'ln-{name}'
		);
	};

	_component.prototype._onAttr = function (attrName, newValue) {
		const prefix = DOM_SELECTOR + '-';
		if (attrName.indexOf(prefix) === 0) {
			const prop = attrName.slice(prefix.length);
			if (this.state[prop] !== newValue) {
				this.state[prop] = newValue;
			}
		}
	};

	// Public API (queries only)
	Object.defineProperty(_component.prototype, 'selectedId', {
		get: function () { return this.state.selectedId; }
	});

	_component.prototype.destroy = function () {
		dispatch(this.dom, 'ln-{name}:destroyed', {});
		delete this.dom[DOM_ATTRIBUTE];
	};

	// --- Standard boilerplate (copy as-is) ---

	function constructor(domRoot) {
		_findElements(domRoot);
	}

	function _findElements(root) {
		const items = root.querySelectorAll('[' + DOM_SELECTOR + ']');
		for (const el of items) {
			if (!el[DOM_ATTRIBUTE]) {
				el[DOM_ATTRIBUTE] = new _component(el);
			}
		}
		if (root.hasAttribute && root.hasAttribute(DOM_SELECTOR) && !root[DOM_ATTRIBUTE]) {
			root[DOM_ATTRIBUTE] = new _component(root);
		}
	}

	function _attachTriggers(root) {
		const triggers = root.querySelectorAll('[' + DOM_SELECTOR + '-for]');
		for (const btn of triggers) {
			if (btn[DOM_ATTRIBUTE + 'Trigger']) return;
			btn[DOM_ATTRIBUTE + 'Trigger'] = true;
			btn.addEventListener('click', function (e) {
				if (e.ctrlKey || e.metaKey || e.button === 1) return;
				e.preventDefault();
				// ... handle click
			});
		}
	}

	function _domObserver() {
		const observer = new MutationObserver(function (mutations) {
			for (const mutation of mutations) {
				if (mutation.type === 'childList') {
					for (const node of mutation.addedNodes) {
						if (node.nodeType === 1) {
							_findElements(node);
							_attachTriggers(node);
						}
					}
				} else if (mutation.type === 'attributes') {
					const el = mutation.target;
					if (el[DOM_ATTRIBUTE] && el[DOM_ATTRIBUTE]._onAttr) {
						el[DOM_ATTRIBUTE]._onAttr(
							mutation.attributeName,
							el.getAttribute(mutation.attributeName)
						);
					} else {
						_findElements(el);
						_attachTriggers(el);
					}
				}
			}
		});
		observer.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: [DOM_SELECTOR]
			// Add state attributes: DOM_SELECTOR + '-mode', DOM_SELECTOR + '-for'
		});
	}

	window[DOM_ATTRIBUTE] = constructor;
	_domObserver();
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function () { constructor(document.body); });
	} else {
		constructor(document.body);
	}
})();
```

---

## Global Service Template (no DOM instances)

```javascript
(function () {
	const DOM_ATTRIBUTE = 'lnHttp';
	if (window[DOM_ATTRIBUTE] !== undefined) return;

	document.addEventListener('ln-http:request', function (e) {
		const opts = e.detail || {};
		if (!opts.url) return;
		const target = e.target;
		// ... fetch, dispatch response on target
		dispatch(target, 'ln-http:success', { tag: opts.tag, ok: true, data: data });
	});

	window[DOM_ATTRIBUTE] = true; // boolean, not constructor
})();
```

---

## Checklist: New Component

1. Create `js/ln-{name}/ln-{name}.js` — IIFE from template above
2. Add `data-ln-{name}` data attribute convention
3. If CSS needed: create `js/ln-{name}/ln-{name}.scss`
4. Add `import './ln-{name}/ln-{name}.js'` to `js/index.js`
5. DOM structure → `<template>` elements in HTML
6. Create `js/ln-{name}/README.md` — usage guide (attributes, events, API, HTML)
7. Create `docs/js/{name}.md` — architecture reference (internal state, render flow)
8. Create `demo/admin/{name}.html` — interactive demo page

## Checklist: Update Existing Component

1. Update `js/ln-{name}/README.md` — reflect new/changed usage
2. Update `docs/js/{name}.md` — reflect architectural changes
3. Update `demo/admin/{name}.html` — add/update examples
