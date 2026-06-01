# ln-dj-mixer — DJ Music Player

Music player for events and ceremonies. Plays specific tracks with precise timing: background loops, dramatic cues at key moments, timed markers, etc.

Target: tablet (10"), offline-capable, touch-optimized.

## How to run

Serve the folder over HTTP (e.g. Laragon → `ln-mixer.test`) and open `index.html`.
A server is required because the app loads native ES modules + an `importmap`.
Use Chrome DevTools device mode (tablet landscape) for the intended experience.

### Build (JS + CSS)

```
npm run build          # vendor JS bundle + app CSS
npm run build:vendor   # assets/js/ln-ashlar.entry.js → assets/js/ln-ashlar.build.js
npm run build:css      # assets/scss/app.scss          → assets/css/app.css
```

**Two-tier loading** (see `index.html` bottom + `main.js`):

1. **Vendor** — `ln-ashlar.build.js` is a **subset** of ln-ashlar, rebuilt from source
   into our own `assets/js/` via `vite.vendor.config.js`. We do **not** consume
   `ln-ashlar/demo/dist/`, and we do **not** bundle ln-ashlar's master `index.js` (35+
   components). Instead `assets/js/ln-ashlar.entry.js` is an explicit allowlist of the
   8 components this app uses (modal, toast, accordion, toggle, sortable, search,
   progress, data-store); ln-core is pulled in transitively. The entry **also
   re-exports** the three ln-core helpers project files use (`cloneTemplate`,
   `fillTemplate`, `fill`) as named exports, so the bundle is the single runtime source
   of ln-core — project files import them from the bundle, not from the submodule. No
   SCSS in the entry → no CSS sidecar. The matching SCSS subset is
   `assets/scss/_ln-ashlar.scss` (used by `app.scss`), mirroring
   `ln-ashlar/scss/ln-ashlar.scss` order with unused partials omitted. To use another
   ln-ashlar component, add it to BOTH allowlists. Loaded as one `<script type="module">`.
2. **Project** — the 13 mixer files are **not** bundled or minified (this is a demo
   of how to work with ln-ashlar; files stay separate and readable). `main.js` is the
   native-ESM entry that side-effect-imports them. Bare specifiers inside them
   (`ln-ashlar` → the built vendor bundle, `wavesurfer.js`) resolve at runtime via the
   `importmap` in `index.html`. **No build step** for project JS — edit and refresh.

> Deployment note: the **ln-ashlar submodule is dev-only** — it is the source `npm run
> build:vendor` compiles into `ln-ashlar.build.js` (which now also carries the ln-core
> helpers). Production runs entirely off `assets/` and never fetches `ln-ashlar/` at
> runtime, so the submodule folder does **not** need to ship to the server. Audio
> (`music/`), `node_modules/`, `dist/`, and `ln-ashlar/` all excluded from deployment.

## Architecture

- **Vanilla JS** — ln-ashlar style IIFE components
- **ln-mixer.js** — Thin event coordinator bridging components via events + attributes
- **IndexedDB** — Persistence for profiles, playlists, settings (native API, no library)
- **ln-modal (from ln-ashlar)** — Modal dialogs via `lnModal.open()/close()`
- **WaveSurfer.js v7** — Waveform rendering (internal to ln-deck, `media` option syncs with `<audio>`)
- **Web Audio API** — AudioContext + masterGain in ln-mixer, per-deck MediaElementSourceNode

### IndexedDB Schema

DB: `lnDjMixer`, version: 3

| Store | keyPath | Indexes | Structure |
|---|---|---|---|
| `profiles` | `id` | — | `{ id, name }` — slim profile metadata |
| `tracks` | `url` | — | `{ url, title, artist, duration, durationSec, peaks?, peaksDuration? }` — shared track catalog |
| `playlists` | `id` | `profileId` | `{ id, profileId, name, segments: [{ url, notes, loops: [{ name, startSec, endSec, startPct, endPct }] }] }` |
| `settings` | `key` | — | `{ key: 'app', apiUrl, brandLogo }` |
| `audioFiles` | `url` | — | `{ url, blob: Blob, size, timestamp }` — cached audio blobs only |

**Design:** `tracks` store is the shared music catalog (title, artist, duration, peaks). `playlists.segments` reference tracks by `url` and contain playlist-specific data (notes, loops, order). Peaks live in `tracks`, not `audioFiles`. Playlist IDs are globally unique, prefixed with `profileId--`.

### Init Flow

`lnDb.open()` → migration v2→v3 (if needed) → `ln-profile._loadFromDb()` → render profile buttons → `ln-profile:switched` → coordinator loads playlists by `profileId` index + resolves track catalog → `ln-playlist.loadProfile(profileId, playlists, trackCatalog)` → rebuild sidebar

Empty state: no profiles, no playlists — user starts by pressing [+] to create a profile.

## ln-ashlar Principles

This project follows [ln-ashlar](https://github.com/livenetworks/ln-ashlar) conventions:

### HTML
- NO bare `<div>` — use `<section>`, `<article>`, `<nav>`, `<header>`, `<figure>`, `<aside>`, `<main>`, `<output>`, `<mark>`, `<fieldset>`
- `type="button"` on all `<button>` elements (except `type="submit"` for form submit buttons)
- `data-ln-*` attributes for JS hooks (never class names)
- Do NOT bind project-specific attributes (e.g. `data-mixer-*`) declaratively via `data-ln-attr` in HTML templates; populate them programmatically in JavaScript.
- Native `<audio>` element (hidden, no `controls` attribute)
- Each `<dialog>` wraps content in `<form method="dialog" data-ln-form="...">` — identity + context via `data-ln-*` on the form (no hidden inputs)

### CSS
- `.ln-icon-*` classes for all icons — sourced from `ln-ashlar/dist/ln-ashlar-icons.css` (Feather Icons, SVG data URIs in `::before` pseudo-elements, NO emojis)
- Dark theme overrides in `:root` redirect `--icon-{name}-gray` → `var(--icon-{name}-white)` so ln-ashlar gray icons render white on dark bg
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
| `data-mixer-deck="a"` / `"b"` | Deck root element (ln-deck component) — two instances |
| `data-mixer-deck-target="a"` / `"b"` | Links transport/cue buttons to their deck |
| `data-mixer-load-to="a"` / `"b"` | Sidebar [A] [B] buttons to load track into specific deck |
| `data-ln-sortable-handle` | Drag reorder handle (on `.track-number` span) — framework |
| `data-mixer-transport="play"` / `"stop"` | Transport control buttons (per deck) |
| `data-mixer-cue="mark-start"` / `"mark-end"` / `"loop"` | Cue point and loop controls (per deck). Loop button is LED toggle |
| `data-mixer-waveform="a"` / `"b"` | Waveform figure container — ln-waveform component (WaveSurfer, zoom, timeline) |
| `data-mixer-zoom="in"` / `"out"` | Waveform zoom buttons (handled by ln-waveform) |
| `data-mixer-audio="a"` / `"b"` | Hidden `<audio>` element inside each deck (WaveSurfer `media` option) |
| `data-mixer-potentiometer="master"` | Master volume slider (controls AudioContext masterGain) |
| `data-mixer-playlist` | Sidebar root element (ln-playlist component) |
| `data-mixer-playlist-profile="..."` | Reactive attribute — profile ID to load (set by ln-mixer) |
| `data-mixer-playlist-id="..."` | Child playlist group identifier (`<section>`) |
| `data-mixer-track-list="..."` | Track list `<ol>` containers (one per playlist) |
| `data-ln-modal` | Dialog modal identifier — framework |
| `data-ln-form="new-playlist"` / `"track-library"` / `"edit-track"` / `"settings"` / `"new-profile"` / `"name-loop"` | `<form>` inside each dialog — framework |
| `data-mixer-track-index` / `data-mixer-playlist-id` | Context attributes on edit-track `<form>` (set by JS, no hidden inputs) |
| `data-mixer-action="..."` | Action buttons (new-playlist, create-playlist, open-library, add-to-playlist, edit-track, save-track-edit, remove-track, open-settings, save-settings, upload-logo, new-profile, create-profile, delete-profile, remove-cached, clear-audio-cache) |
| `data-mixer-setting="api-url"` | Settings form fields |
| `data-mixer-brand` / `data-mixer-brand-logo` | Topbar branding elements |
| `data-mixer-logo-input` / `data-mixer-logo-preview` | Settings dialog internal elements |
| `data-mixer-profile` | Profile component root (`<nav>` in topbar) |
| `data-mixer-empty-state` | Empty state section (hidden when profiles exist) |
| `data-mixer-progress` | Global download progress bar (`<figure>`, managed by ln-mixer-cache) |
| `data-mixer-library-no-api` | "No API configured" notice in library dialog (hidden when API URL is set) |
| `data-mixer-install-field` | PWA install button fieldset (hidden until `beforeinstallprompt` fires) |
| `data-ln-field="new-profile-name"` | Profile name input in new-profile dialog — framework |
| `data-ln-field="new-playlist-name"` | Playlist name input in new-playlist dialog — framework |
| `data-ln-field="title"` / `"artist"` / `"time-current"` / `"time-total"` | Deck display fields (within each deck root) — framework |
| `data-mixer-library` | Library component root (on track-library `<form>`) |
| `data-mixer-library-list` | Library track list `<ul>` |
| `data-ln-search="library-list"` | ln-search component on library search fieldset — framework |
| `data-ln-toast` | Toast notification container — framework |
| `data-mixer-cache-size` | Settings `<output>` — shows cached tracks count + size |
| `data-mixer-cached` | Library `<li>` — track audio is cached in IDB |
| `data-mixer-downloading` | Library `<li>` — download in progress |
| `data-mixer-loop-segments="a"` / `"b"` | Loop segment button container below deck controls |
| `data-mixer-loop-index="0"` / `"1"` / ... | Individual loop segment button (JS-generated, per deck) |
| `data-ln-field="loop-name"` | Loop name input in name-loop dialog — framework |
| `data-ln-field="loop-range"` | Loop time range display in name-loop dialog — framework |
| `data-mixer-loop-start` / `data-mixer-loop-end` | Loop time (sec) context attributes on name-loop `<form>` |
| `data-mixer-loop-start-pct` / `data-mixer-loop-end-pct` | Loop percentage context attributes on name-loop `<form>` |


**Layout**: Deck A (orange) + Deck B (blue) stacked vertically on left (~70%), playlist sidebar on right (~30%). Sidebar uses ln-toggle/ln-accordion for one-at-a-time. Each deck has transport + cue + Loop LED toggle + "Opis" (edit track notes) button, followed by named loop segment buttons strip. Each sidebar track has explicit [A] [B] buttons (48x48px touch targets) to load into a specific deck. Drag & drop reorder via Pointer Events API. "New Playlist" button in sidebar footer.

## File structure

```
ln-dj-mixer/
  CLAUDE.md               ← this file
  index.html              — HTML (empty state, all content rendered by JS from IDB)
  api/
    index.php             — PHP track library API (scans /music/, returns JSON)
  music/                  — audio files (Artist - Title.mp3 format)
  package.json            — scripts: build / build:vendor / build:css
  vite.vendor.config.js   — builds ln-ashlar/js/index.js → assets/js/ln-ashlar.build.js
  assets/
    scss/app.scss         — entry: @use ln-ashlar (from source) + overrides + mixer
    scss/_overrides.scss  — dark-theme + ln-ashlar token overrides
    scss/_mixer.scss      — @use's the 14 component partials
    scss/components/*.scss — buttons, layout, topbar, deck, waveform, sidebar, … (project styles)
    css/app.css           — BUILT (minified, no map): ln-ashlar framework + project styles
    css/ln-ashlar-icons.css — VENDORED, frozen: old class-based data-URI icons (see note below)
    js/ln-ashlar.build.js — BUILT vendor bundle (ln-ashlar master, from source)
    js/main.js            — project ESM entry (side-effect imports the 13 files below)
    js/ln-db.js           — shared IndexedDB module (window.lnDb)
    js/ln-profile.js      — profile CRUD component
    js/ln-playlist.js     — playlist/track management component
    js/ln-settings.js     — settings module (API URL, branding — window.lnSettings)
    js/ln-library.js      — track library component (fetch from API, search, populate)
    js/vendor/wavesurfer.js — WaveSurfer.js v7 ESM (resolved via importmap)
    js/ln-waveform.js     — waveform component (WaveSurfer, zoom, timeline ruler, overlays)
    js/ln-deck.js         — deck component (audio playback, transport, cue, loop management)
    js/ln-mixer.js        — event coordinator core (constructor, exports _LnMixerComponent)
    js/ln-mixer-audio.js  — AudioContext, masterGain, per-deck audio routing, peaks persistence
    js/ln-mixer-cache.js  — audio blob download, IDB cache, progress bar, library/playlist actions
    js/ln-mixer-deck.js   — deck wiring, autoplay, loop segment wiring
    js/ln-mixer-settings.js — profile bridge, playlist persistence, settings form, branding, PWA install
    js/ln-mixer-transfer.js — export/import data as JSON, batch offline download
    img/placeholder.svg
    img/icon.svg          — PWA app icon (SVG, 512x512 viewBox)
  manifest.webmanifest    — PWA manifest (app name, icon, display mode)
  ln-ashlar/              — git submodule, DEV-ONLY source (compiled into ln-ashlar.build.js, incl. ln-core helpers; not loaded at runtime, not deployed)
  sw.js                   — Service Worker (app shell caching, offline support)
```

### Icons — vendored, not rebuilt (intentional)

`assets/css/ln-ashlar-icons.css` is **frozen** from ln-ashlar's *old* class-based icon
system: `.ln-icon-{name}--white::before { background-image: var(--icon-{name}-white) }`
with SVG **data URIs** embedded in the CSS. All icon usage in `index.html` depends on it.

Current ln-ashlar migrated to an SVG **sprite** system (`ln-icons.js` fetches Tabler
icons from a jsDelivr **CDN** at runtime). That is incompatible markup **and breaks
offline** — a non-starter for this offline-first PWA. There are no local SVG sources in
the submodule to regenerate a class-based sheet. So we deliberately keep the old
data-URI CSS as a vendored asset; do **not** try to "rebuild it from ln-ashlar source."

## Roadmap

- **Phase 2** (complete): Profiles + Persistence + Library + Audio
  - [x] IndexedDB persistence layer (profiles, settings stores)
  - [x] Profile CRUD (create, switch, delete)
  - [x] Settings in IDB (API URL, brand logo)
  - [x] Mocked data removed — empty-start architecture
  - [x] Component refactor: ln-profile extracted from app.js
  - [x] Component refactor: ln-playlist + ln-mixer extracted from app.js
  - [x] Use ln-accordion + ln-toggle from ln-ashlar for sidebar playlists
  - [x] Component refactor: ln-deck (deck state, transport, cue, progress)
  - [x] Component refactor: ln-settings (settings module, API URL, brand logo)
  - [x] Wire Library dialog to PHP API (ln-library.js component)
  - [x] Audio engine: WaveSurfer.js v7 waveform + real audio playback
  - [x] Web Audio API: AudioContext + masterGain routing in ln-mixer
  - [x] Auto-detect duration from audio files, persist to IDB
  - [x] Audio caching: download tracks to IDB on add, cache-aware deck loading, ln-progress bar
  - [x] Cue points: mark-start/mark-end, multiple named loop segments
- **Phase 3** (complete): PWA — Service Worker, manifest, offline caching
  - [x] Web App Manifest (`manifest.webmanifest`) with SVG icon
  - [x] Service Worker (`sw.js`) — cache-first app shell, network-first API
  - [x] PWA meta tags (theme-color, apple-mobile-web-app-*)
  - [x] SW registration in index.html
  - [x] App icon (`assets/img/icon.svg`)

## Changelog

### Coordinator Attribute and Import Cleanups (2026-06-02)

- **Bug:** Mismatched data attribute prefixes in `ln-mixer-transfer.js` entirely broke data transfer actions (Export, Import, Fetch, Batch Download) because they queried framework-generic `[data-ln-action]`, `[data-ln-import-file]`, and `[data-ln-transfer-status]` whereas the DOM in `index.html` defined them using project-specific `data-mixer-*` prefixes.
- **Fix:** Corrected all data transfer action targets and query selectors to use `data-mixer-*` prefix matching `index.html`.
- **Optimization:** Removed redundant coordinator sub-module imports from `assets/js/main.js` (they are already transitively imported and configured inside `ln-mixer.js`).
- **SW:** Cache version bumped v24 → v25.
- Files changed: `assets/js/ln-mixer-transfer.js`, `assets/js/main.js`, `sw.js`, `CLAUDE.md`.

### ln-core baked into vendor bundle — submodule now dev-only (2026-05-30)

- **Bug:** production 404'd on `https://…/ln-ashlar/js/ln-core/index.js`. Root cause: the
  4 project files (`ln-deck`, `ln-library`, `ln-playlist`, `ln-profile`) imported ln-core
  via the bare specifier `ln-ashlar/js/ln-core/index.js`, which the importmap mapped
  `ln-ashlar/` → `./ln-ashlar/` (the **submodule**). A submodule is a gitlink, not files —
  it was never checked out on the server, so the folder was empty → 404. ln-core was the
  *only* runtime dependency on the submodule (everything else is baked into the build).
- **Fix (the build is now the single runtime source of ln-core):**
  - `ln-ashlar.entry.js` now **re-exports** `cloneTemplate, fillTemplate, fill` from
    `ln-ashlar/js/ln-core/index.js` (build-time resolve via Vite alias). They become named
    exports of `ln-ashlar.build.js` (verified at its tail). ln-core was already in the
    bundle transitively; this just surfaces the public helpers.
  - importmap: `"ln-ashlar/": "./ln-ashlar/"` → `"ln-ashlar": "./assets/js/ln-ashlar.build.js"`.
  - 4 project files: `from 'ln-ashlar/js/ln-core/index.js'` → `from 'ln-ashlar'` (same URL
    as the `<script type="module">` vendor load → one module instance, side effects once).
  - `sw.js`: dropped the `LN_ASHLAR` submodule ln-core cache list (no longer fetched);
    cache bumped v23 → v24.
- **Result:** production runs entirely off `assets/`; the ln-ashlar submodule is now
  **dev-only build source** and never needs to ship to the server. Verified: zero runtime
  references to `ln-ashlar/` remain (the lone `ln-ashlar/js/ln-core/index.js` left is in
  `ln-ashlar.entry.js`, which is build-input only). Vendor bundle unchanged at 46.57 kB.
- Files changed: `assets/js/ln-ashlar.entry.js`, `assets/js/ln-ashlar.build.js` (rebuilt),
  `index.html`, `assets/js/ln-deck.js`, `assets/js/ln-library.js`, `assets/js/ln-playlist.js`,
  `assets/js/ln-profile.js`, `assets/js/main.js`, `sw.js`, `CLAUDE.md`.

### ln-ashlar Subset — drop unused components (2026-05-29)

- **Goal:** ln-ashlar.build.js bundled ln-ashlar's master `index.js` (~35 components) and app.css compiled the whole framework, but this app uses a small fraction.
- **Usage analysis** (index.html `data-ln-*` + project JS): only 8 components used — modal, toast, accordion, toggle, sortable, search, progress, **data-store**. Confirmed no runtime cross-deps on dropped components: `window.lnHttp` is referenced only by ln-http itself; the subset bundle references only `window.lnCore` (which ln-data-store sets internally). `ln-icons` (CDN sprite fetcher) dropped — app uses the vendored data-URI icon CSS, not sprites.
- **JS** — new `assets/js/ln-ashlar.entry.js` (explicit allowlist of the 8 imports) replaces `ln-ashlar/js/index.js` as the vendor entry. No SCSS in the entry, so the `dropCss` Vite plugin was removed. **ln-ashlar.build.js: 210 KB → 46 KB (−78%).**
- **SCSS** — new `assets/scss/_ln-ashlar.scss` mirrors `ln-ashlar/scss/ln-ashlar.scss` order but `@use`s only foundations (config + base + utilities + animations) and the used component partials (form, toggle, accordion, scrollbar, progress, modal, toast + co-located ln-modal/ln-search). `app.scss` now `@use 'ln-ashlar'` (the local subset). **app.css: 178 KB → 88 KB (−50%).**
- **Drop-safety verified:** every dropped partial is scoped to a class/attribute the app never uses (`.btn`, `.section`, `nav[data-ln-nav]`, `[data-ln-link]`, table, data-table, stepper, timeline, …). `components/form` kept because it styles bare `input`/`label`/`select`. All project component styles + base form styling confirmed present in app.css.
- **To re-add a component:** add its import to `ln-ashlar.entry.js` AND its `@use` to `_ln-ashlar.scss`.
- Files: `assets/js/ln-ashlar.entry.js` (new), `assets/scss/_ln-ashlar.scss` (new), `vite.vendor.config.js`, `assets/scss/app.scss`, `CLAUDE.md`. ⚠️ Not yet visually verified in a browser.

### Sidebar / Accordion Strike-Free Refactor (2026-05-29)

- **Root cause — double mixin emission.** ln-ashlar's `components/_sidebar.scss` is `.sidebar { @include sidebar; }`, and we bundle the full framework via `app.scss`. The project's `_sidebar.scss` *also* did `.sidebar { @include sidebar; … }`, so every declaration was emitted twice and the literal overrides on top (`background`, `border`, `overflow-y`, `> * padding-inline`) struck out the mixin's values across the cascade.
- **Second cause — two component hats.** The `<aside>` carried both `.sidebar` and `data-ln-accordion`, so the framework's `[data-ln-accordion] { @include accordion }` painted border/radius/`overflow:hidden` onto the same element. Two equal-specificity rules → one always struck, regardless of token values.
- **Fix (token-driven, ln-ashlar doctrine):**
  - Project `.sidebar` no longer re-`@include`s the mixin. It only re-binds tokens the mixin **reads** but never **sets** (`--color-bg`, `--border-inline-end`) plus a property the mixin never declares (`border-inline-start`) → zero overridden values on the root.
  - `--padding-x: 0` moved to the scroll region `.playlist-scroll` (mixin sets `--padding-x` only on `.sidebar`, so zeroing it there would strike; on the child we're the sole declarant). Keeps the accordion edge-to-edge.
  - `data-ln-accordion` moved off the root onto an inner `<nav class="playlist-list">` (kept purely for the one-at-a-time toggle JS). Its card chrome is dissolved through the tokens the accordion mixin reads (`--border-*: none`, `--radius-lg: 0`) — sole declarant, no strike. The mixin's `overflow:hidden` is harmless there; scrolling lives on the parent scroll region.
  - Scroll restructure: `.sidebar` keeps the mixin's `overflow:hidden`; an inner `<section class="playlist-scroll">` is the scroll region (`flex:1; overflow-y:auto` — set explicitly, since the mixin's `> main` recipe can't be used: a `<main>` inside the page's `<main>`/`<aside>` is invalid HTML), with `<nav data-ln-accordion>` inside it.
  - Footer defers to the mixin's `> footer { @include app-footer }`; `.sidebar-footer` only feeds `--padding-x`/`--padding-y` tokens (dropped the literal `padding`/`border-top`/`margin-top`). app-footer locally re-binds `--color-border` to a real colour so its divider renders despite the project's bare-triplet `--color-border`.
  - Responsive breakpoint switched physical `border-left`/`border-top` → logical `border-inline-start`/`border-block-start` to match the base rule.
  - Removed the now-unused `@use …/config/mixins` from `_sidebar.scss`.
- **JS:** `ln-playlist.js` `_rebuild()` + `createPlaylist()` now render/remove playlist groups inside `.playlist-list` instead of inserting before `.sidebar-footer` on the sidebar root.
- **Shell height fix (follow-up):** `.main-area` had no `grid-template-rows` on desktop, so its single row was `auto` (content height) — both columns collapsed to content, so the sidebar wasn't full height and its footer ("New Playlist") couldn't reach the bottom (and the decks' `flex: 1 1 50%` couldn't split either). Added `grid-template-rows: minmax(0, 1fr)` so the row fills the player's `1fr` band; the sidebar is now full-height and `.playlist-scroll { flex: 1 }` pins the footer to the bottom.
- **Known residual (accepted):** the footer keeps **one** harmless strike — `.sidebar > * { padding-inline }` vs app-footer's `padding` shorthand (longhand-vs-shorthand at different specificity). Unavoidable while using `@include sidebar`; values are identical so it's visually invisible.
- **Note:** `--color-border` is mapped to a bare HSL triplet project-wide, which silently breaks any ln-ashlar mixin using `var(--color-border)` directly as a colour (except mixins like app-footer/card that locally re-bind it). Worked around here with `hsl()`; a project-wide reconciliation is a future cleanup.
- SW: cache bumped v21 → v23.
- Files changed: `index.html`, `assets/js/ln-playlist.js`, `assets/scss/components/_sidebar.scss`, `assets/scss/components/_layout.scss`, `assets/scss/components/_responsive.scss`, `assets/css/app.css` (built), `sw.js`, `CLAUDE.md`

### SCSS Build Cleanup (2026-05-29)

- **Assessment:** unlike the JS, the CSS had no "demo artifact" problem — `app.scss` already `@use`s `../../ln-ashlar/scss/ln-ashlar` (rebuilt from source), with project styles split into `_overrides.scss` + `_mixer.scss` (14 component partials).
- **Removed 3 dead committed CSS files** (referenced nowhere): `style.css` (37 KB old pre-SCSS monolith), `ln-ashlar-modal.css`, `ln-ashlar-toast.css` (both superseded by app.css, which already includes ln-modal/ln-toast).
- **app.css now minified** — `build:css` uses `--style=compressed --no-source-map` (203 KB → 178 KB). Removed committed `app.css.map`; gitignored `assets/css/*.css.map`.
- **Icons documented as a deliberate vendored asset** — `ln-ashlar-icons.css` (old class-based data-URI system) is kept frozen because current ln-ashlar's sprite system fetches icons from a CDN at runtime (breaks offline). See "Icons — vendored, not rebuilt" above. The 2026-02-28 entry's `icons-only.scss` build path no longer exists in ln-ashlar.
- `assets/css/` now holds only the two files `index.html` loads: `app.css` + `ln-ashlar-icons.css`.
- Files changed: `package.json`, `.gitignore`, `CLAUDE.md`; deleted `style.css`, `ln-ashlar-modal.css`, `ln-ashlar-toast.css`, `app.css.map`

### Build Split — vendor bundle + unbundled project files (2026-05-29)

- **Problem:** `main.js` imported `ln-ashlar/demo/dist/ln-ashlar.js` (a demo build artifact — not a public `exports` entry) and Vite bundled it together with all project code into one 375 KB `main.build.js`. Demo-folder coupling + one cache-busting unit for vendor + project code.
- **ln-ashlar now rebuilt from source** — `vite.vendor.config.js` builds `ln-ashlar/js/index.js` (the same entry ln-ashlar's own build uses) → `assets/js/ln-ashlar.build.js`. `dropCss` plugin (`enforce: 'post'`) discards the SCSS sidecar; styles still come from `app.scss`.
- **Project JS no longer bundled** — the 13 mixer files load as separate, unminified native ES modules via `main.js`. Bare specifiers (`ln-ashlar/js/ln-core/*`, `wavesurfer.js`) resolve through the `importmap` in `index.html` (now functional, previously dead).
- **index.html** — single `main.build.js` tag replaced by two: `ln-ashlar.build.js` (vendor) then `main.js` (project).
- **package.json** — `build` → `build:vendor` (`vite --config vite.vendor.config.js`) + `build:css` (sass). Removed `vite.js.config.js` and `assets/js/main.build.js`.
- **sw.js** — APP_SHELL lists vendor bundle + `main.js` + 13 project files; ln-core paths added to graceful `LN_ASHLAR` list. Cache bumped v20 → v21.
- ln-core imports in project code (`cloneTemplate`/`fillTemplate`/`fill`) kept as-is (resolved via importmap, not refactored to per-file helpers).
- Files changed: `vite.vendor.config.js` (new), `vite.js.config.js` (removed), `main.js`, `index.html`, `package.json`, `sw.js`, `CLAUDE.md`

### Defensive Data Validation (2026-04-07)

- **API response validation** (`ln-library.js`) — new `_validateTrack()` helper validates each track from API: requires non-empty `url` and `title` (string), trims all fields, builds clean object with only known properties. Invalid tracks skipped with console warning.
- **Null guards** in `_buildLibraryItem()` — `.track-name` / `.track-artist` querySelector results checked before `textContent` assignment (ROB-4 pattern)
- **Import JSON validation** (`ln-mixer-transfer.js`) — six per-record validators: `_validateProfile`, `_validateTrackRecord`, `_validateLoop`, `_validateSegment`, `_validatePlaylist`. All strip C0/C1 control chars, trim, truncate to max length, return clean objects or null.
- **Validation helpers** — `_stripControl(str)`, `_sanitizeString(val, maxLen)`, `_isFiniteNumber(val)` + constants (`MAX_STRING_LENGTH=2000`, `MAX_URL_LENGTH=4000`, `MAX_SEGMENTS_PER_PLAYLIST=500`, `MAX_LOOPS_PER_SEGMENT=50`)
- **Simplified `_validateImportData()`** — structural checks only (app, version, non-empty profiles array, v2 arrays). Per-record validation moved to `_processImport` via validators.
- **v1 + v2 import paths** both validate every record before `lnDb.put()`. Skip counts logged. Toast shows actual imported record count, not `data.profiles.length`.
- **File size guard** — `_importFromFile` rejects files > 50MB before `JSON.parse`. `_importFromUrl` checks `content-length` header before parsing.
- Files changed: `ln-library.js`, `ln-mixer-transfer.js`

### IDB Schema Normalization (2026-03-02)

- **Normalized IndexedDB schema** from 3 stores to 5: `profiles`, `tracks`, `playlists`, `settings`, `audioFiles`
- **New `tracks` store** (keyPath: `url`) — shared music catalog with title, artist, duration, peaks
- **New `playlists` store** (keyPath: `id`, index: `profileId`) — playlist segments reference tracks by URL
- **Profiles slimmed** to `{ id, name }` — no longer contain nested playlists
- **Segments** replace nested tracks arrays: `{ url, notes, loops }` — playlist-specific data only
- **Peaks moved** from `audioFiles` to `tracks` store — `audioFiles` is now blob-only cache
- **Individual playlist saves** — `ln-playlist:changed` writes single playlist record (not full profile rewrite)
- **Cascade delete** — profile deletion removes all associated playlists via `deleteByIndex`
- **Track catalog** — ln-playlist receives `trackCatalog` map from coordinator for rendering
- **Duration/peaks** write directly to `tracks` store (no more scanning all playlists)
- **Migration v2→v3** — automatic on first open: extracts tracks, converts playlists, moves peaks, slims profiles
- **Export/import v2** — separate `profiles`, `tracks`, `playlists` arrays; backward-compatible with v1 import
- **New `lnDb` methods** — `getAllByIndex(store, index, value)`, `deleteByIndex(store, index, value)`
- **Playlist IDs** globally unique: prefixed with `profileId--` (migration + new creation)
- SW: cache bumped to v13
- Files changed: `ln-db.js`, `ln-profile.js`, `ln-playlist.js`, `ln-mixer-settings.js`, `ln-mixer-cache.js`, `ln-mixer-deck.js`, `ln-mixer-transfer.js`, `sw.js`, `CLAUDE.md`

### Unified Icon System — Feather Icons in ln-ashlar (2026-02-28)

- **All icons unified in ln-ashlar** using Feather Icons (stroke-based, 24x24 viewBox, stroke-width 2, round linecap/linejoin)
- **`ln-ashlar/scss/config/_icons.scss`** fully rewritten: ~50 icons, each with gray (`#374151`) + white variants
- Replaced all Heroicons-style SVGs with Feather equivalents
- Added 23 mixer-specific icons to ln-ashlar: play, pause, stop, mark, cue, loop, music, volume, next, folder, zoom-in, zoom-out, drag, chevron-up, chevron-down
- **Icons-only build**: `ln-ashlar/scss/icons-only.scss` → `dist/ln-ashlar-icons.css` (46KB), avoids importing full ln-ashlar.css
- **Mixer dark-theme strategy**: `:root` overrides redirect `--icon-{name}-gray` → `var(--icon-{name}-white)` so ln-ashlar gray icons render white
- Special overrides: `--icon-drag-gray` uses mid-gray fill (`#666`), `--icon-check-gray` uses green stroke (`#22c55e`)
- Removed all icon definitions and `.ln-icon-*` classes from mixer `style.css` — now sourced from ln-ashlar
- SW: cache bumped to v4, `ln-ashlar-icons.css` added to ln_ashlar cache array
- Files changed: `ln-ashlar/scss/config/_icons.scss`, `ln-ashlar/scss/icons-only.scss` (new), `ln-ashlar/package.json`, `index.html`, `style.css`, `sw.js`, `CLAUDE.md`

### Waveform Component Extraction + Zoom + Timeline (2026-02-27)

- **New component: `ln-waveform.js`** — extracted from ln-deck.js, owns `<figure data-ln-waveform>`
  - WaveSurfer lifecycle (init/destroy), overlay management (progress, playhead, cue markers)
  - Zoom: +/- buttons, pinch-to-zoom, ctrl+wheel; 4 levels (1x, 2x, 5x, 10x) via `WaveSurfer.zoom()`
  - Timeline ruler: auto-spaced tick marks at bottom of waveform, adapts density to zoom level
  - Pending cue marker: pulsing line on waveform when Cue A is pressed
  - Overlay relocation: `<mark>` elements moved into WaveSurfer's scroll wrapper for correct zoom alignment
  - Auto-scroll via WaveSurfer's native `autoScroll: true` option
- **ln-deck.js refactored**: removed WaveSurfer code, communicates with ln-waveform via direct method calls (deck→waveform) and CustomEvents (waveform→deck)
- **Communication**: `ln-waveform:ready`, `ln-waveform:timeupdate`, `ln-waveform:finish`, `ln-waveform:seeked`
- HTML: `<figure>` wrapped in `<fieldset class="waveform-container">` with zoom `<nav>`, added `<nav class="waveform-timeline">` and `<mark class="cue-marker--pending">`
- CSS: waveform-container, zoom buttons, timeline ruler ticks, pending cue pulse animation, zoomed scroll styles
- SW: cache bumped to v2, ln-waveform.js added to APP_SHELL
- Files added: `assets/js/ln-waveform.js`
- Files changed: `ln-deck.js`, `index.html`, `style.css`, `sw.js`, `CLAUDE.md`

### Code Review (2026-02-27)

**Bugs fixed:**

- **BUG-1** `ln-db.js` — `_opening` promise was never reset on `onerror`, causing all subsequent `open()` calls to return a stale rejected promise. Fix: reset `_opening = null` in error handler.
- **BUG-2** `style.css` — `--surface-bg` and `--text-primary` custom properties were used in `.empty-state-icon` and `.library-no-api-icon` but never defined in `:root`. Fix: added `--surface-bg: #222` and `--text-primary: #eee` to design tokens.
- **BUG-3** `api/index.php` — `$baseUrl` hardcoded to domain root, producing wrong music URLs when app runs in a subdirectory (e.g. `/ln-mixer/`). Fix: derive base path from `dirname(dirname(SCRIPT_NAME))`.

**Architecture (ln-ashlar principles):**

- **ARCH-1** `ln-profile.js` → `ln-mixer.js` — `_updateEmptyState()` was in the profile component, directly toggling `hidden` on empty-state, decks-panel, and sidebar elements. This is coordinator UI work. Moved to `ln-mixer-settings.js` where it reacts to `ln-profile:ready`, `ln-profile:created`, and `ln-profile:deleted` events.
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
- Loop LED toggle: enables loop enforcement (`_onTimeUpdate` seeks back to `startSec` when `currentTime >= endSec`)
- Segment buttons: click to activate + seek to start, X to delete
- Coordinator wiring: `ln-deck:loop-captured` → modal → `ln-playlist:request-add-loop` → persist → `ln-deck:request-set-loops`
- Sidebar indicators: loop count badge (e.g. "2 loops") in track meta row
- Files changed: `ln-deck.js`, `ln-playlist.js`, `ln-mixer.js`, `index.html`, `style.css`

### PWA (2026-02-27)

- `manifest.webmanifest`: standalone display, landscape orientation, SVG icon, dark theme
- `sw.js`: Service Worker with cache-first app shell strategy, network-first for API
  - Pre-caches all HTML/CSS/JS/images on install (ln-ashlar components cached individually, failures skipped)
  - Stale-while-revalidate for app shell (serves cached, updates in background)
  - API requests (`/api/`) go network-first with cache fallback for offline
  - Audio files (`/music/`) skipped — already cached as blobs in IndexedDB by the app
  - Old caches cleaned up on activate (`CACHE_NAME` versioning)
- PWA meta tags in `index.html`: theme-color, apple-mobile-web-app-capable/status-bar-style/title
- `assets/img/icon.svg`: app icon (dark bg, orange music note, 512x512 viewBox)
- Files added: `sw.js`, `manifest.webmanifest`, `assets/img/icon.svg`
- Files changed: `index.html`, `CLAUDE.md`

## Bundled ln-ashlar Components

These 8 (and only these) are bundled into `ln-ashlar.build.js` via the allowlist in
`assets/js/ln-ashlar.entry.js`. ln-ashlar ships ~35 components; the rest are NOT bundled.
To add one: add its import to `ln-ashlar.entry.js` AND its `@use` to `_ln-ashlar.scss`.

| Component | Attribute / API | Use in this project |
|---|---|---|
| ln-modal | `data-ln-modal` | Modal dialogs |
| ln-toast | `data-ln-toast` | Toast notifications |
| ln-accordion | `data-ln-accordion` | Sidebar playlist accordion |
| ln-toggle | `data-ln-toggle` | Works with ln-accordion |
| ln-sortable | `data-ln-sortable` | Drag & drop reorder in playlists |
| ln-search | `data-ln-search` / `el.lnSearch` | Library track search |
| ln-progress | `data-ln-progress` / `window.lnProgress` | Download progress bars |
| ln-data-store | `data-ln-data-store` | Declarative IDB-backed stores (index.html bottom) |

ln-core helpers (`cloneTemplate`, `fillTemplate`, `fill`) are not a component — they are
**re-exported from `ln-ashlar.entry.js`** so the built bundle carries them, and project
files import them via `import { … } from 'ln-ashlar'` (importmap → `ln-ashlar.build.js`).
The submodule's `js/ln-core/` is NOT fetched at runtime. Icons are separate (vendored
`ln-ashlar-icons.css`, see above).
