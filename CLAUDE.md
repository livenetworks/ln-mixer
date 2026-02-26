# ln-dj-mixer — DJ Music Player

Music player for events and ceremonies. Plays specific tracks with precise timing: background loops, dramatic cues at key moments, timed markers, etc.

Target: tablet (10"), offline-capable, touch-optimized.

## How to run

Open `v2/index.html` in a browser. No build step, no server required.
Use Chrome DevTools device mode (tablet landscape) for the intended experience.

- `v1/` — Phase 1 DJ mixer prototype (archived)
- `v2/` — Current version (Phase 2 in progress — IndexedDB persistence, no real audio yet)

## Architecture

- **Vanilla JS** — ln-acme style IIFE components (refactor in progress)
- **ln-mixer.js** — Thin event coordinator bridging components via events + attributes
- **IndexedDB** — Persistence for profiles, playlists, settings (native API, no library)
- **ln-modal (from ln-acme)** — Modal dialogs via `lnModal.open()/close()`
- **WaveSurfer.js v7** — Waveform rendering (v1, planned for v2)
- **Web Audio API** — AudioContext routing with per-deck GainNodes (v1, planned for v2)

### IndexedDB Schema

DB: `lnDjMixer`, version: 1

| Store | keyPath | Structure |
|---|---|---|
| `profiles` | `id` | `{ id, name, playlists: { playlistId: { name, tracks: [] } } }` |
| `settings` | `key` | `{ key: 'app', apiUrl, brandLogo }` |

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
- **Components** (ln-profile, ln-playlist, ln-library) are **pure data layers**: state + CRUD + events. They do NOT listen to specific external buttons, do NOT open modals, do NOT show toasts. They manage their own DOM, listen for `request-*` events, and dispatch notification events.
- **Coordinator** (ln-mixer.js) catches specific UI actions (`[data-ln-action="..."]` clicks, `ln-form:submit`) and dispatches **request events** on component DOM elements (`ln-profile:request-create`, `ln-playlist:request-remove-track`). It also handles UI reactions to notification events (toast on `ln-profile:created`, modal close on `ln-profile:deleted`) and bridges components (profile switch → set playlist attribute).
- **Request events** (`ln-{component}:request-{action}`) are incoming commands. **Notification events** (`ln-{component}:{past-tense}`) are outgoing facts. Coordinator NEVER calls component methods directly — always dispatches request events.
- **Queries** (reading state) are allowed directly: `nav.lnProfile.currentId`, `sidebar.lnPlaylist.getTrack(idx)`.
- **Why?** Components are reusable. Coordinator is project-specific. Changing a button or a modal only requires editing the coordinator, not the component.

### Dialog/Form Submit Architecture
- Submit buttons use `type="submit"`, global handler prevents default + dispatches `ln-form:submit` CustomEvent
- Action buttons that trigger save/create MUST only go through form submit path — NOT duplicated in click handlers (avoids double-toast bug)
- `type="button"` for all non-submit actions (open dialogs, remove, upload, etc.)

## v2 Data Attributes

| Attribute | Purpose |
|---|---|
| `data-ln-deck="a"` / `"b"` | Deck A (now playing) and Deck B (next/cue) sections |
| `data-ln-deck-target="a"` / `"b"` | Links transport/cue buttons to their deck |
| `data-ln-load-to="a"` / `"b"` | Sidebar [A] [B] buttons to load track into specific deck |
| `data-ln-drag-handle` | Drag reorder handle (on `.track-number` span) |
| `data-ln-transport="play"` / `"stop"` | Transport control buttons (per deck) |
| `data-ln-cue="mark-start"` / `"mark-end"` / `"loop"` | Cue point and loop controls (per deck) |
| `data-ln-waveform="a"` / `"b"` | Waveform figure container (per deck) |
| `data-ln-potentiometer="master"` | Master volume slider |
| `data-ln-playlist` | Sidebar root element (ln-playlist component) |
| `data-ln-playlist-profile="..."` | Reactive attribute — profile ID to load (set by ln-mixer) |
| `data-ln-playlist-id="..."` | Child playlist group identifier (`<section>`) |
| `data-ln-playlist-toggle="..."` | Accordion toggle header |
| `data-ln-track-list="..."` | Track list `<ol>` containers (one per playlist) |
| `data-ln-dialog="new-playlist"` / `"track-library"` / `"edit-track"` / `"settings"` / `"new-profile"` | Dialog elements |
| `data-ln-form="new-playlist"` / `"track-library"` / `"edit-track"` / `"settings"` / `"new-profile"` | `<form>` inside each dialog |
| `data-ln-track-index` / `data-ln-playlist-id` | Context attributes on edit-track `<form>` (set by JS, no hidden inputs) |
| `data-ln-action="..."` | Action buttons (new-playlist, create-playlist, open-library, add-to-playlist, edit-track, save-track-edit, remove-track, open-settings, save-settings, upload-logo, new-profile, create-profile, delete-profile) |
| `data-ln-setting="api-url"` | Settings form fields |
| `data-ln-brand` / `data-ln-brand-logo` | Topbar branding elements |
| `data-ln-logo-input` / `data-ln-logo-preview` | Settings dialog internal elements |
| `data-ln-profile-bar` | Profile button container in topbar |
| `data-ln-field="new-profile-name"` | Profile name input in new-profile dialog |
| `data-ln-field="new-playlist-name"` | Playlist name input in new-playlist dialog |
| `data-ln-library` | Library component root (on track-library `<form>`) |
| `data-ln-library-search` / `data-ln-library-list` | Library dialog search + list |
| `data-ln-toast` | Toast notification container |

**Layout**: Deck A (orange) + Deck B (blue) stacked vertically on left (~70%), playlist sidebar on right (~30%). Sidebar uses ln-toggle/ln-accordion for one-at-a-time. Each deck has transport + cue + "Opis" (edit track notes) button. Each sidebar track has explicit [A] [B] buttons (48x48px touch targets) to load into a specific deck. Drag & drop reorder via Pointer Events API. "New Playlist" button in sidebar footer.

## File structure

```
ln-dj-mixer/
  CLAUDE.md               ← this file
  api/
    index.php             — PHP track library API (scans /music/, returns JSON)
  music/                  — audio files (Artist - Title.mp3 format)
  v2/                     ← current
    index.html            — HTML (empty state, all content rendered by JS from IDB)
    assets/
      css/style.css       — tokens, icons, layout, components
      js/ln-db.js         — shared IndexedDB module (window.lnDb)
      js/ln-profile.js    — profile CRUD component
      js/ln-playlist.js   — playlist/track management component
      js/ln-settings.js   — settings module (API URL, branding — window.lnSettings)
      js/ln-library.js    — track library component (fetch from API, search, populate)
      js/ln-mixer.js      — event coordinator (bridges components)
      js/app.js           — deck state (remaining monolith)
      img/placeholder.svg
  v1/                     ← archived Phase 1
    index.html
    assets/
      css/style.css
      css/icons.css
      js/lnAudioRouter.js — Web Audio API routing
      js/lnDeck.js        — deck file loading
      js/lnFileAccess.js  — File System Access API
      js/lnFiles.js       — track list rendering
      js/lnLoadDeck.js    — load-to-deck buttons
      js/lnLoadFolder.js  — folder picker
      js/lnPotentiometer.js — range slider component
      js/lnTrackCache.js  — IndexedDB metadata cache
      js/lnTransport.js   — play/stop controls
      js/lnVisible.js     — tab switching
      js/lnWaveform.js    — WaveSurfer integration
      js/wavesurfer.min.js
      js/idb-keyval-6.2.1-compat.min.js
      js/jsmediatags.min.js
      img/placeholder.svg
      tracks/             — sample .m4a files
```

## Roadmap

- **Phase 2** (in progress): Profiles + Persistence + Library
  - [x] IndexedDB persistence layer (profiles, settings stores)
  - [x] Profile CRUD (create, switch, delete)
  - [x] Settings in IDB (API URL, brand logo)
  - [x] Mocked data removed — empty-start architecture
  - [x] Component refactor: ln-profile extracted from app.js
  - [x] Component refactor: ln-playlist + ln-mixer extracted from app.js
  - [x] Use ln-accordion + ln-toggle from ln-acme for sidebar playlists
  - [ ] Component refactor: ln-deck (deck state, transport, cue, progress)
  - [x] Component refactor: ln-settings (settings module, API URL, brand logo)
  - [x] Wire Library dialog to PHP API (ln-library.js component)
  - [ ] Audio engine: WaveSurfer Regions, cue points, loop sections
- **Phase 3**: PWA — Service Worker, manifest.json, offline caching

## Available ln-acme Components

Located at `c:\Users\Dalibor Sojic\ln-acme\js\`:

| Component | Attribute | Use in this project |
|---|---|---|
| ln-accordion | `data-ln-accordion` | Sidebar playlist accordion (planned) |
| ln-toggle | `data-ln-toggle` | Works with ln-accordion (planned) |
| ln-toast | `data-ln-toast` | Already in use |
| ln-ajax | `data-ln-ajax` | Could use for Library API fetch |
| ln-modal | `data-ln-modal` | Native `<dialog>` preferred |
| ln-progress | `data-ln-progress` | Could use for deck progress |
| ln-upload | `data-ln-upload` | Could use for logo/audio upload |
| ln-tabs | `data-ln-tabs` | — |
| ln-select | `data-ln-select` | — |
| ln-nav | `data-ln-nav` | — |
