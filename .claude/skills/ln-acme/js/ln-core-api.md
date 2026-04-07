# ln-acme — ln-core API Reference

> Shared helpers imported by all ln-acme components. Located in `js/ln-core/`.
> For architecture principles → global js skill §9 (three layers), §11 (reactive state).

---

## Import Pattern

Imports go **outside** the IIFE — Vite resolves at build time:

```javascript
import { cloneTemplate, dispatch, dispatchCancelable, fill, renderList, findElements, guardBody } from '../ln-core';
import { reactiveState, deepReactive, createBatcher } from '../ln-core';
```

---

## Event Helpers (helpers.js)

### `dispatch(el, name, detail)`

Non-cancelable, bubbling CustomEvent.

```javascript
dispatch(element, 'ln-modal:open', { id: 'my-modal' });
```

### `dispatchCancelable(el, name, detail)`

Cancelable CustomEvent. Returns the event object — check `defaultPrevented`.

```javascript
const event = dispatchCancelable(element, 'ln-modal:before-open', { id: 'my-modal' });
if (event.defaultPrevented) return; // External listener cancelled
```

---

## Template Helpers (helpers.js)

### `cloneTemplate(name, tag)`

Clone a `<template data-ln-template="{name}">`. Caches on first use. Returns DocumentFragment or `null`.

```javascript
const fragment = cloneTemplate('track-item', 'ln-playlist');
if (!fragment) return; // Template missing — already warned
```

### `findElements(root, selector, attribute, ComponentClass)`

Find and initialize component instances. Standard auto-init pattern.

### `guardBody(setupFn, componentTag)`

Defer execution until `<body>` exists. Use in components that run before DOM is ready.

---

## Declarative DOM Binding (helpers.js)

### `fill(root, data)`

Replaces querySelector + textContent chains. Idempotent — call again with new data.

#### Data Attributes

| Attribute | Effect | Example |
|-----------|--------|---------|
| `data-ln-field="prop"` | `el.textContent = data[prop]` | `<p data-ln-field="name"></p>` |
| `data-ln-attr="attr:prop, ..."` | `el.setAttribute(attr, data[prop])` | `<img data-ln-attr="src:avatar, alt:name">` |
| `data-ln-show="prop"` | `el.classList.toggle('hidden', !data[prop])` | `<span data-ln-show="isAdmin">Admin</span>` |
| `data-ln-class="cls:prop, ..."` | `el.classList.toggle(cls, !!data[prop])` | `<li data-ln-class="active:isSelected">` |

#### Usage

```html
<template data-ln-template="user-item">
	<li data-ln-class="active:isSelected">
		<img data-ln-attr="src:avatar, alt:name">
		<p data-ln-field="name"></p>
		<p data-ln-field="email"></p>
		<span data-ln-show="isAdmin">Admin</span>
	</li>
</template>
```

```javascript
fill(el, {
	name: user.name,
	email: user.email,
	avatar: user.avatar,
	isAdmin: user.role === 'admin',
	isSelected: user.id === selectedId
});
```

#### Rules

- `fill` is idempotent — call again with new data, DOM updates
- `null`/`undefined` values are skipped (existing content preserved)
- Works on live DOM and on `<template>` clones (DocumentFragment)
- `data-ln-field` uses `textContent` only — not `innerHTML`

---

## Keyed List Rendering (helpers.js)

### `renderList(container, items, templateName, keyFn, fillFn, tag)`

Efficiently renders an array with DOM reuse via `data-ln-key`.

```javascript
renderList(
	this.dom.querySelector('[data-ln-list="users"]'),  // container
	this.state.users,                                   // data array
	'user-item',                                        // template name
	function (u) { return u.id; },                      // key function (stable ID)
	function (el, user, idx) {                          // fill function
		fill(el, { name: user.name, email: user.email });
	},
	'ln-user-list'                                      // component tag (for warnings)
);
```

#### How it works

1. Index existing children by `data-ln-key` attribute
2. For each item: find existing node by key → call fillFn (reuse). Or clone template → set key → call fillFn (new).
3. Atomic DOM replacement: `container.textContent = ''; container.appendChild(fragment)`

#### Rules

- `keyFn` returns a **stable unique identifier** (database ID, not array index)
- Existing DOM nodes are reused — event listeners, focus state survive
- Container uses `data-ln-list="name"` convention
- One reflow per render (atomic update)

---

## Reactive State (reactive.js)

### `reactiveState(initial, onChange)`

Shallow Proxy for flat state (strings, numbers, booleans).

```javascript
this.state = reactiveState({
	mode: 'view',
	isOpen: false
}, function (prop, value, old) {
	queueRender();
});

this.state.mode = 'edit'; // triggers onChange
```

### `deepReactive(obj, onChange)`

Deep Proxy for nested objects and arrays.

```javascript
this.state = deepReactive({
	users: [],
	selectedId: null,
	filter: ''
}, queueRender);

// All trigger queueRender automatically:
this.state.users.push({ id: 1, name: 'New' });
this.state.users[0].name = 'Updated';
this.state.users.splice(1, 1);
this.state.selectedId = 3;
```

### `createBatcher(renderFn, afterRenderFn)`

Microtask coalescing — multiple sync state changes → one render.

```javascript
const queueRender = createBatcher(
	function () { self._render(); },
	function () { dispatch(self.dom, 'ln-{name}:changed', {}); }
);
```

**Always** use createBatcher between Proxy and _render. Never wire onChange directly to _render().

```
state.name = 'A'     → queueRender() [queued via queueMicrotask]
state.email = 'B'    → queueRender() [already queued, skip]
state.role = 'admin' → queueRender() [already queued, skip]
--- microtask checkpoint ---
_render() fires ONCE
afterRender() fires ONCE
```

---

## Attribute ↔ Proxy Bridge

External control (coordinator → component) via attributes. Bridge syncs to Proxy state.

```javascript
_component.prototype._onAttr = function (attrName, newValue) {
	const prefix = DOM_SELECTOR + '-';
	if (attrName.indexOf(prefix) === 0) {
		const prop = attrName.slice(prefix.length);
		if (this.state[prop] !== newValue) {
			this.state[prop] = newValue;  // Proxy → queueRender → _render
		}
	}
};
```

Coordinator controls component via attributes:
```javascript
profileEl.setAttribute('data-ln-profile-mode', 'edit');
// → MutationObserver → _onAttr → this.state.mode = 'edit' → _render()
```

For components with state attributes, add to `attributeFilter`:
```javascript
attributeFilter: [DOM_SELECTOR, DOM_SELECTOR + '-mode', DOM_SELECTOR + '-for']
```
