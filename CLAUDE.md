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
| `profiles` | `id` | `{ id, name, playlists: { playlistId: { name, tracks: [] } } }` |
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
| `data-ln-cue="mark-start"` / `"mark-end"` / `"loop"` | Cue point and loop controls (per deck) |
| `data-ln-waveform="a"` / `"b"` | Waveform figure container — WaveSurfer renders here (per deck) |
| `data-ln-audio="a"` / `"b"` | Hidden `<audio>` element inside each deck (WaveSurfer `media` option) |
| `data-ln-potentiometer="master"` | Master volume slider (controls AudioContext masterGain) |
| `data-ln-playlist` | Sidebar root element (ln-playlist component) |
| `data-ln-playlist-profile="..."` | Reactive attribute — profile ID to load (set by ln-mixer) |
| `data-ln-playlist-id="..."` | Child playlist group identifier (`<section>`) |
| `data-ln-playlist-toggle="..."` | Accordion toggle header |
| `data-ln-track-list="..."` | Track list `<ol>` containers (one per playlist) |
| `data-ln-dialog="new-playlist"` / `"track-library"` / `"edit-track"` / `"settings"` / `"new-profile"` | Dialog elements |
| `data-ln-form="new-playlist"` / `"track-library"` / `"edit-track"` / `"settings"` / `"new-profile"` | `<form>` inside each dialog |
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

**Layout**: Deck A (orange) + Deck B (blue) stacked vertically on left (~70%), playlist sidebar on right (~30%). Sidebar uses ln-toggle/ln-accordion for one-at-a-time. Each deck has transport + cue + "Opis" (edit track notes) button. Each sidebar track has explicit [A] [B] buttons (48x48px touch targets) to load into a specific deck. Drag & drop reorder via Pointer Events API. "New Playlist" button in sidebar footer.

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

- **Phase 2** (in progress): Profiles + Persistence + Library + Audio
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
  - [ ] Cue points: WaveSurfer Regions, mark-start/mark-end, loop sections
- **Phase 3**: PWA — Service Worker, manifest.json, offline caching

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
