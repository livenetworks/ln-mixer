# ln-dj-mixer — DJ Music Player

Music player for events and ceremonies. Plays specific tracks with precise timing: background loops, dramatic cues at key moments, timed markers, etc.

Target: tablet (10"), offline-capable, touch-optimized.

## How to run

Open `index.html` in a browser. No build step, no server required.
Use Chrome DevTools device mode (tablet landscape) for the intended experience.

## Architecture

- **Vanilla JS** — ln-acme style IIFE components
- **ln-mixer.js** — Thin event coordinator bridging components via events + attributes
- **IndexedDB** — Persistence for profiles, playlists, settings (native API, no library)
- **ln-modal (from ln-acme)** — Modal dialogs via `lnModal.open()/close()`
- **WaveSurfer.js v7** — Waveform rendering (internal to ln-deck, `media` option syncs with `<audio>`)
- **Web Audio API** — AudioContext + masterGain in ln-mixer, per-deck MediaElementSourceNode

### IndexedDB Schema

DB: `lnDjMixer`, version: 2

| Store | keyPath | Structure |
|---|---|---|
| `profiles` | `id` | `{ id, name, playlists: { playlistId: { name, tracks: [{ title, artist, duration, durationSec, url, notes, loops: [{ name, startSec, endSec, startPct, endPct }] }] } } }` |
| `settings` | `key` | `{ key: 'app', apiUrl, brandLogo }` |
| `audioFiles` | `url` | `{ url, blob: Blob, size, timestamp }` — cached audio files |

### Init Flow

`lnDb.open()` → `ln-profile._loadFromDb()` → render profile buttons → `ln-profile:switched` → `ln-mixer` sets `data-ln-playlist-profile` → `ln-playlist.loadProfile()` → rebuild sidebar

Empty state: no profiles, no playlists — user starts by pressing [+] to create a profile.

## ln-acme Principles

This project follows [ln-acme](https://github.com/livenetworks/ln-acme) conventions:

### HTML
- NO bare `<div>` — use `<section>`, `<article>`, `<nav>`, `<header>`, `<figure>`, `<aside>`, `<main>`, `<output>`, `<mark>`, `<fieldset>`
- `type="button"` on all `<button>` elements (except `type="submit"` for form submit buttons)
- `data-ln-*` attributes for JS hooks (never class names)
- Native `<audio>` element (hidden, no `controls` attribute)
- Each `<dialog>` wraps content in `<form method="dialog" data-ln-form="...">` — identity + context via `data-ln-*` on the form (no hidden inputs)

### CSS
- `.ln-icon-*` classes for all icons — SVG data URIs in `::before` pseudo-elements, NO emojis
- CSS custom properties (`--var`) for all design tokens
- Dark theme with `--accent: #ffa500`
- Touch targets minimum 44x44px
- `touch-action: manipulation` on interactive elements

### JS
- IIFE with `DOM_SELECTOR` / `DOM_ATTRIBUTE` constants
- Double-load protection: `if (window[DOM_ATTRIBUTE]) return;`
- `_Component` constructor with prototype methods
- `MutationObserver` for dynamic DOM
- Communication via `CustomEvent` with `bubbles: true`

### Component = Data Layer, Coordinator = UI Wiring
- **Components** (ln-profile, ln-playlist, ln-library, ln-deck) are **pure data layers**: state + CRUD + events. They do NOT listen to specific external buttons, do NOT open modals, do NOT show toasts. They manage their own DOM, listen for `request-*` events, and dispatch notification events.
- **Coordinator** (ln-mixer.js) catches specific UI actions (`[data-ln-action="..."]` clicks, `ln-form:submit`) and dispatches **request events** on component DOM elements (`ln-profile:request-create`, `ln-playlist:request-remove-track`). It also handles UI reactions to notification events (toast on `ln-profile:created`, modal close on `ln-profile:deleted`) and bridges components (profile switch → set playlist attribute).
- **Request events** (`ln-{component}:request-{action}`) are incoming commands. **Notification events** (`ln-{component}:{past-tense}`) are outgoing facts. Coordinator NEVER calls component methods directly — always dispatches request events.
- **Queries** (reading state) are allowed directly: `nav.lnProfile.currentId`, `sidebar.lnPlaylist.getTrack(idx)`.
- **Why?** Components are reusable. Coordinator is project-specific. Changing a button or a modal only requires editing the coordinator, not the component.

### Dialog/Form Submit Architecture
- Submit buttons use `type="submit"`, global handler prevents default + dispatches `ln-form:submit` CustomEvent
- Action buttons that trigger save/create MUST only go through form submit path — NOT duplicated in click handlers (avoids double-toast bug)
- `type="button"` for all non-submit actions (open dialogs, remove, upload, etc.)

## Data Attributes

| Attribute | Purpose |
|---|---|
| `data-ln-deck="a"` / `"b"` | Deck root element (ln-deck component) — two instances |
| `data-ln-deck-target="a"` / `"b"` | Links transport/cue buttons to their deck |
| `data-ln-load-to="a"` / `"b"` | Sidebar [A] [B] buttons to load track into specific deck |
| `data-ln-drag-handle` | Drag reorder handle (on `.track-number` span) |
| `data-ln-transport="play"` / `"stop"` | Transport control buttons (per deck) |
| `data-ln-cue="mark-start"` / `"mark-end"` / `"loop"` | Cue point and loop controls (per deck). Loop button is LED toggle (`.btn--led` with `<mark class="led-indicator">`) |
| `data-ln-waveform="a"` / `"b"` | Waveform figure container — WaveSurfer renders here (per deck) |
| `data-ln-audio="a"` / `"b"` | Hidden `<audio>` element inside each deck (WaveSurfer `media` option) |
| `data-ln-potentiometer="master"` | Master volume slider (controls AudioContext masterGain) |
| `data-ln-playlist` | Sidebar root element (ln-playlist component) |
| `data-ln-playlist-profile="..."` | Reactive attribute — profile ID to load (set by ln-mixer) |
| `data-ln-playlist-id="..."` | Child playlist group identifier (`<section>`) |
| `data-ln-playlist-toggle="..."` | Accordion toggle header |
| `data-ln-track-list="..."` | Track list `<ol>` containers (one per playlist) |
| `data-ln-dialog="new-playlist"` / `"track-library"` / `"edit-track"` / `"settings"` / `"new-profile"` / `"name-loop"` | Dialog elements |
| `data-ln-form="new-playlist"` / `"track-library"` / `"edit-track"` / `"settings"` / `"new-profile"` / `"name-loop"` | `<form>` inside each dialog |
| `data-ln-track-index` / `data-ln-playlist-id` | Context attributes on edit-track `<form>` (set by JS, no hidden inputs) |
| `data-ln-action="..."` | Action buttons (new-playlist, create-playlist, open-library, add-to-playlist, edit-track, save-track-edit, remove-track, open-settings, save-settings, upload-logo, new-profile, create-profile, delete-profile, remove-cached, clear-audio-cache) |
| `data-ln-setting="api-url"` | Settings form fields |
| `data-ln-brand` / `data-ln-brand-logo` | Topbar branding elements |
| `data-ln-logo-input` / `data-ln-logo-preview` | Settings dialog internal elements |
| `data-ln-profile-bar` | Profile button container in topbar |
| `data-ln-field="new-profile-name"` | Profile name input in new-profile dialog |
| `data-ln-field="new-playlist-name"` | Playlist name input in new-playlist dialog |
| `data-ln-field="title"` / `"artist"` / `"time-current"` / `"time-total"` | Deck display fields (within each deck root) |
| `data-ln-library` | Library component root (on track-library `<form>`) |
| `data-ln-library-list` | Library track list `<ul>` |
| `data-ln-search="library-list"` | ln-search component on library search fieldset |
| `data-ln-toast` | Toast notification container |
| `data-ln-cache-size` | Settings `<output>` — shows cached tracks count + size |
| `data-ln-cached` | Library `<li>` — track audio is cached in IDB |
| `data-ln-downloading` | Library `<li>` — download in progress |
| `data-ln-loop-segments="a"` / `"b"` | Loop segment button container below deck controls |
| `data-ln-loop-index="0"` / `"1"` / ... | Individual loop segment button (JS-generated, per deck) |
| `data-ln-field="loop-name"` | Loop name input in name-loop dialog |
| `data-ln-field="loop-range"` | Loop time range display in name-loop dialog |
| `data-ln-loop-start` / `data-ln-loop-end` | Loop time (sec) context attributes on name-loop `<form>` |
| `data-ln-loop-start-pct` / `data-ln-loop-end-pct` | Loop percentage context attributes on name-loop `<form>` |

**Layout**: Deck A (orange) + Deck B (blue) stacked vertically on left (~70%), playlist sidebar on right (~30%). Sidebar uses ln-toggle/ln-accordion for one-at-a-time. Each deck has transport + cue + Loop LED toggle + "Opis" (edit track notes) button, followed by named loop segment buttons strip. Each sidebar track has explicit [A] [B] buttons (48x48px touch targets) to load into a specific deck. Drag & drop reorder via Pointer Events API. "New Playlist" button in sidebar footer.

## File structure

```
ln-dj-mixer/
  CLAUDE.md               ← this file
  index.html              — HTML (empty state, all content rendered by JS from IDB)
  api/
    index.php             — PHP track library API (scans /music/, returns JSON)
  music/                  — audio files (Artist - Title.mp3 format)
  assets/
    css/style.css         — tokens, icons, layout, components
    js/ln-db.js           — shared IndexedDB module (window.lnDb)
    js/ln-profile.js      — profile CRUD component
    js/ln-playlist.js     — playlist/track management component
    js/ln-settings.js     — settings module (API URL, branding — window.lnSettings)
    js/ln-library.js      — track library component (fetch from API, search, populate)
    js/wavesurfer.min.js  — WaveSurfer.js v7 (waveform rendering)
    js/ln-deck.js         — deck component (WaveSurfer + audio playback, transport, cue)
    js/ln-mixer.js        — event coordinator (bridges components, AudioContext routing)
    img/placeholder.svg
```

## Roadmap

- **Phase 2** (complete): Profiles + Persistence + Library + Audio
  - [x] IndexedDB persistence layer (profiles, settings stores)
  - [x] Profile CRUD (create, switch, delete)
  - [x] Settings in IDB (API URL, brand logo)
  - [x] Mocked data removed — empty-start architecture
  - [x] Component refactor: ln-profile extracted from app.js
  - [x] Component refactor: ln-playlist + ln-mixer extracted from app.js
  - [x] Use ln-accordion + ln-toggle from ln-acme for sidebar playlists
  - [x] Component refactor: ln-deck (deck state, transport, cue, progress)
  - [x] Component refactor: ln-settings (settings module, API URL, brand logo)
  - [x] Wire Library dialog to PHP API (ln-library.js component)
  - [x] Audio engine: WaveSurfer.js v7 waveform + real audio playback
  - [x] Web Audio API: AudioContext + masterGain routing in ln-mixer
  - [x] Auto-detect duration from audio files, persist to IDB
  - [x] Audio caching: download tracks to IDB on add, cache-aware deck loading, ln-progress bar
  - [x] Cue points: mark-start/mark-end, multiple named loop segments
- **Phase 3**: PWA — Service Worker, manifest.json, offline caching

## Changelog

### Code Review (2026-02-27)

**Bugs fixed:**

- **BUG-1** `ln-db.js` — `_opening` promise was never reset on `onerror`, causing all subsequent `open()` calls to return a stale rejected promise. Fix: reset `_opening = null` in error handler.
- **BUG-2** `style.css` — `--surface-bg` and `--text-primary` custom properties were used in `.empty-state-icon` and `.library-no-api-icon` but never defined in `:root`. Fix: added `--surface-bg: #222` and `--text-primary: #eee` to design tokens.
- **BUG-3** `api/index.php` — `$baseUrl` hardcoded to domain root, producing wrong music URLs when app runs in a subdirectory (e.g. `/ln-mixer/`). Fix: derive base path from `dirname(dirname(SCRIPT_NAME))`.

**Architecture (ln-acme principles):**

- **ARCH-1** `ln-profile.js` → `ln-mixer.js` — `_updateEmptyState()` was in the profile component, directly toggling `hidden` on empty-state, decks-panel, and sidebar elements. This is coordinator UI work. Moved to `ln-mixer.js` where it reacts to `ln-profile:ready`, `ln-profile:created`, and `ln-profile:deleted` events.
- **ARCH-2** `ln-playlist.js` → `ln-mixer.js` — `openEditTrack()` reached into `document` to set `data-ln-track-index` and `data-ln-playlist-id` on the edit-track `<form>`. This form attribute wiring belongs in the coordinator. Moved to `ln-mixer.js` `ln-playlist:open-edit` handler; component now only dispatches the event with detail data.
- **ARCH-3** `ln-playlist.js` — `ln-toggle:open` listener was on `document` (global), capturing toggle events from anywhere. Scoped to `this.dom` so only sidebar toggles trigger playlist switching.

**Robustness:**

- **ROB-1** `ln-db.js` — All CRUD methods (`get`, `getAll`, `getAllKeys`, `put`, `delete`, `clear`) accessed `_db` directly without null check. If called before `open()`, they threw `TypeError`. Fix: added `_ensureDb()` helper that auto-opens if needed.
- **ROB-2** `ln-profile.js`, `ln-playlist.js`, `ln-library.js` — `_cloneTemplate()` crashed with null reference if a template element was missing. Added null guard with `console.warn` fallback.
- **ROB-3** `ln-mixer.js` — `_downloadBlob()` XHR had no timeout. If server hung, `_downloading[url]` stayed `true` forever, blocking re-downloads. Added `xhr.timeout = 120000` (2 min) with proper cleanup in `ontimeout` handler.
- **ROB-4** `ln-deck.js` — `_render()`, `_onTimeUpdate()`, `_onAudioMetadata()` accessed cached DOM elements without null checks. Added guards on all `this._els.*` references.

### Loop Segments (2026-02-27)

- Multiple named loop segments per track (replaces single cue start/end pair)
- Track data: `loops: [{ name, startSec, endSec, startPct, endPct }]` — old `cueStart/cueEnd/cueStartPct/cueEndPct/loop` fields removed
- UX flow: Cue A (mark-start) → Cue B (mark-end) → Name dialog → segment button appears below deck controls
- Loop LED toggle: `.btn--led` button with `<mark class="led-indicator">`, enables loop enforcement (`_onTimeUpdate` seeks back to `startSec` when `currentTime >= endSec`)
- Segment buttons: click to activate + seek to start, X to delete
- Coordinator wiring: `ln-deck:loop-captured` → modal → `ln-playlist:request-add-loop` → persist → `ln-deck:request-set-loops`
- Sidebar indicators: loop count badge (e.g. "2 loops") in track meta row
- Files changed: `ln-deck.js`, `ln-playlist.js`, `ln-mixer.js`, `index.html`, `style.css`

## Available ln-acme Components

Located at `c:\Users\Dalibor Sojic\ln-acme\js\`:

| Component | Attribute | Use in this project |
|---|---|---|
| ln-accordion | `data-ln-accordion` | Sidebar playlist accordion |
| ln-toggle | `data-ln-toggle` | Works with ln-accordion |
| ln-toast | `data-ln-toast` | Toast notifications |
| ln-modal | `data-ln-modal` | Modal dialogs |
| ln-sortable | `data-ln-sortable` | Drag & drop reorder in playlists |
| ln-search | `data-ln-search` | Library track search |
| ln-ajax | `data-ln-ajax` | — |
| ln-progress | `data-ln-progress` | Library download progress bar |
| ln-upload | `data-ln-upload` | — |
| ln-tabs | `data-ln-tabs` | — |
| ln-select | `data-ln-select` | — |
| ln-nav | `data-ln-nav` | — |
