# ln-acme Vanilla JS Project — Claude Code Skill

Reusable rules for building vanilla JS apps with the ln-acme component system.
Apply this skill to any new project that follows ln-acme conventions.

---

## 1. Stack

- **Vanilla JS** — no framework, no build step, no bundler
- **IIFE components** — one file per component, self-contained
- **CSS custom properties** — all design tokens in `:root`
- **IndexedDB** — client-side persistence (native API, no library)
- **HTML `<template>`** — all repeatable DOM structures
- **ln-acme library** — reusable UI primitives (modal, toast, accordion, sortable, search, progress, tabs, etc.)

---

## 2. Architecture: Coordinator + Components

### Components = Pure Data Layer

Each component is an IIFE that owns:
- Its own **state** (CRUD operations)
- Its own **DOM** (rendering, internal click delegation)
- **Request event listeners** (`ln-{name}:request-{action}`) — incoming commands
- **Notification event dispatches** (`ln-{name}:{past-tense}`) — outgoing facts

Components do **NOT**:
- Open/close modals or show toasts
- Listen to buttons outside their DOM root
- Handle `ln-form:submit` for external forms
- Call storage APIs (IndexedDB, localStorage, fetch)
- Query sibling components

### Coordinator = UI Wiring + Storage

One coordinator file (e.g. `ln-mixer.js`) that:
- Catches UI actions (`[data-ln-action="..."]` clicks, `ln-form:submit`)
- Dispatches **request events** on component DOM roots
- Handles **UI reactions** (toast on success, modal close on delete)
- Bridges between components (profile switch → playlist reload)
- Owns **all storage** calls (IndexedDB put/get/delete)
- Manages shared resources (AudioContext, blob URLs, pending state)

### Communication Rules

| Direction | Mechanism | Example |
|---|---|---|
| Coordinator → Component | `CustomEvent` (request) | `ln-profile:request-create` |
| Component → Coordinator | `CustomEvent` (notification) | `ln-profile:created` |
| Coordinator reads component | Direct query (OK) | `sidebar.lnPlaylist.getTrack(idx)` |
| Coordinator calls component method | **NEVER** | Use request events instead |
| Component → Component | **NEVER** | Route through coordinator |
| Component → Storage | **NEVER** | Coordinator handles persistence |

---

## 3. JS Component Template

```javascript
(function () {
    'use strict';

    var DOM_SELECTOR = 'data-ln-{name}';
    var DOM_ATTRIBUTE = 'ln{Name}';

    if (window[DOM_ATTRIBUTE] !== undefined) return;

    // ─── Helpers
    function _dispatch(element, eventName, detail) {
        element.dispatchEvent(new CustomEvent(eventName, {
            bubbles: true, detail: detail || {}
        }));
    }

    var _tmplCache = {};
    function _cloneTemplate(name) {
        if (!_tmplCache[name]) {
            _tmplCache[name] = document.querySelector('[data-ln-template="' + name + '"]');
        }
        if (!_tmplCache[name]) { console.warn('Template not found: ' + name); return null; }
        return _tmplCache[name].content.cloneNode(true);
    }

    // ─── Constructor
    function constructor(domRoot) { _findElements(domRoot); }

    function _findElements(root) {
        var items = Array.from(root.querySelectorAll('[' + DOM_SELECTOR + ']'));
        if (root.hasAttribute && root.hasAttribute(DOM_SELECTOR)) items.push(root);
        items.forEach(function (el) {
            if (!el[DOM_ATTRIBUTE]) el[DOM_ATTRIBUTE] = new _component(el);
        });
    }

    // ─── Component
    function _component(dom) {
        this.dom = dom;
        dom[DOM_ATTRIBUTE] = this;
        this._cacheElements();
        this._bindEvents();
        return this;
    }

    _component.prototype._cacheElements = function () {
        // Cache frequently accessed child elements
    };

    _component.prototype._bindEvents = function () {
        // Click delegation on own root, request event listeners
        this.dom.addEventListener('click', this._onClick.bind(this));
    };

    _component.prototype._onClick = function (e) {
        var btn = e.target.closest('button');
        if (!btn || !this.dom.contains(btn)) return;
        // Handle internal buttons only
    };

    // ─── DOM Observer (for dynamically added roots)
    function _domObserver() {
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function (node) {
                        if (node.nodeType === 1) _findElements(node);
                    });
                }
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // ─── Init
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

## 4. HTML Rules

| Rule | Do | Don't |
|---|---|---|
| Elements | `<section>`, `<article>`, `<nav>`, `<header>`, `<aside>`, `<main>`, `<output>`, `<mark>`, `<fieldset>` | Bare `<div>` |
| Lists | `<ul>/<ol>` + `<li>` | `<div>` per item |
| Buttons | `type="button"` on all `<button>` | Bare `<button>` (defaults to submit) |
| Submit | `type="submit"` only for form save/create | Duplicate save in click handler |
| JS hooks | `data-ln-*` attributes | Class names for JS |
| Icons | `.ln-icon-*` class (CSS `::before`) | Emojis, HTML entities, inline SVG |
| Dialogs | `<dialog>` + `<form method="dialog" data-ln-form="...">` | Hidden inputs for context |
| Context data | `data-ln-*` attributes on `<form>` | Hidden `<input>` fields |
| DOM structure | `<template data-ln-template="...">` | `createElement` chains in JS |

### Template System

All repeatable DOM goes in `<template>` elements at the end of `<body>`:

```html
<template data-ln-template="track-item">
    <li>
        <span class="track-number"></span>
        <article class="track-content">
            <h3 class="track-name"></h3>
            <p class="track-meta"></p>
        </article>
    </li>
</template>
```

JS clones and populates:
```javascript
var frag = _cloneTemplate('track-item');
frag.querySelector('.track-name').textContent = track.title;
container.appendChild(frag);
```

**Why:** DOM structure stays in HTML (visible, editable). No 60-line createElement chains buried in JS.

---

## 5. CSS Rules

### Design Tokens

All values in `:root` as custom properties. HSL base for color families:

```css
:root {
    /* Surfaces */
    --bg: #111;
    --surface: #1a1a1a;
    --surface-raised: #222;

    /* Text */
    --text: #eee;
    --text-muted: #999;
    --text-dim: #666;

    /* Accent — raw HSL values for transparency variants */
    --accent: 39 100% 50%;

    /* Usage: hsl(var(--accent))        → solid
              hsl(var(--accent) / 0.15) → 15% alpha
              hsl(var(--accent) / 0.3)  → 30% alpha */

    /* Spacing, sizing, typography, transitions */
    --gap-sm: 0.5rem;
    --gap-md: 0.75rem;
    --gap-lg: 1rem;
    --radius: 6px;
    --transition: 150ms ease;
}
```

### HSL Color Pattern

Store hue/saturation/lightness as a single token. Derive alpha variants inline:

```css
/* Token:    --accent: 39 100% 50%;           */
/* Solid:    background: hsl(var(--accent));   */
/* Alpha:    background: hsl(var(--accent) / 0.15); */
/* Override: .variant { --accent: 210 100% 63%; }   */
```

Benefits:
- One token per color family, not three (`--h`, `--s`, `--l`)
- Scoped overrides cascade to all children (e.g. `.deck--b { --accent: var(--accent-b); }`)
- Transparency derived inline, no separate `--accent-dim`, `--accent-glow` tokens

### Other CSS Rules

- `.ln-icon-*` — Feather Icons as SVG data URIs in `::before`. Dark theme: redirect `--icon-{name}-gray` → white variant
- `touch-action: manipulation` on all interactive elements
- Touch targets minimum 44x44px (48px preferred)
- No inline styles — everything in stylesheet
- No utility/presentation classes (`.grid-2`, `.text-sm`) — semantic selectors only
- `data-ln-*` for JS, classes for CSS styling

---

## 6. Dialog / Form Submit Architecture

```
Submit button (type="submit") → form submit event → global handler prevents default
→ dispatches CustomEvent "ln-form:submit" with form reference
→ coordinator listens → dispatches request event on component
→ component executes → dispatches notification event
→ coordinator reacts (toast, modal close)
```

**Critical:** Save/create actions go through form submit path ONLY. Never duplicate in click handlers (causes double-toast bug).

```html
<dialog data-ln-dialog="new-profile">
    <form method="dialog" data-ln-form="new-profile">
        <input data-ln-field="new-profile-name" />
        <button type="submit">Create</button>     <!-- form submit path -->
        <button type="button">Cancel</button>      <!-- click handler, closes modal -->
    </form>
</dialog>
```

---

## 7. Event Naming

| Type | Pattern | Example |
|---|---|---|
| Request (incoming command) | `ln-{component}:request-{action}` | `ln-playlist:request-remove-track` |
| Notification (outgoing fact) | `ln-{component}:{past-tense}` | `ln-playlist:track-removed` |
| Ready signal | `ln-{component}:ready` | `ln-profile:ready` |
| UI bridge | `ln-{component}:{noun}` | `ln-playlist:load-to-deck` |

All events: `bubbles: true`, dispatched on component's `this.dom`.

---

## 8. IndexedDB Pattern

Shared module (`ln-db.js`) exposes simple CRUD on `window.lnDb`:

```javascript
lnDb.open()                    // → Promise<IDBDatabase>
lnDb.get(storeName, key)       // → Promise<record>
lnDb.getAll(storeName)         // → Promise<record[]>
lnDb.getAllKeys(storeName)     // → Promise<key[]>
lnDb.put(storeName, record)    // → Promise<key>
lnDb.delete(storeName, key)    // → Promise<void>
```

**Only the coordinator calls lnDb.** Components are storage-agnostic.

Robustness: auto-open if called before `open()`, reset promise on error.

---

## 9. Component Extraction Checklist

When extracting from a monolithic file:

1. **Define boundaries** — what state, DOM, events does it own?
2. **Pick DOM_SELECTOR** — avoid collision with child attributes
3. **Design events** — request events in, notification events out
4. **Create file** — full IIFE skeleton
5. **Move state** → `this.*` properties
6. **Move rendering** → prototype methods + `<template>` clones
7. **Move internal handlers** → click delegation on own root
8. **Wire events** → `CustomEvent` where direct calls existed
9. **Move UI wiring to coordinator** → button clicks, toasts, modals
10. **Update HTML** → data attributes, script tag in correct order

### Gotchas

- **ID collision**: root `data-ln-foo` vs child `data-ln-foo-id="..."` — use different attribute names
- **Toast**: coordinator only, never in components
- **Race conditions**: component init may be async — listen for `:ready` event
- **Script order**: db → components → coordinator (dependencies load first)
- **Form submit**: global handler dispatches `ln-form:submit` — don't duplicate in click handlers

---

## 10. Service Worker (PWA)

```javascript
var CACHE_NAME = 'app-v1';  // Bump on every deploy
var APP_SHELL = [ /* all app files */ ];
```

- **Cache-first** for app shell (HTML, CSS, JS, images)
- **Network-first** for API (`/api/`)
- **Skip** audio files in SW — cache as blobs in IndexedDB instead
- Clean up old caches on `activate`
- Bump `CACHE_NAME` version on every code change

---

## 11. Code Review Checklist

### Bugs to watch for
- CSS tokens used but never defined in `:root`
- Promise chains that don't reset on error (stale rejected promises)
- XHR/fetch without timeout (hangs forever on server issues)
- DOM element access without null guards
- Hardcoded URLs that break in subdirectory deployments

### Architecture violations
- Component reaching outside its DOM root
- Component opening modals or showing toasts
- Component calling storage directly
- Global event listeners that should be scoped to component root
- Direct method calls between components (should be request events)

### CSS
- Hardcoded colors instead of `var(--token)`
- Duplicate selectors that could use CSS custom property inheritance
- Identical rules on multiple classes (merge into one shared class)
- HSL values repeated instead of using a token

---

## 12. Workflow Preferences

- **Incremental** — build step by step, verify each piece
- **Read first** — understand existing code before changing it
- **Minimal** — don't add features, refactors, or "improvements" beyond what was asked
- **Semantic HTML** — every element has meaning, no bare divs
- **Touch-first** — 48px+ targets, `touch-action: manipulation`, offline-capable
