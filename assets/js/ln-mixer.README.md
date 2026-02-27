# ln-mixer

Thin event coordinator that bridges components in the ln-dj-mixer application. No DOM, no rendering - pure event wiring.

## Purpose

Components in ln-dj-mixer are decoupled. They don't reference each other directly. ln-mixer is the glue layer that:

1. **Translates events to attributes** - when ln-profile fires `ln-profile:switched`, ln-mixer sets `data-ln-playlist-profile` on the sidebar element, which triggers ln-playlist to reload
2. **Handles persistence** - when ln-playlist fires `ln-playlist:changed`, ln-mixer calls `lnProfile.persist()` to save to IndexedDB

## Architecture rationale

### Why not direct event listening?

ln-playlist *could* listen to `ln-profile:switched` directly. But that would couple it to ln-profile. Instead:

- ln-playlist only knows about its own attribute (`data-ln-playlist-profile`)
- ln-mixer is the only place that knows both ln-profile and ln-playlist exist
- If we replace ln-profile with a different auth system, only ln-mixer changes

### Why not imperative calls?

ln-mixer *could* call `sidebar.lnPlaylist.loadProfile(id)` directly. But:

- Attribute-driven is declarative and inspectable in DevTools
- The MutationObserver pattern is consistent with how Web Components work
- It separates "when to load" (ln-mixer decides) from "how to load" (ln-playlist decides)

## Event wiring

```
ln-profile:switched  -->  ln-mixer  -->  sidebar[data-ln-playlist-profile] = id
                                              |
                                              v
                                         ln-playlist reloads

ln-playlist:changed  -->  ln-mixer  -->  lnProfile.persist()
```

## Code

```javascript
(function () {
    'use strict';

    if (window.lnMixer !== undefined) return;
    window.lnMixer = true;

    function _init() {
        // Profile -> Playlist attribute bridge
        document.addEventListener('ln-profile:switched', function (e) {
            var sidebar = document.querySelector('[data-ln-playlist]');
            if (!sidebar) return;
            var profileId = e.detail.profileId;
            if (profileId) {
                sidebar.setAttribute('data-ln-playlist-profile', profileId);
            } else {
                sidebar.removeAttribute('data-ln-playlist-profile');
            }
        });

        // Playlist data persistence
        document.addEventListener('ln-playlist:changed', function () {
            var nav = document.querySelector('[data-ln-profile]');
            if (nav && nav.lnProfile) nav.lnProfile.persist();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _init);
    } else {
        _init();
    }
})();
```

## Future growth

As more components are extracted from app.js, ln-mixer will absorb their event wiring:

- **ln-deck** extracted: ln-mixer will relay `ln-playlist:load-to-deck` to deck, and deck state changes back to playlist highlights
- **ln-settings** extracted: ln-mixer will relay profile/settings events
- Eventually app.js is deleted entirely and ln-mixer is the sole coordinator

## Script load order

Must load after both ln-profile.js and ln-playlist.js, and before app.js:

```
... -> ln-profile.js -> ln-playlist.js -> ln-mixer.js -> app.js
```
