# Tabs

> Switch between related views of the same entity without page navigation.

## Core Principle

Tabs organize content that shares a parent context but represents different facets. Each tab is a different VIEW of the same thing — not different THINGS.

## Requirements

### Structure
- Tab bar + content panels
- Content in DOM from start (no lazy loading) — switching is instant
- URL hash sync mandatory — each tab has a unique hash, bookmarkable
- Multiple tab groups per page supported via namespace

### Behavior
- Click tab → show panel, hide others
- URL hash updates on switch
- Page load reads hash → activates correct tab
- Badge counts on tabs (e.g., "Comments (5)")
- Active tab indicator (bar, fill, or color — per ui/visual-language.md §9)

### Responsive
- All tabs visible if space allows
- Horizontal scroll with overflow fade if tabs overflow
- Collapse to dropdown select if items > 5 at small container size

## Anti-Patterns
- Tabs with only one tab (just show the content)
- Lazy-loaded tab content (latency on every switch)
- No URL hash sync (user can't bookmark or share specific tab)
- Tabs for unrelated content (use navigation instead)

> For implementation with ln-ashlar → see ln-ashlar components/tabs.md
