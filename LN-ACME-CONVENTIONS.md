# ln-acme — Component Architecture & Conventions

Complete reference for building vanilla JS applications using the ln-acme component system.
Use this document as the foundation for all new and existing projects.

---

## Table of Contents

1. [Philosophy](#1-philosophy)
2. [HTML Conventions](#2-html-conventions)
3. [CSS Conventions](#3-css-conventions)
4. [JavaScript Architecture](#4-javascript-architecture)
5. [Component Pattern (Data Layer)](#5-component-pattern-data-layer)
6. [Coordinator Pattern (UI Wiring)](#6-coordinator-pattern-ui-wiring)
7. [Event System](#7-event-system)
8. [Dialog & Form Architecture](#8-dialog--form-architecture)
9. [Template System](#9-template-system)
10. [ln-acme Components Reference](#10-ln-acme-components-reference)
11. [Icon System](#11-icon-system)
12. [IndexedDB Persistence](#12-indexeddb-persistence)
13. [Service Worker & PWA](#13-service-worker--pwa)
14. [Design Tokens](#14-design-tokens)
15. [File Structure Convention](#15-file-structure-convention)
16. [Checklist for New Projects](#16-checklist-for-new-projects)

---

## 1. Philosophy

- **Zero build step** — open `index.html` in a browser, no bundler, no server required
- **Vanilla JS only** — no frameworks, no libraries (except task-specific: WaveSurfer, etc.)
- **Semantic HTML** — every element has meaning, no bare `<div>`
- **CSS custom properties** — all values are design tokens, no magic numbers
- **Component = data layer** — state, CRUD, events. No UI assumptions
- **Coordinator = UI wiring** — project-specific glue code. Catches clicks, dispatches requests, reacts to notifications
- **Events over method calls** — components never call each other's methods (except read-only queries)
- **Offline-first** — IndexedDB for data, Service Worker for app shell, blob caching for media

---

## 2. HTML Conventions

### 2.1. Semantic Elements — No Bare `<div>`

Every element must have semantic meaning. Use:

| Element | When to Use |
|---|---|
| `<section>` | Thematic grouping of content (settings section, empty state, playlist group) |
| `<article>` | Self-contained content unit (deck, library track info, modal content) |
| `<nav>` | Navigation or action groups (topbar actions, transport controls, zoom buttons, track load actions) |
| `<header>` | Introductory content (topbar, modal header, deck header, accordion toggle) |
| `<footer>` | Footer content (sidebar footer, modal footer with actions) |
| `<aside>` | Tangential content (sidebar) |
| `<main>` | Primary content area |
| `<figure>` | Self-contained flow content (waveform, logo, progress bar, icon circle) |
| `<figcaption>` | Caption for `<figure>` (screen reader waveform label) |
| `<fieldset>` | Group of related form controls (volume control, search, form fields, waveform container) |
| `<legend>` | Caption for `<fieldset>` (usually `class="sr-only"` for screen readers) |
| `<output>` | Result of calculation or user action (time display, cache size, loop range) |
| `<time>` | Machine-readable time (current time, total time) |
| `<mark>` | Highlighted/annotated content (deck badge, cue markers, waveform overlays, LED indicators, progress bar fill) |
| `<ul>` / `<ol>` | Lists (controls use `<ul>`, ordered tracks use `<ol>`) |
| `<template>` | Inert DOM fragments cloned by JS |

**Never use bare `<div>`.** If you can't find a semantic element, reconsider the structure.

### 2.2. Button Types

```html
<!-- All buttons MUST declare type -->
<button type="button">Action</button>        <!-- Default: NOT submit -->
<button type="submit">Save</button>          <!-- ONLY inside <form>, triggers submit -->
```

- `type="button"` on **all** buttons (open dialogs, remove, upload, toggle, transport, navigation)
- `type="submit"` **only** on the primary save/create button inside a `<form>`
- Never omit `type` — browser default is `submit`, causing accidental form submissions

### 2.3. Data Attributes for JS Hooks

**Never use class names for JavaScript.** All JS hooks use `data-ln-*` attributes:

```html
<!-- Component roots -->
<form data-ln-mixer>                     <!-- Coordinator root -->
<nav data-ln-profile>                    <!-- Profile component -->
<aside data-ln-playlist>                 <!-- Playlist component -->
<article data-ln-deck="a">              <!-- Deck component (parameterized) -->
<figure data-ln-waveform="a">           <!-- Waveform component (parameterized) -->
<form data-ln-library>                   <!-- Library component -->

<!-- Action hooks (coordinator catches these) -->
<button data-ln-action="new-profile">    <!-- Action identifier -->
<button data-ln-action="open-library">
<button data-ln-action="add-to-playlist">

<!-- Component bindings (link elements to components) -->
<button data-ln-transport="play" data-ln-deck-target="a">   <!-- Play on Deck A -->
<button data-ln-cue="mark-start" data-ln-deck-target="a">   <!-- Cue A on Deck A -->
<button data-ln-load-to="a">                                 <!-- Load track to Deck A -->

<!-- Form identity -->
<form data-ln-form="new-playlist">       <!-- Form name for submit handling -->

<!-- Form field identity -->
<input data-ln-field="new-playlist-name"> <!-- Named field inside form -->
<input data-ln-setting="api-url">         <!-- Settings field -->

<!-- Form context (set dynamically by JS, no hidden inputs) -->
<form data-ln-form="edit-track" data-ln-track-index="-1" data-ln-playlist-id="">

<!-- Display elements -->
<p data-ln-field="title">               <!-- Deck title display -->
<time data-ln-field="time-current">     <!-- Time display -->
<output data-ln-cache-size>             <!-- Cache info display -->

<!-- State indicators -->
<li data-ln-cached>                      <!-- Audio is cached -->
<li data-ln-downloading>                 <!-- Download in progress -->

<!-- ln-acme component bindings -->
<aside data-ln-accordion>               <!-- Accordion behavior -->
<section data-ln-toggle>                <!-- Toggle panel -->
<header data-ln-toggle-for>             <!-- Toggle trigger -->
<fieldset data-ln-search="target-id">   <!-- Search component -->
<ol data-ln-sortable>                   <!-- Sortable list -->
<figure data-ln-progress>               <!-- Progress bar -->
<ul data-ln-toast>                      <!-- Toast container -->
```

### 2.4. Accessibility

```html
<!-- Screen-reader only labels -->
<legend class="sr-only">Master Volume</legend>
<figcaption class="sr-only">Deck A waveform</figcaption>

<!-- ARIA attributes -->
<input type="range" aria-label="Master Volume">
<button aria-label="Zoom in" title="Zoom in">
<button aria-pressed="false">     <!-- Toggle state for LED buttons -->
<nav aria-hidden="true">          <!-- Decorative timeline ruler -->
<figure role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">

<!-- Touch targets -->
<!-- All interactive elements minimum 44x44px (see CSS conventions) -->
```

### 2.5. Audio Elements

```html
<!-- Hidden, no controls attribute — playback controlled by JS -->
<audio preload="auto" data-ln-audio="a"></audio>
```

---

## 3. CSS Conventions

### 3.1. Design Tokens (Custom Properties)

All visual values must be CSS custom properties. No hardcoded colors, sizes, or spacing.

```css
:root {
    /* ── Surfaces ── */
    --bg: #111;
    --surface: #1a1a1a;
    --surface-raised: #222;
    --surface-sunken: #181818;

    /* ── Text ── */
    --text: #eee;
    --text-muted: #999;
    --text-dim: #666;
    --highlight: #ffa;

    /* ── Accent (HSL values, not full hsl() — allows opacity) ── */
    --accent: 39 100% 50%;               /* Orange — primary accent */
    --accent-active: 32 100% 50%;        /* Hover/active state */

    /* ── Functional colors (HSL values) ── */
    --cue: 0 100% 63%;                   /* Red */
    --loop: 153 55% 53%;                 /* Green */

    /* ── Interactive ── */
    --button-bg: #333;
    --button-hover: #444;
    --button-border: #444;
    --border-color: #2a2a2a;
    --input-bg: #2a2a2a;
    --input-border: #444;

    /* ── Spacing (rem-based) ── */
    --gap-xs: 0.25rem;                   /* 4px */
    --gap-sm: 0.5rem;                    /* 8px */
    --gap-md: 1rem;                      /* 16px */
    --gap-lg: 1.5rem;                    /* 24px */
    --gap-xl: 2rem;                      /* 32px */

    /* ── Sizing ── */
    --topbar-height: 56px;
    --touch-min: 44px;
    --radius: 6px;
    --radius-sm: 4px;

    /* ── Typography ── */
    --font-main: system-ui, -apple-system, sans-serif;
    --font-mono: 'Courier New', monospace;

    /* ── Transitions ── */
    --transition-fast: 0.15s ease;
    --transition-base: 0.25s ease;
}
```

**HSL accent pattern** — store HSL values without `hsl()` wrapper to enable opacity:

```css
--accent: 39 100% 50%;

/* Usage: */
color: hsl(var(--accent));               /* Solid */
background: hsl(var(--accent) / 0.15);   /* 15% opacity */
border: 1px solid hsl(var(--accent) / 0.3); /* 30% opacity */
```

### 3.2. ln-acme Token Mapping

When using ln-acme CSS components (modal, toast), map your tokens to ln-acme's expected tokens:

```css
:root {
    /* ln-acme modal tokens */
    --color-bg-primary: var(--surface);
    --color-bg-secondary: var(--surface-raised);
    --color-bg-body: var(--bg);
    --color-border: var(--border-color);
    --color-text-primary: var(--text);
    --color-text-muted: var(--text-muted);
    --color-primary: hsl(var(--accent));
    --color-primary-hover: hsl(var(--accent-active));
    --color-primary-light: hsl(var(--accent) / 0.15);
    --color-error: #dc2626;
    --color-error-hover: #b91c1c;
    --z-modal: 1000;
    --radius-md: var(--radius);
    --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.5);
    --spacing-lg: var(--gap-lg);
    --spacing-sm: var(--gap-sm);
    --text-base: 1rem;
    --font-semibold: 600;

    /* ln-acme toast tokens */
    --ln-toast-bg: var(--surface);
    --ln-toast-fg: var(--text);
    --ln-toast-fg-muted: var(--text-muted);
    --ln-toast-border: var(--border-color);
    --ln-toast-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    --ln-toast-info: hsl(var(--accent));
}
```

### 3.3. Icons — ln-acme Icon System

All icons come from `ln-acme-icons.css` (Feather Icons, SVG data URIs in `::before`):

```html
<!-- Icon class pattern -->
<span class="ln-icon-play--white"></span>
<span class="ln-icon-settings--white ln-icon--sm"></span>

<!-- Icon only (button with just icon) -->
<button type="button"><span class="ln-icon-close--white"></span></button>

<!-- Icon + label -->
<button type="button">
    <span class="ln-icon-add--white ln-icon--sm"></span>
    <span class="label">Create</span>
</button>
```

**Class naming**: `.ln-icon-{name}--{color}`

| Color | Hex | Use |
|---|---|---|
| `white` | `#ffffff` | Dark backgrounds (primary use) |
| `gray` | `#374151` | Light backgrounds |
| `red` | `#ef4444` | Destructive / error |
| `green` | `#22c55e` | Success / positive |

**Size modifiers**: `.ln-icon--sm` (1rem), `.ln-icon--lg` (1.5rem), `.ln-icon--xl` (4rem)

**Available icons** (~60 total, including mixer-specific):
- **Navigation**: home, menu, close, back, chevron-up, chevron-down, chevron-left, chevron-right, arrows
- **Actions**: add, edit, save, delete, remove, search, upload, download, check, settings
- **Media**: play, pause, stop, mark, cue, loop, music, volume, next
- **Files**: file, folder, pdf, doc, epub
- **UI**: drag, zoom-in, zoom-out, view, eye, eye-off, info, users, book

**Dark theme strategy**:

For dark backgrounds, all icons use `--white` variant directly. If your project uses a light/dark toggle, override gray → white in `:root`:

```css
/* Redirect gray icons to white on dark bg */
:root {
    --icon-play-gray: var(--icon-play-white);
    --icon-stop-gray: var(--icon-stop-white);
    /* ... repeat for each icon used */
}
```

**No emojis** — all visual indicators use `.ln-icon-*` classes exclusively.

### 3.4. Touch Targets

```css
--touch-min: 44px;

button {
    min-height: var(--touch-min);
    min-width: var(--touch-min);
    touch-action: manipulation;    /* Remove 300ms double-tap delay */
}
```

Load buttons and critical touch targets: `48px` minimum.
Drag handles: `touch-action: none`.

### 3.5. Layout Patterns

**CSS Grid for page structure:**

```css
.player {
    display: grid;
    grid-template-rows: var(--topbar-height) 1fr;
    height: 100vh;
    overflow: hidden;
}

.main-area {
    display: grid;
    grid-template-columns: 1fr 30%;    /* Content 70%, sidebar 30% */
    overflow: hidden;
}
```

**Flexbox for component internals:**

```css
.topbar {
    display: flex;
    align-items: center;
    gap: var(--gap-lg);
}

.sidebar {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
}
```

**Grid for list items:**

```css
.track-content {
    display: grid;
    grid-template-columns: 1.5rem 1fr auto;
    grid-template-rows: auto auto;
    column-gap: var(--gap-sm);
    row-gap: 2px;
}
```

### 3.6. Class Naming

- **BEM-like for component structure**: `.deck`, `.deck--a`, `.deck--b`, `.deck-header`, `.deck-badge`
- **State classes**: `.active`, `.open`
- **Variant modifiers**: `.btn--ghost`, `.btn--danger`, `.btn--sm`, `.btn--led`
- **ln-acme component classes**: `.ln-modal`, `.ln-modal__content`, `.ln-modal__content--sm`, `.ln-toast__card`
- **Utility**: `.sr-only` (screen-reader only)

Never use classes for JS hooks — that's what `data-ln-*` is for.

---

## 4. JavaScript Architecture

### 4.1. IIFE Module Pattern

Every JS file is a self-contained IIFE:

```javascript
(function () {
    'use strict';

    var DOM_SELECTOR = 'data-ln-example';     // Attribute to find component roots
    var DOM_ATTRIBUTE = 'lnExample';           // Property name on element + window

    // Double-load protection
    if (window[DOM_ATTRIBUTE] !== undefined) return;

    /* ================================================================
       CONSTRUCTOR
       ================================================================ */

    function constructor(domRoot) {
        _findElements(domRoot || document.body);
    }

    /* ================================================================
       FIND & INIT
       ================================================================ */

    function _findElements(root) {
        var elements = root.querySelectorAll('[' + DOM_SELECTOR + ']');
        for (var i = 0; i < elements.length; i++) {
            if (!elements[i][DOM_ATTRIBUTE]) {
                new _component(elements[i]);
            }
        }
    }

    /* ================================================================
       COMPONENT
       ================================================================ */

    function _component(dom) {
        this.dom = dom;
        dom[DOM_ATTRIBUTE] = this;

        // Cache DOM refs
        // Initialize state
        // Bind events

        this._bindEvents();
    }

    _component.prototype._bindEvents = function () {
        // Listen for request events
        // Listen for internal DOM events
    };

    /* ================================================================
       MUTATION OBSERVER
       ================================================================ */

    function _domObserver() {
        new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var added = mutations[i].addedNodes;
                for (var j = 0; j < added.length; j++) {
                    if (added[j].nodeType === 1) {
                        _findElements(added[j]);
                    }
                }
            }
        }).observe(document.body, { childList: true, subtree: true });
    }

    /* ================================================================
       INIT
       ================================================================ */

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            constructor(document.body);
        });
    } else {
        constructor(document.body);
    }
    _domObserver();

    /* ================================================================
       EXPORT
       ================================================================ */

    window[DOM_ATTRIBUTE] = constructor;

})();
```

### 4.2. Key Patterns

| Pattern | Detail |
|---|---|
| **Double-load guard** | `if (window[DOM_ATTRIBUTE] !== undefined) return;` — prevents re-execution |
| **DOM_SELECTOR** | The `data-ln-*` attribute to scan for component roots |
| **DOM_ATTRIBUTE** | The property stored on the DOM element AND on `window` |
| **Component on element** | `dom[DOM_ATTRIBUTE] = this` — access component via `el.lnExample` |
| **MutationObserver** | Auto-initializes components added dynamically |
| **Template caching** | `_tmplCache[name]` avoids repeated `querySelector` |
| **Prototype methods** | All methods on `_component.prototype` (not class syntax) |
| **`var` keyword** | ES5 style throughout — no `let`, `const`, arrow functions, template literals |

### 4.3. ES5 Code Style

All code uses ES5 syntax for maximum browser compatibility:

```javascript
// YES:
var self = this;
var items = [];
for (var i = 0; i < list.length; i++) { ... }
function (e) { ... }
'string ' + variable + ' more'

// NO:
let, const
() => { }
for...of
`template ${literals}`
class { }
async/await
```

---

## 5. Component Pattern (Data Layer)

Components are **pure data layers**: they own state, perform CRUD operations, and communicate via events.

### 5.1. What a Component DOES

- Manages its own DOM (render, update elements within its root)
- Owns state (tracks, playlists, profiles, settings)
- Listens for **request events** (incoming commands: `ln-{component}:request-{action}`)
- Dispatches **notification events** (outgoing facts: `ln-{component}:{past-tense}`)
- Exposes **query methods** (read-only: `getTrack()`, `currentId`, `isPlaying`)

### 5.2. What a Component Does NOT Do

- Open modals
- Show toasts
- Listen to buttons outside its DOM root
- Set attributes on other components' elements
- Know about other components (no imports, no references)
- Manipulate DOM outside its root element

### 5.3. Component Structure

```javascript
function _component(dom) {
    this.dom = dom;
    dom[DOM_ATTRIBUTE] = this;

    // ── State ──
    this.items = [];
    this.currentId = null;

    // ── DOM Cache ──
    this._els = {
        list: dom.querySelector('[data-ln-item-list]'),
        title: dom.querySelector('[data-ln-field="title"]')
    };

    this._bindEvents();
}

// ── Request Event Handlers ──

_component.prototype._bindEvents = function () {
    var self = this;

    // Listen for incoming commands (request events)
    this.dom.addEventListener('ln-example:request-create', function (e) {
        self.create(e.detail.name);
    });

    this.dom.addEventListener('ln-example:request-remove', function (e) {
        self.remove(e.detail.id);
    });

    // Listen for ln-acme component events (scoped to this.dom)
    this.dom.addEventListener('ln-toggle:open', function (e) {
        self._onToggleOpen(e);
    });

    this.dom.addEventListener('ln-sortable:reordered', function (e) {
        self._syncAfterReorder(e.target);
    });
};

// ── Command Methods (mutate state, dispatch notification) ──

_component.prototype.create = function (name) {
    var item = { id: _generateId(), name: name };
    this.items.push(item);
    this._render();

    this.dom.dispatchEvent(new CustomEvent('ln-example:created', {
        bubbles: true,
        detail: { item: item }
    }));
};

_component.prototype.remove = function (id) {
    this.items = this.items.filter(function (i) { return i.id !== id; });
    this._render();

    this.dom.dispatchEvent(new CustomEvent('ln-example:removed', {
        bubbles: true,
        detail: { id: id }
    }));
};

// ── Query Methods (read-only, no events) ──

_component.prototype.getItem = function (id) {
    return this.items.find(function (i) { return i.id === id; });
};

_component.prototype.getCurrent = function () {
    return this.currentId ? this.getItem(this.currentId) : null;
};
```

---

## 6. Coordinator Pattern (UI Wiring)

The coordinator (`ln-mixer.js`) is the **project-specific glue**. It bridges components, handles UI reactions, and manages external integrations.

### 6.1. What the Coordinator DOES

- Catches **UI actions** (click on `[data-ln-action="..."]`, form submits)
- Dispatches **request events** on component DOM elements
- Reacts to **notification events** (show toast, close modal, persist to DB)
- Bridges components (profile switch → load playlist → reset decks)
- Manages external services (Web Audio API, IndexedDB, XHR downloads)
- Controls global UI state (empty state visibility, progress bars)

### 6.2. What the Coordinator Does NOT Do

- Store component-level state
- Render component-level DOM
- Export reusable API

### 6.3. Coordinator Event Flow

```
User clicks [data-ln-action="new-playlist"]
    ↓
Coordinator: global click listener catches it
    ↓
Coordinator: lnModal.open('modal-new-playlist')
    ↓
User fills form, clicks Submit
    ↓
Global: form submit → prevented → dispatches 'ln-form:submit' CustomEvent
    ↓
Coordinator: listener checks data-ln-form="new-playlist"
    ↓
Coordinator: reads input value from data-ln-field="new-playlist-name"
    ↓
Coordinator: dispatches 'ln-playlist:request-create' on sidebar element
    ↓
Component: ln-playlist creates playlist, dispatches 'ln-playlist:created'
    ↓
Coordinator: catches 'ln-playlist:created', shows toast, closes modal
    ↓
Coordinator: catches 'ln-playlist:changed', persists profile to IndexedDB
```

### 6.4. Coordinator Structure

```javascript
function _component(dom) {
    this.dom = dom;
    dom[DOM_ATTRIBUTE] = this;

    this._bindScopedEvents();    // Events within this.dom (component notifications)
    this._bindGlobalEvents();    // Events on document (UI actions, form submits)
    this._init();                // Initial data load
}

// ── Scoped Events (component notifications bubble up to coordinator root) ──

_component.prototype._bindScopedEvents = function () {
    var self = this;

    // Profile → Playlist bridge
    this.dom.addEventListener('ln-profile:switched', function (e) {
        var sidebar = self._getSidebar();
        sidebar.setAttribute('data-ln-playlist-profile', e.detail.profileId);
    });

    // Persist changes to DB
    this.dom.addEventListener('ln-playlist:changed', function (e) {
        var profile = self._getNav().lnProfile.getProfile(e.detail.profileId);
        lnDb.put('profiles', profile);
    });

    // UI reactions to notifications
    this.dom.addEventListener('ln-playlist:created', function () {
        window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
            detail: { type: 'success', message: 'Playlist created' }
        }));
    });

    this.dom.addEventListener('ln-playlist:track-edited', function () {
        lnModal.close('modal-edit-track');
        window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
            detail: { type: 'success', message: 'Track updated' }
        }));
    });
};

// ── Global Events (UI action buttons, form submits) ──

_component.prototype._bindGlobalEvents = function () {
    var self = this;

    // Open modal on action button click
    document.addEventListener('click', function (e) {
        if (e.target.closest('[data-ln-action="new-playlist"]')) {
            lnModal.open('modal-new-playlist');
        }
    });

    // Handle form submit → dispatch request event on component
    document.addEventListener('ln-form:submit', function (e) {
        if (e.target.getAttribute('data-ln-form') !== 'new-playlist') return;

        var input = e.target.querySelector('[data-ln-field="new-playlist-name"]');
        var name = input.value.trim();
        if (!name) return;

        var sidebar = self._getSidebar();
        sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-create', {
            bubbles: true,
            detail: { name: name }
        }));

        input.value = '';
        lnModal.close('modal-new-playlist');
    });
};

// ── Component Queries (read-only, direct access allowed) ──

_component.prototype._getNav = function () {
    return this.dom.querySelector('[data-ln-profile]');
};

_component.prototype._getSidebar = function () {
    return this.dom.querySelector('[data-ln-playlist]');
};

_component.prototype._getDeck = function (deckId) {
    return this.dom.querySelector('[data-ln-deck="' + deckId + '"]');
};
```

---

## 7. Event System

### 7.1. Event Naming Convention

```
ln-{component}:request-{action}     → Incoming command (coordinator → component)
ln-{component}:{past-tense-verb}    → Outgoing notification (component → coordinator)
ln-{component}:{noun}               → State notification (ready, error)
```

**Examples:**

| Event | Direction | Meaning |
|---|---|---|
| `ln-profile:request-create` | coordinator → component | "Create a profile with this name" |
| `ln-profile:created` | component → coordinator | "A profile was created" |
| `ln-profile:switched` | component → coordinator | "Active profile changed" |
| `ln-profile:ready` | component → coordinator | "Profiles are loaded and ready" |
| `ln-playlist:request-add-track` | coordinator → component | "Add this track to current playlist" |
| `ln-playlist:track-added` | component → coordinator | "A track was added" |
| `ln-playlist:changed` | component → coordinator | "Playlist data changed (persist me)" |
| `ln-playlist:load-to-deck` | component → coordinator | "User wants to load track to deck" |
| `ln-deck:request-load` | coordinator → component | "Load this track into the deck" |
| `ln-deck:loaded` | component → coordinator | "Track is loaded and ready" |
| `ln-deck:loop-captured` | component → coordinator | "Loop start/end were captured" |
| `ln-library:request-fetch` | coordinator → component | "Fetch tracks from this API URL" |
| `ln-library:fetched` | component → coordinator | "Tracks fetched successfully" |
| `ln-waveform:request-init` | component → component | "Initialize WaveSurfer" |
| `ln-waveform:ready` | component → component | "WaveSurfer is ready" |
| `ln-waveform:timeupdate` | component → component | "Playback time changed" |

### 7.2. Event Dispatching

All events use `CustomEvent` with `bubbles: true`:

```javascript
// Dispatch on component's own DOM element
this.dom.dispatchEvent(new CustomEvent('ln-example:created', {
    bubbles: true,
    detail: { item: item }
}));
```

For toast notifications, dispatch on `window`:

```javascript
window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
    detail: { type: 'success', message: 'Profile created' }
}));
```

### 7.3. Event Listening

**Components listen on their own DOM root** (scoped):

```javascript
this.dom.addEventListener('ln-example:request-create', function (e) {
    self.create(e.detail.name);
});
```

**Coordinator listens on `this.dom`** for notification events (they bubble up):

```javascript
this.dom.addEventListener('ln-profile:created', function (e) {
    // React to profile creation (persist, toast, etc.)
});
```

**Coordinator listens on `document`** for UI actions:

```javascript
document.addEventListener('click', function (e) {
    if (e.target.closest('[data-ln-action="new-profile"]')) {
        lnModal.open('modal-new-profile');
    }
});
```

### 7.4. Request Event Dispatching (Coordinator → Component)

The coordinator dispatches request events **on the component's DOM element**:

```javascript
var sidebar = this._getSidebar();
sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-create', {
    bubbles: true,
    detail: { name: 'My Playlist' }
}));
```

**Never call component methods directly** (except queries):

```javascript
// WRONG — violates component isolation:
sidebar.lnPlaylist.createPlaylist('My Playlist');

// CORRECT — dispatch request event:
sidebar.dispatchEvent(new CustomEvent('ln-playlist:request-create', {
    bubbles: true,
    detail: { name: 'My Playlist' }
}));

// OK — read-only queries are allowed:
var track = sidebar.lnPlaylist.getTrack(index);
var profileId = nav.lnProfile.currentId;
```

---

## 8. Dialog & Form Architecture

### 8.1. Modal HTML Structure

Every modal follows this exact structure:

```html
<section class="ln-modal" id="modal-{name}">
    <article class="ln-modal__content">        <!-- or ln-modal__content--sm -->
        <form data-ln-form="{name}">
            <header>
                <h2>Modal Title</h2>
                <button type="button" class="btn--ghost" data-ln-modal-close>
                    <span class="ln-icon-close--white"></span>
                </button>
            </header>
            <main>
                <!-- Form content: fieldsets, inputs, displays -->
            </main>
            <footer>
                <button type="button" class="btn--danger" data-ln-action="destructive-action">
                    <span class="ln-icon-remove--white ln-icon--sm"></span>
                    <span class="label">Delete</span>
                </button>
                <button type="submit" data-ln-action="save-action">
                    Save
                </button>
            </footer>
        </form>
    </article>
</section>
```

**Size variants**: `ln-modal__content--sm` (28rem) for simple confirmations and name inputs.

### 8.2. Form Input Pattern

```html
<fieldset class="form-field">
    <label for="input-id">Label Text</label>
    <input type="text" id="input-id" name="field-name"
        data-ln-field="field-identifier"
        placeholder="e.g. Example value"
        required />
    <p class="field-hint">Optional helper text</p>
</fieldset>
```

### 8.3. Form Context — No Hidden Inputs

Instead of hidden inputs, use `data-ln-*` attributes on the `<form>` element. JS sets them dynamically:

```html
<!-- HTML: initial state -->
<form data-ln-form="edit-track" data-ln-track-index="-1" data-ln-playlist-id="">

<!-- JS: coordinator sets context before opening modal -->
form.setAttribute('data-ln-track-index', trackIndex);
form.setAttribute('data-ln-playlist-id', playlistId);
lnModal.open('modal-edit-track');

<!-- JS: coordinator reads context on submit -->
var trackIndex = parseInt(form.getAttribute('data-ln-track-index'), 10);
var playlistId = form.getAttribute('data-ln-playlist-id');
```

### 8.4. Global Form Submit Handler

Place this at the bottom of `index.html`, after all scripts:

```html
<script>
    document.addEventListener("submit", function(e) {
        e.preventDefault();
        var form = e.target;
        if (form.hasAttribute('data-ln-form')) {
            form.dispatchEvent(new CustomEvent('ln-form:submit', {
                bubbles: true,
                detail: { form: form }
            }));
        }
    }, true);
</script>
```

This converts all native `submit` events into `ln-form:submit` CustomEvents. The coordinator listens for these and routes them:

```javascript
document.addEventListener('ln-form:submit', function (e) {
    if (e.target.getAttribute('data-ln-form') !== 'new-playlist') return;
    // ... handle form
});
```

### 8.5. Submit vs Button — The Rule

- **Save/Create action**: `type="submit"` — goes through form submit path
- **All other actions**: `type="button"` — handled by click listeners
- **Never duplicate**: an action button that triggers save must ONLY use form submit path, not also a click handler (prevents double-execution)

---

## 9. Template System

### 9.1. HTML Template Definition

Templates are `<template>` elements at the bottom of `<body>`, before scripts:

```html
<template data-ln-template="track-item">
    <li data-ln-track>
        <section class="track-content">
            <span class="track-number" data-ln-sortable-handle></span>
            <article class="track-info">
                <p class="track-name"></p>
                <p class="track-artist"></p>
                <p class="track-duration"></p>
            </article>
            <nav class="track-load-actions">
                <button type="button" class="load-btn" data-ln-load-to="a">A</button>
                <button type="button" class="load-btn" data-ln-load-to="b">B</button>
            </nav>
        </section>
    </li>
</template>
```

### 9.2. Template Cloning in JS

```javascript
var _tmplCache = {};

function _cloneTemplate(name) {
    if (!_tmplCache[name]) {
        _tmplCache[name] = document.querySelector('[data-ln-template="' + name + '"]');
    }
    if (!_tmplCache[name]) {
        console.warn('template not found: ' + name);
        return document.createDocumentFragment();
    }
    return _tmplCache[name].content.cloneNode(true);
}
```

### 9.3. Template Usage

```javascript
_component.prototype._buildTrackItem = function (track, index) {
    var frag = _cloneTemplate('track-item');
    var li = frag.querySelector('[data-ln-track]');

    li.querySelector('.track-name').textContent = track.title;
    li.querySelector('.track-artist').textContent = track.artist || '';
    li.querySelector('.track-duration').textContent = track.duration || '';
    li.querySelector('.track-number').textContent = (index + 1);

    // Set data on action buttons
    var loadA = li.querySelector('[data-ln-load-to="a"]');
    var loadB = li.querySelector('[data-ln-load-to="b"]');
    // Event listeners added in _bindEvents via delegation

    return frag;
};
```

---

## 10. ln-acme Components Reference

### 10.1. ln-modal — Modal Dialogs

**HTML**: `<section class="ln-modal" id="modal-{name}">`

**CSS**: `ln-acme-modal.css` — provides `.ln-modal`, `.ln-modal--open`, `.ln-modal__content`, sizing variants

**JS API** (global `lnModal`):

```javascript
lnModal.open('modal-new-playlist');      // Opens modal by element ID
lnModal.close('modal-new-playlist');     // Closes modal by element ID
```

**Close button**: `<button data-ln-modal-close>` — automatically wired by ln-modal.js

**Body scroll lock**: Adds `body.ln-modal-open` class (CSS: `overflow: hidden`)

**Animation**: `ln-modal-slideIn` (translateY from -50px, 0.3s ease)

**Backdrop**: `rgba(0,0,0,0.5)` with `backdrop-filter: blur(4px)`

### 10.2. ln-toast — Toast Notifications

**HTML**: `<ul data-ln-toast data-ln-toast-timeout="2000" data-ln-toast-max="3"></ul>`

**CSS**: `ln-acme-toast.css` — provides `.ln-toast__item`, `.ln-toast__card`, color variants

**Configuration attributes**:
- `data-ln-toast-timeout="2000"` — auto-dismiss in milliseconds
- `data-ln-toast-max="3"` — maximum visible toasts

**Dispatching a toast** (from coordinator):

```javascript
window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
    detail: {
        type: 'success',       // success | error | warn | info
        message: 'Track saved'
    }
}));
```

**Toast types and colors**:
- `success` — green (#22c55e)
- `error` — red (#ef4444)
- `warn` — amber (#f59e0b)
- `info` — project accent color (customized via `--ln-toast-info`)

### 10.3. ln-accordion — Accordion Panels

**HTML**:

```html
<aside data-ln-accordion>
    <!-- Child sections with data-ln-toggle act as accordion panels -->
    <!-- Only one panel open at a time -->
</aside>
```

**Behavior**: When a toggle opens, ln-accordion closes all sibling toggles. Provides one-at-a-time behavior.

### 10.4. ln-toggle — Toggle/Collapse Panels

**HTML**:

```html
<section data-ln-toggle data-ln-playlist-id="abc">
    <header data-ln-toggle-for>         <!-- Click target -->
        <span class="playlist-name">My Playlist</span>
    </header>
    <ol class="track-list">             <!-- Toggle content (shows/hides) -->
        <!-- Items -->
    </ol>
</section>
```

**Events dispatched**:
- `ln-toggle:open` — fired when a toggle panel opens (bubbles to parent)
- `ln-toggle:close` — fired when a toggle panel closes

**Usage in component** (listen scoped):

```javascript
this.dom.addEventListener('ln-toggle:open', function (e) {
    var playlistId = e.target.getAttribute('data-ln-playlist-id');
    self._switchPlaylist(playlistId);
});
```

### 10.5. ln-sortable — Drag & Drop Reorder

**HTML**:

```html
<ol data-ln-sortable>
    <li>
        <span data-ln-sortable-handle>⠿</span>  <!-- Drag handle -->
        Item content
    </li>
</ol>
```

**Attributes**:
- `data-ln-sortable` — on the list container
- `data-ln-sortable-handle` — on the drag handle element within each item

**Events dispatched**:
- `ln-sortable:reordered` — fired on the list after a drag reorder completes

**CSS states** (added by ln-sortable):
- `.ln-sortable--dragging` — on item being dragged
- `.ln-sortable--drop-before` — drop indicator above
- `.ln-sortable--drop-after` — drop indicator below

**Usage in component**:

```javascript
this.dom.addEventListener('ln-sortable:reordered', function (e) {
    self._syncAfterReorder(e.target);
});
```

### 10.6. ln-search — Search/Filter

**HTML**:

```html
<fieldset data-ln-search="target-list-id">
    <legend class="sr-only">Search</legend>
    <span class="ln-icon-search--white ln-icon--sm"></span>
    <input type="search" placeholder="Search..." data-ln-search-input />
</fieldset>
```

**Attributes**:
- `data-ln-search="target-id"` — points to the list element ID to filter
- `data-ln-search-input` — the search input field

**Behavior**: Filters child elements of the target by text content match. Hidden items get `display: none`.

**JS API** (on element):

```javascript
searchEl.lnSearch.clear();    // Clears search input and shows all items
```

### 10.7. ln-progress — Progress Bar

**HTML**:

```html
<figure data-ln-progress role="progressbar"
    aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
    <mark data-ln-progress="0"></mark>
</figure>
```

**Initialization** (call after dynamic content is rendered):

```javascript
if (window.lnProgress) {
    window.lnProgress(containerElement);
}
```

**Behavior**: The `<mark>` element's `data-ln-progress` attribute value (0–100) controls the progress bar width.

---

## 11. Icon System

### 11.1. File Setup

```html
<link rel="stylesheet" href="./assets/css/ln-acme-icons.css" />
```

Built from ln-acme SCSS: `ln-acme/scss/icons-only.scss` → `dist/ln-acme-icons.css` (~46KB)

### 11.2. Icon Implementation

Each icon is a CSS custom property containing an SVG data URI, applied via `::before`:

```css
/* In ln-acme-icons.css: */
:root {
    --icon-play-white: url("data:image/svg+xml,%3Csvg xmlns='...' ...");
    --icon-play-gray: url("data:image/svg+xml,%3Csvg xmlns='...' ...");
}

.ln-icon-play--white::before {
    content: '';
    display: inline-block;
    width: 1.25rem;
    height: 1.25rem;
    background: var(--icon-play-white) no-repeat center / contain;
    vertical-align: middle;
}
```

### 11.3. Adding New Icons to ln-acme

Edit `ln-acme/scss/config/_icons.scss`, add to the icon map:

```scss
$icons: (
    'new-icon': (
        gray: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">...</svg>',
        white: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">...</svg>'
    )
);
```

**Feather Icon specs**: 24x24 viewBox, stroke-based (not fill), stroke-width 2, round linecap/linejoin.

### 11.4. Dark Theme Icon Override

```css
/* In project style.css — redirect gray to white for dark bg */
:root {
    --icon-play-gray: var(--icon-play-white);
    --icon-stop-gray: var(--icon-stop-white);
    --icon-mark-gray: var(--icon-mark-white);
    /* ... */
}

/* Special overrides */
--icon-drag-gray: url("...");           /* Mid-gray (#666) for subtle drag handles */
--icon-check-gray: url("...");          /* Green (#22c55e) for positive indicators */
```

---

## 12. IndexedDB Persistence

### 12.1. Database Module (`ln-db.js`)

Exported as `window.lnDb`:

```javascript
// Open database (call once at app start)
lnDb.open().then(function () { ... });

// CRUD operations (auto-open if not already open)
lnDb.get('profiles', profileId);         // → Promise<record>
lnDb.getAll('profiles');                 // → Promise<record[]>
lnDb.getAllKeys('profiles');             // → Promise<key[]>
lnDb.put('profiles', profileObject);     // → Promise<void>
lnDb.delete('profiles', profileId);      // → Promise<void>
lnDb.clear('audioFiles');                // → Promise<void>
```

### 12.2. Schema Design

```javascript
var DB_NAME = 'lnDjMixer';
var DB_VERSION = 2;

// onupgradeneeded:
db.createObjectStore('profiles', { keyPath: 'id' });
db.createObjectStore('settings', { keyPath: 'key' });
db.createObjectStore('audioFiles', { keyPath: 'url' });
```

### 12.3. Data Structures

**Profile**:
```javascript
{
    id: 'profile_1709123456789',
    name: 'My Setup',
    playlists: {
        'playlist_abc': {
            name: 'Ceremony',
            tracks: [
                {
                    title: 'Song Title',
                    artist: 'Artist Name',
                    duration: '3:45',
                    durationSec: 225,
                    url: 'https://server.com/music/file.mp3',
                    notes: 'Play at entrance',
                    loops: [
                        {
                            name: 'Chorus',
                            startSec: 45.2,
                            endSec: 78.9,
                            startPct: 20.1,
                            endPct: 35.1
                        }
                    ]
                }
            ]
        }
    }
}
```

**Settings**:
```javascript
{
    key: 'app',
    apiUrl: 'https://server.com/api/',
    brandLogo: 'data:image/png;base64,...'
}
```

**Audio Cache**:
```javascript
{
    url: 'https://server.com/music/file.mp3',
    blob: Blob,              // Raw audio blob
    size: 4521390,           // Bytes
    timestamp: 1709123456789
}
```

### 12.4. Persistence Pattern (Coordinator Responsibility)

Components dispatch `changed` events. The coordinator persists:

```javascript
// In coordinator:
this.dom.addEventListener('ln-playlist:changed', function (e) {
    var nav = self._getNav();
    var profile = nav.lnProfile.getProfile(e.detail.profileId);
    if (profile) {
        lnDb.put('profiles', profile);
    }
});
```

---

## 13. Service Worker & PWA

### 13.1. Manifest (`manifest.webmanifest`)

```json
{
    "name": "App Name",
    "short_name": "Short",
    "description": "App description",
    "start_url": "./index.html",
    "display": "standalone",
    "orientation": "landscape",
    "background_color": "#111111",
    "theme_color": "#1a1a1a",
    "icons": [
        { "src": "./assets/img/icon-192.png", "sizes": "192x192", "type": "image/png" },
        { "src": "./assets/img/icon-512.png", "sizes": "512x512", "type": "image/png" },
        { "src": "./assets/img/icon.svg", "sizes": "any", "type": "image/svg+xml" }
    ]
}
```

### 13.2. HTML PWA Tags

```html
<meta name="theme-color" content="#1a1a1a" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="App Name" />
<link rel="manifest" href="./manifest.webmanifest" />
<link rel="apple-touch-icon" href="./assets/img/icon-192.png" />
```

### 13.3. Service Worker Registration

```html
<script>
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js');
    }
</script>
```

### 13.4. Caching Strategy (`sw.js`)

```javascript
var CACHE_NAME = 'app-name-v1';

// Core files — must succeed
var APP_SHELL = [
    './', './index.html',
    './assets/css/style.css',
    './assets/css/ln-acme-modal.css',
    './assets/css/ln-acme-toast.css',
    './assets/js/ln-db.js',
    // ... all JS files
    './assets/img/icon.svg',
    './manifest.webmanifest'
];

// ln-acme components — skip failures (submodule may not exist)
var LN_ACME = [
    './ln-acme/js/ln-toggle/ln-toggle.js',
    './ln-acme/js/ln-accordion/ln-accordion.js',
    './ln-acme/js/ln-modal/ln-modal.js',
    './ln-acme/js/ln-toast/ln-toast.js',
    './ln-acme/js/ln-search/ln-search.js',
    './ln-acme/js/ln-sortable/ln-sortable.js',
    './ln-acme/js/ln-progress/ln-progress.js',
    './assets/css/ln-acme-icons.css'
];
```

**Three-tier fetch strategy**:

| Request | Strategy | Rationale |
|---|---|---|
| API (`/api/*`) | Network-first, cache fallback | Always get latest data, offline fallback |
| App shell (HTML, CSS, JS, images) | Cache-first, stale-while-revalidate | Fast load, background update |
| Media files (`/music/*`) | Skip (IndexedDB) | App caches blobs in IDB |
| blob: / data: URLs | Skip | Browser handles natively |
| Cross-origin | Skip | Only same-origin cached |

### 13.5. Cache Versioning

Bump `CACHE_NAME` version on every deployment. The `activate` handler cleans old caches:

```javascript
self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (names) {
            return Promise.all(
                names.filter(function (n) { return n !== CACHE_NAME; })
                     .map(function (n) { return caches.delete(n); })
            );
        }).then(function () {
            return self.clients.claim();
        })
    );
});
```

---

## 14. Design Tokens

### 14.1. Complete Token Reference

```css
:root {
    /* ═══ SURFACES ═══ */
    --bg: #111;                        /* Page background */
    --surface: #1a1a1a;                /* Primary surface */
    --surface-raised: #222;            /* Elevated (modal header/footer) */
    --surface-sunken: #181818;         /* Recessed (sidebar) */

    /* ═══ TEXT ═══ */
    --text: #eee;                      /* Primary text */
    --text-muted: #999;                /* Secondary text */
    --text-dim: #666;                  /* Tertiary / disabled */
    --highlight: #ffa;                 /* Bright highlight */

    /* ═══ ACCENT (HSL values) ═══ */
    --accent: 39 100% 50%;            /* Primary accent (orange) */
    --accent-active: 32 100% 50%;     /* Hover/active */

    /* ═══ FUNCTIONAL (HSL values) ═══ */
    --cue: 0 100% 63%;                /* Red — cue markers */
    --loop: 153 55% 53%;              /* Green — loop segments */

    /* ═══ INTERACTIVE ═══ */
    --button-bg: #333;
    --button-hover: #444;
    --button-border: #444;
    --border-color: #2a2a2a;
    --input-bg: #2a2a2a;
    --input-border: #444;

    /* ═══ SPACING ═══ */
    --gap-xs: 0.25rem;                /* 4px */
    --gap-sm: 0.5rem;                 /* 8px */
    --gap-md: 1rem;                   /* 16px */
    --gap-lg: 1.5rem;                 /* 24px */
    --gap-xl: 2rem;                   /* 32px */

    /* ═══ SIZING ═══ */
    --topbar-height: 56px;
    --touch-min: 44px;
    --radius: 6px;
    --radius-sm: 4px;

    /* ═══ TYPOGRAPHY ═══ */
    --font-main: system-ui, -apple-system, sans-serif;
    --font-mono: 'Courier New', monospace;

    /* ═══ TRANSITIONS ═══ */
    --transition-fast: 0.15s ease;
    --transition-base: 0.25s ease;

    /* ═══ LN-ACME MODAL TOKENS ═══ */
    --color-bg-primary: var(--surface);
    --color-bg-secondary: var(--surface-raised);
    --color-bg-body: var(--bg);
    --color-border: var(--border-color);
    --color-text-primary: var(--text);
    --color-text-muted: var(--text-muted);
    --color-primary: hsl(var(--accent));
    --color-primary-hover: hsl(var(--accent-active));
    --color-primary-light: hsl(var(--accent) / 0.15);
    --color-error: #dc2626;
    --color-error-hover: #b91c1c;
    --z-modal: 1000;
    --radius-md: var(--radius);
    --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.5);
    --spacing-lg: var(--gap-lg);
    --spacing-sm: var(--gap-sm);
    --text-base: 1rem;
    --font-semibold: 600;

    /* ═══ LN-ACME TOAST TOKENS ═══ */
    --ln-toast-bg: var(--surface);
    --ln-toast-fg: var(--text);
    --ln-toast-fg-muted: var(--text-muted);
    --ln-toast-border: var(--border-color);
    --ln-toast-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    --ln-toast-info: hsl(var(--accent));
}
```

---

## 15. File Structure Convention

```
project-name/
├── CLAUDE.md                   ← Project-specific AI instructions
├── LN-ACME-CONVENTIONS.md     ← This file (shared across projects)
├── index.html                  ← Single HTML file (no router)
├── manifest.webmanifest        ← PWA manifest
├── sw.js                       ← Service Worker
├── api/
│   └── index.php               ← Backend API (if needed)
├── assets/
│   ├── css/
│   │   ├── style.css           ← Project CSS (tokens, layout, components)
│   │   ├── ln-acme-icons.css   ← Icon system (from ln-acme build)
│   │   ├── ln-acme-modal.css   ← Modal CSS (from ln-acme build)
│   │   └── ln-acme-toast.css   ← Toast CSS (from ln-acme build)
│   ├── js/
│   │   ├── ln-db.js            ← IndexedDB persistence module
│   │   ├── ln-{component}.js   ← Component files (data layers)
│   │   ├── ln-{coordinator}.js ← Coordinator file (UI wiring)
│   │   └── {library}.min.js    ← Third-party libraries (if needed)
│   └── img/
│       ├── icon.svg            ← App icon (SVG, 512x512 viewBox)
│       ├── icon-192.png        ← Raster icon (192x192)
│       ├── icon-512.png        ← Raster icon (512x512)
│       └── placeholder.svg     ← Placeholder image
└── ln-acme/                    ← Submodule (component library)
    └── js/
        ├── ln-modal/ln-modal.js
        ├── ln-toast/ln-toast.js
        ├── ln-toggle/ln-toggle.js
        ├── ln-accordion/ln-accordion.js
        ├── ln-search/ln-search.js
        ├── ln-sortable/ln-sortable.js
        └── ln-progress/ln-progress.js
```

### 15.1. Script Load Order

In `index.html`, scripts load in this order:

```html
<!-- 1. ln-acme components (no dependencies) -->
<script src="./ln-acme/js/ln-toggle/ln-toggle.js"></script>
<script src="./ln-acme/js/ln-accordion/ln-accordion.js"></script>
<script src="./ln-acme/js/ln-modal/ln-modal.js"></script>
<script src="./ln-acme/js/ln-toast/ln-toast.js"></script>
<script src="./ln-acme/js/ln-search/ln-search.js"></script>
<script src="./ln-acme/js/ln-sortable/ln-sortable.js"></script>
<script src="./ln-acme/js/ln-progress/ln-progress.js"></script>

<!-- 2. Database module (no DOM dependencies) -->
<script src="./assets/js/ln-db.js"></script>

<!-- 3. Components (data layers, independent of each other) -->
<script src="./assets/js/ln-profile.js"></script>
<script src="./assets/js/ln-playlist.js"></script>
<script src="./assets/js/ln-settings.js"></script>
<script src="./assets/js/ln-library.js"></script>

<!-- 4. Third-party libraries -->
<script src="./assets/js/wavesurfer.min.js"></script>

<!-- 5. Specialized components (may depend on libraries) -->
<script src="./assets/js/ln-waveform.js"></script>
<script src="./assets/js/ln-deck.js"></script>

<!-- 6. Coordinator (LAST — depends on all above) -->
<script src="./assets/js/ln-mixer.js"></script>

<!-- 7. Global form handler + SW registration -->
<script>
    document.addEventListener("submit", function(e) { ... }, true);
</script>
<script>
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js');
    }
</script>
```

---

## 16. Checklist for New Projects

### HTML Setup

- [ ] `<!DOCTYPE html>` + `<html lang="...">` + proper `<head>` with meta tags
- [ ] PWA meta tags (theme-color, apple-mobile-web-app-*)
- [ ] Link ln-acme CSS files (icons, modal, toast)
- [ ] Link project `style.css`
- [ ] Single root element with `data-ln-{coordinator}` attribute
- [ ] Semantic elements only — no bare `<div>`
- [ ] `type="button"` on all buttons (except `type="submit"` for form saves)
- [ ] `data-ln-*` attributes for all JS hooks
- [ ] Modal sections following `ln-modal` pattern
- [ ] Forms with `data-ln-form="{name}"` + context via `data-ln-*` attributes
- [ ] Templates at bottom of `<body>` with `data-ln-template="{name}"`
- [ ] Toast container: `<ul data-ln-toast data-ln-toast-timeout="2000" data-ln-toast-max="3">`
- [ ] ln-acme JS files loaded first
- [ ] DB module → Components → Coordinator load order
- [ ] Global form submit handler script
- [ ] Service Worker registration script

### CSS Setup

- [ ] `:root` with all design tokens (surfaces, text, accent, spacing, sizing, typography, transitions)
- [ ] ln-acme token mapping (modal tokens + toast tokens)
- [ ] Dark theme icon overrides (gray → white)
- [ ] Reset: `* { box-sizing: border-box; }`, body margin, heading margins
- [ ] Touch targets: min 44x44px, `touch-action: manipulation`
- [ ] `.sr-only` utility class for accessibility
- [ ] No hardcoded values — use custom properties everywhere

### JS Component Setup (per component)

- [ ] IIFE wrapper with `'use strict'`
- [ ] `DOM_SELECTOR` and `DOM_ATTRIBUTE` constants
- [ ] Double-load protection: `if (window[DOM_ATTRIBUTE] !== undefined) return;`
- [ ] `constructor(domRoot)` function
- [ ] `_findElements(root)` scanning for component roots
- [ ] `_component(dom)` with `dom[DOM_ATTRIBUTE] = this`
- [ ] `_bindEvents()` listening for request events on `this.dom`
- [ ] Command methods dispatching notification events (`bubbles: true`)
- [ ] Query methods (read-only, no events)
- [ ] `_cloneTemplate(name)` with caching
- [ ] `MutationObserver` on `document.body`
- [ ] `DOMContentLoaded` or immediate init
- [ ] `window[DOM_ATTRIBUTE] = constructor` export

### JS Coordinator Setup

- [ ] Same IIFE pattern as components
- [ ] `_bindScopedEvents()` on `this.dom` for component notifications
- [ ] `_bindGlobalEvents()` on `document` for UI actions and form submits
- [ ] Component query helpers (`_getNav()`, `_getSidebar()`, etc.)
- [ ] Request event dispatching (never direct method calls)
- [ ] Toast dispatching via `window.dispatchEvent`
- [ ] Modal management via `lnModal.open()` / `lnModal.close()`
- [ ] IndexedDB persistence (react to `changed` events)
- [ ] Initial data loading from IndexedDB

### Service Worker Setup

- [ ] `CACHE_NAME` with version number
- [ ] `APP_SHELL` array (core files, must succeed)
- [ ] `LN_ACME` array (optional, skip failures)
- [ ] Install: cache APP_SHELL + LN_ACME
- [ ] Activate: clean old caches + `clients.claim()`
- [ ] Fetch: three-tier strategy (API network-first, shell cache-first, media skip)
- [ ] Bump `CACHE_NAME` version on every change

### PWA Setup

- [ ] `manifest.webmanifest` with name, icons, display, orientation, colors
- [ ] App icons: SVG (any size) + PNG (192x192, 512x512)
- [ ] Meta tags in `<head>` for iOS/Android

---

## Quick Reference: Event Naming

```
REQUEST:      ln-{component}:request-{verb}        → coordinator dispatches on component element
NOTIFICATION: ln-{component}:{past-tense-verb}     → component dispatches, coordinator listens
STATE:        ln-{component}:{state-noun}           → ready, error, fetched
FORM:         ln-form:submit                        → global submit handler
TOAST:        ln-toast:enqueue                      → dispatched on window
TOGGLE:       ln-toggle:open / ln-toggle:close      → ln-acme toggle events
SORTABLE:     ln-sortable:reordered                 → ln-acme sortable events
SETTINGS:     ln-settings:loaded / ln-settings:saved → settings module events
```

## Quick Reference: DOM Access

```javascript
// Component on element:
element.lnProfile                    // Profile component instance
element.lnPlaylist                   // Playlist component instance
element.lnDeck                       // Deck component instance
element.lnWaveform                   // Waveform component instance
element.lnLibrary                    // Library component instance
element.lnSearch                     // Search component instance (ln-acme)

// Global modules:
window.lnDb                          // IndexedDB API
window.lnSettings                    // Settings module
window.lnModal                       // Modal API (open/close)
window.lnProgress                    // Progress bar initializer
```
