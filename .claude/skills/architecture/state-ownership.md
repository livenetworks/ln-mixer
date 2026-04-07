# State Ownership

> Where state lives determines who can change it and how changes propagate.

---

## Three Layers

| Layer | Survives reload | Changed by | Examples |
|---|---|---|---|
| **External state** (attributes, props) | No | Parent, coordinator, external code | Open/close, active tab, loading flag |
| **Internal state** (instance properties) | No | Component itself only | Current sort, selected items, focused index |
| **Persistent state** (client-side storage) | Yes | Data layer (sync, mutations) | Cached records, sync timestamps, user preferences |

Server database is the ultimate source of truth. Client-side persistent storage is a cache.

---

## Decision Rule

```
Who needs to change this state?
  │
  ├── External code (coordinator, parent, URL) → External state
  │     Observable by the component (MutationObserver for attributes,
  │     event listeners for state changes)
  │     Inspectable in dev tools
  │     Single channel for all triggers
  │
  ├── Only the component itself → Internal state
  │     Internal bookkeeping, no outside interference
  │     Readable from outside, writable only from inside
  │
  └── Must survive page reload → Persistent state
        Client-side storage (IndexedDB, localStorage)
        Managed by a data layer, not by UI components
```

---

## Anti-Patterns

- **External state for internal concerns** — storing sort direction as an attribute when nobody sets it from outside
- **Internal state for externally controlled behavior** — setting `isOpen = true` internally when the coordinator should control open/close via attribute
- **Persistent state for UI state** — storing "which modal is open" in IndexedDB
- **Duplicate state** — attribute says one thing, internal property says another. One source of truth per piece of state.
- **UI components managing persistence directly** — persistence is the data layer's job, not the table's or form's
