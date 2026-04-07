# ln-mixer

Event coordinator for ln-dj-mixer. No DOM rendering — pure event wiring and UI reaction logic.

## Architecture

ln-mixer is split into a main file and five sub-modules. All sub-modules extend `_component.prototype` by reading `window._LnMixerComponent` which `ln-mixer.js` exports before they load.

| File | Responsibility |
|---|---|
| `ln-mixer.js` | Constructor, `_component` definition, exports `window._LnMixerComponent`, MutationObserver, init |
| `ln-mixer-settings.js` | Profile bridge (profile→playlist), playlist persistence, profile/playlist event reactions (toasts, modals), settings form, branding, PWA install |
| `ln-mixer-deck.js` | Deck wiring (load-to-deck, exclusive play, highlights), autoplay sequencing, loop segment wiring |
| `ln-mixer-audio.js` | AudioContext + masterGain, per-deck MediaElementSourceNode routing, volume slider, peaks persistence |
| `ln-mixer-cache.js` | Audio blob download, IDB cache, progress bar, library/playlist actions |
| `ln-mixer-transfer.js` | Export/import profiles+tracks+playlists+settings as JSON, batch offline download |

## Purpose

Components in ln-dj-mixer are decoupled. They don't reference each other directly. ln-mixer is the glue layer that:

1. **Translates profile switches to attribute changes** — `ln-profile:switched` → loads playlists+trackCatalog from IDB → dispatches `ln-playlist:request-load-profile`
2. **Handles persistence** — `ln-playlist:changed` → writes single playlist record to `lnDb`
3. **Wires UI actions to request events** — `[data-ln-action]` clicks → dispatches `ln-{component}:request-{action}` on the target component
4. **Handles UI reactions** — notification events from components → toasts, modal close, deck index adjustments

## Event wiring overview

```
ln-profile:switched
  → loads playlists + trackCatalog from IDB
  → ln-playlist:request-load-profile { profileId, playlists, trackCatalog }

ln-playlist:changed { playlistId }
  → lnDb.put('playlists', playlist)

ln-playlist:load-to-deck { deckId, trackIndex, track }
  → _loadTrackToDeck() (cache-aware: IDB blob → blobUrl, or direct URL)

ln-deck:played
  → stop all other decks (exclusive play)
  → start autoplay timer if autoplay is ON

ln-deck:ended
  → autoplay: start playing the other deck

ln-deck:loop-captured { deckId, trackIndex, startSec, endSec, startPct, endPct }
  → set form context on [data-ln-form="name-loop"]
  → lnModal.open('modal-name-loop')

ln-deck:edit-requested { trackIndex }
  → ln-playlist:request-open-edit { index }

ln-deck:duration-detected { trackUrl, duration, durationSec }
  → lnDb.put('tracks', ...)
  → ln-playlist:request-update-catalog

ln-deck:peaks-ready { trackUrl, peaks, peaksDuration }
  → lnDb.put('tracks', ...)

ln-playlist:track-removed { trackIndex }
  → ln-deck:request-reset (if deck had that track)
  → ln-deck:request-adjust-index (if deck had higher index)

ln-playlist:reordered { oldToNew }
  → ln-deck:request-adjust-index for each loaded deck

ln-playlist:loop-added / ln-playlist:loop-removed { trackIndex, loops }
  → ln-deck:request-set-loops on matching deck
```

## Component state queries (direct read — allowed)

```javascript
nav.lnProfile.currentId           // active profile ID
nav.lnProfile.profiles            // all profiles map
sidebar.lnPlaylist.currentId      // active playlist ID
sidebar.lnPlaylist.playlists      // playlists map
sidebar.lnPlaylist.trackCatalog   // track catalog map
deckEl.lnDeck.trackIndex          // loaded track index (-1 = empty)
deckEl.lnDeck.isPlaying           // playback state
deckEl.lnDeck.progress            // 0–100 playback progress
```

## Script load order

```
ln-toggle.js → ln-accordion.js → ln-modal.js → ln-toast.js → ln-search.js →
ln-sortable.js → ln-progress.js → ln-db.js → ln-profile.js → ln-playlist.js →
ln-settings.js → ln-library.js → wavesurfer.min.js → ln-waveform.js → ln-deck.js →
ln-mixer.js → ln-mixer-audio.js → ln-mixer-cache.js → ln-mixer-deck.js →
ln-mixer-settings.js → ln-mixer-transfer.js
```

`ln-mixer.js` must load first among mixer files (exports `window._LnMixerComponent`). The sub-modules extend the prototype and can load in any order after that.
