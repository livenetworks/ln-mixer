# Search

> Instant filtering of visible data.

## Core Principle

Two distinct search types. Never mix them.

**Client-side search:** Data is in local cache/DOM. Filter on every keyup — instant, no debounce. Used within data tables and lists.

**Server-side search:** Data too large to cache locally. Form auto-submits with debounce. Results replace page content via AJAX.

## Requirements
- Clear button (✕) visible when input has text
- Preserve search term on back-navigation
- Keyboard shortcut: `/` to focus (when no input is active)
- Scope indicator if search covers specific columns
- Empty state distinguishes "no data exists" vs "search returned zero"

## Anti-Patterns
- Debounce on client-side search (data is local, filter is synchronous)
- Same empty state for "no data" and "no results"
- Search without clear button

> For implementation with ln-acme → see ln-acme components/search.md
