# ln-playlist

Playlist and track management component for the ln-dj-mixer sidebar.

## Usage

```html
<aside class="sidebar" data-ln-playlist data-ln-accordion>
    <footer class="sidebar-footer">
        <button type="button" data-ln-action="new-playlist">New Playlist</button>
    </footer>
</aside>
```

The component attaches to `[data-ln-playlist]` and exposes its instance as `element.lnPlaylist`.

## Attribute-driven loading

The key architectural pattern: **ln-playlist reacts to attribute changes** rather than direct function calls.

```
data-ln-playlist-profile="wedding-dj"
```

When this attribute is set or changed on the root element, the component automatically loads playlists for that profile from `lnProfile.getProfile(id).playlists`.

When the attribute is removed, the component clears all playlists.

### How it works

1. `ln-mixer.js` (the coordinator) listens for `ln-profile:switched`
2. On switch, ln-mixer sets `sidebar.setAttribute('data-ln-playlist-profile', profileId)`
3. ln-playlist has a `MutationObserver` with `attributes: true, attributeFilter: ['data-ln-playlist-profile']`
4. The observer fires `loadProfile(newId)` which reads data from ln-profile and rebuilds the sidebar

This is analogous to the native `attributeChangedCallback` in Web Components. It keeps ln-playlist decoupled from ln-profile - it doesn't know *who* sets the attribute, only that it changed.

### Why attribute observation instead of events?

- **Declarative**: inspectable in DevTools at any moment
- **Decoupled**: ln-playlist doesn't import or reference ln-profile events
- **Testable**: set the attribute manually to trigger a reload
- **SSR-friendly**: if the HTML arrives with the attribute already set, the component reads it on init

## Data flow

```
IndexedDB
  |
  v
ln-profile (holds profiles in memory, exposes getProfile API)
  |
  | ln-profile:switched event
  v
ln-mixer (coordinator - sets data-ln-playlist-profile attribute)
  |
  | MutationObserver (attribute change)
  v
ln-playlist (reads profile.playlists via lnProfile.getProfile, rebuilds UI)
  |
  | ln-playlist:changed event
  v
ln-mixer (calls lnProfile.persist() to save back to IDB)
```

### Live reference pattern

`this.playlists` is a **live reference** to `profile.playlists`. Mutations (add track, remove track, reorder) modify the same object that ln-profile holds. When `ln-playlist:changed` fires, ln-mixer calls `persist()` which serializes the current state to IndexedDB.

**Important**: never reassign `profile.playlists` to a new object - only mutate properties within it.

## State

| Property | Type | Description |
|---|---|---|
| `this.playlists` | `Object\|null` | Live reference to `profile.playlists` |
| `this.currentId` | `string\|null` | Active playlist ID |
| `this.profileId` | `string\|null` | Current profile ID (from attribute) |
| `this.deckHighlight` | `{ a: number, b: number }` | Track indexes highlighted per deck (-1 = none) |

## Events dispatched

All events fire on `this.dom` with `bubbles: true`.

| Event | Detail | When |
|---|---|---|
| `ln-playlist:switched` | `{ playlistId }` | Active playlist changed (accordion toggle) |
| `ln-playlist:changed` | `{ profileId }` | Any data mutation (triggers persist via ln-mixer) |
| `ln-playlist:load-to-deck` | `{ deckId, trackIndex, track, playlistId }` | User clicks [A]/[B] load button |
| `ln-playlist:track-added` | `{ trackIndex, track, playlistId }` | Track added from library dialog |
| `ln-playlist:track-removed` | `{ trackIndex, playlistId }` | Track removed via edit dialog |
| `ln-playlist:track-edited` | `{ trackIndex, playlistId }` | Track notes saved |
| `ln-playlist:reordered` | `{ oldToNew, playlistId }` | Drag & drop reorder completed |

### Event consumers

**app.js** (deck state):
- `ln-playlist:load-to-deck` - loads track into deck A or B
- `ln-playlist:track-removed` - adjusts `deckState[x].trackIndex` (decrement or reset)
- `ln-playlist:reordered` - remaps `deckState[x].trackIndex` via `oldToNew` map
- `ln-playlist:track-added` - auto-loads to deck B if empty

**ln-mixer.js** (persistence):
- `ln-playlist:changed` - calls `lnProfile.persist()`

## Public API

Access via `document.querySelector('[data-ln-playlist]').lnPlaylist`.

| Method | Returns | Description |
|---|---|---|
| `loadProfile(profileId)` | void | Load playlists for given profile (or null to clear) |
| `getPlaylist()` | Object\|null | Current playlist `{ name, tracks: [] }` |
| `getTrack(index)` | Object\|null | Track at index in current playlist |
| `highlightDeck(deckId, index)` | void | Set visual highlight for deck 'a' or 'b' |
| `clearHighlights()` | void | Remove all deck highlights |
| `openEditTrack(index)` | void | Open edit-track dialog for given track index |

## Data attributes

| Attribute | Element | Purpose |
|---|---|---|
| `data-ln-playlist` | `<aside>` | Component root (DOM_SELECTOR) |
| `data-ln-playlist-profile` | `<aside>` | Reactive - profile ID to load (set by ln-mixer) |
| `data-ln-playlist-id` | `<section>` | Child playlist group identifier |
| `data-ln-playlist-toggle` | `<header>` | Accordion toggle identifier |
| `data-ln-track-list` | `<ol>` | Track list container per playlist |
| `data-ln-track` | `<li>` | Track item with numeric index |
| `data-ln-drag-handle` | `<span>` | Drag reorder handle |
| `data-ln-load-to` | `<button>` | Load track to deck A or B |

### Collision avoidance

The component root uses `data-ln-playlist` (no value). Child playlist groups use `data-ln-playlist-id="some-id"` (with value). This parallels the ln-profile pattern (`data-ln-profile` on root, `data-ln-profile-id` on buttons). The `_findElements` function skips elements that have `data-ln-playlist-id` to avoid instantiating components on children.

## MutationObserver pattern

ln-playlist uses **two** MutationObservers:

1. **Global childList** (standard ln-acme pattern) - watches `document.body` for dynamically added DOM nodes that match `[data-ln-playlist]`

2. **Attribute observer** (new pattern) - watches only `this.dom` for changes to the `data-ln-playlist-profile` attribute:

```javascript
this._attrObserver.observe(this.dom, {
    attributes: true,
    attributeFilter: ['data-ln-playlist-profile']
});
```

This is a pattern extension for ln-acme. Existing components (ln-toggle, ln-accordion, ln-toast) only use childList observers. ln-playlist introduces attribute observation for reactive data loading.

## Managed dialogs

ln-playlist owns these dialog interactions:

- **New Playlist** (`modal-new-playlist`) - form submit creates playlist
- **Edit Track** (`modal-edit-track`) - form submit saves notes, remove button deletes track
- **Track Library** (`modal-track-library`) - search + add-to-playlist buttons

## Drag & drop

Uses Pointer Events API for touch + mouse support:
- `pointerdown` on `[data-ln-drag-handle]` starts drag
- `pointermove` shows drop indicators (`.drop-above`, `.drop-below` classes)
- `pointerup` performs DOM move and syncs data array
- Fires `ln-playlist:reordered` with `{ oldToNew }` index mapping

## Toast pattern

Uses decoupled toast dispatch (not direct `lnToast.enqueue()`):

```javascript
window.dispatchEvent(new CustomEvent('ln-toast:enqueue', {
    detail: { type: 'success', message: 'Playlist created' }
}));
```

This keeps the component independent of ln-toast's global API.

## Script load order

```
ln-toggle.js -> ln-accordion.js -> ln-modal.js -> ln-toast.js ->
ln-db.js -> ln-profile.js -> ln-playlist.js -> ln-mixer.js -> app.js
```

ln-playlist must load after ln-profile (reads its API) and before ln-mixer (ln-mixer sets attributes on ln-playlist).

## Generated DOM structure

```html
<aside class="sidebar" data-ln-playlist data-ln-playlist-profile="wedding" data-ln-accordion>

    <section class="playlist-group" data-ln-toggle="open" data-ln-playlist-id="ceremony" id="playlist-ceremony">
        <header data-ln-toggle-for="playlist-ceremony" data-ln-playlist-toggle="ceremony">
            Ceremony Music
        </header>
        <ol class="track-list" data-ln-track-list="ceremony">
            <li data-ln-track="0">
                <span class="track-number" data-ln-drag-handle>1</span>
                <article class="track-info">
                    <p class="track-name">Canon in D</p>
                    <p class="track-artist">Pachelbel</p>
                    <p class="track-duration">4:32</p>
                </article>
                <section class="track-meta-row">
                    <p class="track-notes">Play softly during procession</p>
                    <nav class="track-indicators">
                        <span class="ln-icon-loop ln-icon--sm indicator-loop" title="Loop"></span>
                    </nav>
                </section>
                <nav class="track-load-actions">
                    <button type="button" class="load-btn load-btn--a" data-ln-load-to="a">A</button>
                    <button type="button" class="load-btn load-btn--b" data-ln-load-to="b">B</button>
                </nav>
            </li>
        </ol>
    </section>

    <footer class="sidebar-footer">
        <button type="button" data-ln-action="new-playlist">New Playlist</button>
    </footer>

</aside>
```
