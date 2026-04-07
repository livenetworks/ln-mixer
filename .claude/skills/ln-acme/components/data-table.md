# ln-acme — Data Table Implementation

> HOW to build data tables with ln-acme. For WHAT a data table must have → global ui/components/data-table.md.

## Components

### ln-data-table (UI)
- Attribute: `data-ln-data-table` on table container
- Pure UI — receives data via events, renders, emits user actions
- Virtual scroll, sticky header/footer, sort/filter/search UI

### ln-store (Data)
- Attribute: `data-ln-store` on a container element
- IndexedDB read/write, delta sync, optimistic mutations
- Stale-while-revalidate pattern

## Coordinator Wiring

```javascript
// Table requests data → coordinator queries store → feeds back
document.addEventListener('ln-data-table:request-data', function(e) {
    const store = document.querySelector('[data-ln-store]').lnStore;
    const data = store.query(e.detail.sort, e.detail.filters, e.detail.search);
    dispatch(e.target, 'ln-data-table:set-data', { rows: data });
});

// Store synced → refresh table
document.addEventListener('ln-store:synced', function(e) {
    // Re-query and feed to table
});
```

## SSR (Blade)

Blade renders ONLY the shell:
```html
<div data-ln-data-table>
    <div class="toolbar">
        <input data-ln-search placeholder="Search...">
        <a href="/items/create">+ Create</a>
    </div>
    <table>
        <thead>...</thead>
        <tbody><!-- skeleton rows, JS replaces --></tbody>
    </table>
    <footer><!-- count, aggregates --></footer>
</div>
```

## Delta Sync Response Format

```json
{
  "data": [
    { "id": 42, "title": "Updated doc", "updated_at": 1736952600 }
  ],
  "deleted": [17, 23],
  "synced_at": 1736953500
}
```

Server requirements: `updated_at` column, soft deletes, `?since=` parameter support.

## Events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `ln-data-table:request-data` | Table → Coordinator | Table needs data |
| `ln-data-table:set-data` | Coordinator → Table | Feed data to table |
| `ln-data-table:sort` | Table → Coordinator | Sort changed |
| `ln-data-table:filter` | Table → Coordinator | Filter changed |
| `ln-data-table:select` | Table → Coordinator | Row selection changed |
| `ln-store:synced` | Store → Coordinator | Background sync completed |
