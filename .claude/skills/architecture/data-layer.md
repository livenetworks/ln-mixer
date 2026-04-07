# Data Layer Architecture

> Pattern for client-side data caching, synchronization, and offline-first behavior in business applications.

---

## Core Principle

Data lives CLIENT-SIDE. The server is the source of truth, but the client keeps a local copy in IndexedDB and works from it. Sort, filter, search happen locally — instant, no server roundtrip. The server is contacted only for mutations (CRUD) and periodic sync to pick up changes from other users.

This is NOT an offline-first architecture (though it supports offline reads). It's a SPEED-first architecture: the user sees data in <50ms instead of waiting 200-500ms for a server response.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        UI COMPONENTS                            │
│            (ln-data-table, autocomplete, KPI cards)             │
│                     receive data, render, emit events           │
└─────────────────────┬───────────────────────┬───────────────────┘
                      │ data                  │ events
┌─────────────────────▼───────────────────────▼───────────────────┐
│                      COORDINATOR                                │
│               (project-specific JS layer)                       │
│         connects stores to UI, handles business logic           │
└─────────────────────┬───────────────────────┬───────────────────┘
                      │ read/write            │ mutations
┌─────────────────────▼───────────────────────▼───────────────────┐
│                       ln-store                                  │
│                  (ln-acme component)                             │
│                                                                 │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────┐ │
│  │  IndexedDB    │  │  Sync Engine  │  │  Mutation Manager    │ │
│  │  read/write   │  │  delta sync   │  │  optimistic updates  │ │
│  │  query/sort   │  │  stale check  │  │  conflict detection  │ │
│  │  filter       │  │  visibility   │  │  revert on error     │ │
│  └──────────────┘  └───────┬───────┘  └──────────┬───────────┘ │
└────────────────────────────┼─────────────────────┼──────────────┘
                             │ HTTP                │ HTTP
┌────────────────────────────▼─────────────────────▼──────────────┐
│                        SERVER (Laravel)                         │
│                                                                 │
│  GET /api/{resource}                → full dataset              │
│  GET /api/{resource}?since={ts}     → delta (changed + deleted) │
│  POST/PUT/DELETE /api/{resource}    → mutations                 │
│  Future: WebSocket                  → push updates              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Stale-While-Revalidate

The same pattern used for AI chat history — show cached data immediately, refresh in background.

```
1. SHOW   → Read from IndexedDB → render instantly (<50ms)
2. CHECK  → Is last_synced_at older than threshold? (e.g., 5 minutes)
3. SYNC   → If stale: GET /api/{resource}?since={last_synced_at}
4. MERGE  → Apply deltas to IndexedDB → reactively update UI if changed
5. SAVE   → Update last_synced_at
```

The user NEVER waits for the server. They see data immediately. If something changed since last visit, it appears within 1-2 seconds as a background update.

### First Visit (Cold Cache)

```
IndexedDB empty → no cached data to show
  → Show skeleton/loading state
  → GET /api/{resource} (full dataset)
  → Store in IndexedDB + render
  → Save last_synced_at
```

This is the ONLY time the user waits for the server. Every subsequent visit is instant.

---

## Delta Sync Protocol

### Request

```
GET /api/{resource}?since=1736937000
```

### Response

```json
{
  "data": [
    { "id": 42, "title": "Updated doc", "status": "approved", "updated_at": 1736952600 },
    { "id": 99, "title": "New doc", "status": "draft", "updated_at": 1736954400 }
  ],
  "deleted": [17, 23],
  "synced_at": 1736953500
}
```

### Fields

| Field | Purpose |
|-------|---------|
| `data` | Records created or updated after `since` timestamp |
| `deleted` | IDs of records deleted (soft-deleted) after `since` timestamp |
| `synced_at` | Server timestamp of this response — becomes next `since` value |

### Server Requirements

- Every syncable table has `updated_at` column (auto-maintained)
- Soft deletes via `deleted_at` column (records with `deleted_at` appear in delta response)
- Endpoint supports `?since=` parameter
- Response includes `synced_at` using server clock (avoids client clock drift)
- Full dataset response (no `?since=`) and delta response have the SAME format

### Sync Triggers

| Trigger | When | Action |
|---------|------|--------|
| Mount | Component mounts (page opens) | Delta sync if stale (threshold elapsed) |
| Visibility | Tab/window becomes visible again | Delta sync (always — user was away) |
| Post-mutation | After successful CRUD | Server confirms, sync not needed (already up to date) |
| Manual | User clicks "Refresh" | Force full sync regardless of staleness |
| Future: WebSocket | Server pushes change notification | Apply delta directly, no HTTP request |

### Staleness Threshold

Default: 5 minutes. Configurable per resource.

```
Threshold = 0        → sync on every mount (fresh data critical)
Threshold = 5min     → normal business data (documents, users, records)
Threshold = 30min    → slow-changing data (settings, templates, standards)
Threshold = Infinity → sync only on visibility change (static reference data)
```

---

## Optimistic Mutations

When the user creates, edits, or deletes a record, the UI updates BEFORE the server responds.

### Flow

```
User Action
  │
  ├── 1. Update IndexedDB immediately (new/changed record)
  ├── 2. Update UI immediately (user sees result)
  ├── 3. Send HTTP request to server
  │
  ├── Server 200 OK
  │     └── Done (IndexedDB and server are in sync)
  │         └── Optionally: update IndexedDB with server-returned data
  │             (server may add computed fields, timestamps, slugs)
  │
  └── Server Error (4xx, 5xx, timeout)
        ├── Revert IndexedDB to previous state
        ├── Revert UI to previous state
        └── Show error to user (toast or inline)
```

### What Gets Optimistically Updated

| Action | Optimistic Update | Server Response Handling |
|--------|-------------------|------------------------|
| Create | Insert into IndexedDB with temp ID, show in UI | Replace temp ID with server ID, update computed fields |
| Update | Update fields in IndexedDB, reflect in UI | Update with server response (final timestamps, etc.) |
| Delete | Remove from IndexedDB, remove from UI | Confirm. On error: restore record. |

### Temporary IDs

Newly created records need a local identifier before the server assigns a real ID:

```
Temp ID format: _temp_{uuid}
  → Used in IndexedDB and UI until server responds
  → Replaced with server-assigned ID on success
  → Temp records are visually identical to real ones (user doesn't know)
```

---

## Conflict Detection

When two users modify the same record, or the current user has unsaved changes while delta sync brings in a newer version.

### Detection

```
Record in delta has updated_at NEWER than the version in local IndexedDB
  → Someone else modified this record while we had it cached
```

### Resolution — Three Scenarios

**Scenario 1: User is only VIEWING (table, detail page, no open form)**

Silent update. Replace the record in IndexedDB, update the UI. No notification needed — the user sees the latest version.

**Scenario 2: User has an EDIT FORM open for this record**

Show notification:

```
┌─────────────────────────────────────────────────┐
│ ⚠ This record was modified by Marko, 5 min ago │
│                                                 │
│ [Keep my changes]  [Load latest]  [View diff]   │
└─────────────────────────────────────────────────┘
```

Do NOT silently overwrite the user's in-progress edits.

**Scenario 3: User SUBMITS edits based on stale data**

Server returns 409 Conflict (if using `updated_at` optimistic locking):

```
PUT /api/documents/42
Request:  { ..., expected_version: 1736937000 }
Response: 409 { message: "Record was modified", current: { ... } }

→ Show conflict UI (same as Scenario 2)
```

### Optimistic Locking (Server Side)

Every update request includes the `updated_at` the client last saw. Server compares:

```php
// Laravel controller
if ($document->updated_at->gt($request->expected_version)) {
    return response()->json([
        'message' => 'Record was modified by another user',
        'current' => $document,
    ], 409);
}
```

---

## Cache Versioning

IndexedDB stores metadata about the cache itself.

### Schema

```
IndexedDB: ln_store_meta
  ├── schema_version: "1.3"          → bumped when data structure changes
  ├── app_version: "2.1.0"           → current app version
  └── stores: {
        "documents": {
          last_synced_at: 1736953500,
          record_count: 1247
        },
        "users": {
          last_synced_at: 1736949600,
          record_count: 85
        }
      }
```

### Invalidation

| Trigger | Action |
|---------|--------|
| App version change (deploy) | Check schema_version. If changed → clear all stores, full reload. |
| User logout | Clear all IndexedDB stores (security) |
| Admin action (mass update/import) | Server can signal "full refresh needed" in delta response |
| Manual | User can force-refresh from UI |

### Schema Version Bump

When the data structure changes (new columns, renamed fields, changed types):

```
Old schema_version: "1.2"
New schema_version: "1.3"

On app load:
  → Compare stored schema_version vs current
  → Mismatch → clear IndexedDB → full reload from server
```

---

## IndexedDB Schema Design

### Per-Resource Store

Each server resource gets its own IndexedDB object store:

```
IndexedDB database: ln_app_cache
  ├── documents        → { id, title, status, category, ... }
  ├── users            → { id, name, email, role, ... }
  ├── standards        → { id, name, code, ... }
  └── _meta            → { schema_version, app_version, store sync timestamps }
```

### Indexes

Create indexes on fields that are sorted or filtered:

```
documents store:
  ├── Primary key: id
  ├── Index: status
  ├── Index: category
  ├── Index: updated_at
  └── Index: [status, category]    → compound index for multi-filter
```

Indexes enable fast client-side queries without scanning all records.

### Data Stored

Store the DISPLAY-READY data, not raw IDs. The server returns resolved/formatted data:

```json
// Server returns display-ready data:
{
  "id": 42,
  "title": "ISO 27001 Policy",
  "status": "approved",
  "status_label": "Approved",
  "category": "Policy",
  "author_name": "Dalibor Petrovski",
  "created_at": 1736937000,
  "updated_at": 1736952600
}

// NOT raw IDs that need client-side resolution:
{
  "id": 42,
  "title": "ISO 27001 Policy",
  "status_id": 3,          ← needs another lookup
  "category_id": 7,        ← needs another lookup
  "author_id": 12,         ← needs another lookup
}
```

This avoids the need for client-side joins or extra lookups.

---

## Client-Side Querying

All sort, filter, and search operations run against IndexedDB. No server requests.

### Sort

```
Query IndexedDB with index-based ordering
  → Return sorted dataset
  → UI renders immediately
```

### Filter

```
Query IndexedDB with index-based filtering (single or compound)
  → Return filtered dataset
  → UI updates immediately
```

### Search (Full-Text)

IndexedDB doesn't have full-text search. Two approaches:

**Approach A: In-memory scan** — for datasets under ~5,000 records:
```
Read all records from IndexedDB into memory
  → Filter with JavaScript string matching
  → Return results
```

**Approach B: Search index** — for larger datasets:
```
Maintain a separate IndexedDB store with searchable text per record
  → Query search index
  → Return matching record IDs
  → Fetch full records by IDs
```

For typical business applications (under 5,000 records per resource), Approach A is sufficient and simpler.

---

## Multi-Tenant Considerations

In multi-tenant applications (DocuFlow, AuditBase):

- IndexedDB is scoped to the DOMAIN (subdomain-per-tenant handles this naturally)
- If same user accesses multiple tenants in same browser: different subdomains = different IndexedDB databases = no cross-contamination
- Tenant ID is NOT part of the IndexedDB key — tenant isolation happens at the subdomain level
- On tenant switch (if applicable): clear IndexedDB and reload

---

## Future: WebSocket Integration

The architecture is designed for WebSocket to DROP IN without changes to UI components or the store interface:

```
Current (polling):
  Visibility change → GET /api/resource?since=ts → merge into IndexedDB

Future (WebSocket):
  Server pushes change event → store receives → merge into IndexedDB
  Same merge logic, same UI reactivity. Only the trigger changes.
```

WebSocket replaces the SYNC TRIGGER, not the sync mechanism. The store's public API doesn't change. UI components don't know or care whether data arrived via HTTP or WebSocket.

---

## Anti-Patterns

- **Server-side sort/filter/search for small datasets** — if <10,000 records, do it client-side from IndexedDB
- **Fetching full dataset on every page load** — use delta sync after first load
- **SSR rendering data rows** — server renders the shell, JS renders data from cache
- **Client-side joins** (resolving IDs to names) — server returns display-ready data
- **Raw IDs in IndexedDB** — store resolved/formatted values
- **Syncing on every mount** — check staleness threshold first
- **Silent conflict overwrites** — detect and surface conflicts to the user
- **Same delta endpoint for all resources** — each resource has its own sync endpoint
- **localStorage for data cache** — too small (5MB limit), no indexes, no structured queries. IndexedDB only.
- **Clearing IndexedDB on every deploy** — only clear when schema_version changes
- **Temp IDs visible to user** — optimistic creates must look identical to confirmed records
- **Polling on a timer** — wasteful. Sync on mount + visibility is sufficient for non-realtime apps
