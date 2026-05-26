# ln-ashlar — Search Implementation

> HOW to build search with ln-ashlar. For WHAT search must have → global ui/components/search.md.

## Client-Side Search

- Attribute: `data-ln-search` on input
- Filters DOM children on every keyup (instant, no debounce)
- Emits: `ln-search:change` (cancelable)
- Clear button auto-appears when input has text

## Server-Side Search

Use `data-ln-form-auto` with `data-ln-form-debounce`:

```html
<form action="/search" method="get" data-ln-form-auto data-ln-form-debounce="300">
    <input name="q" type="search" data-ln-search placeholder="Search...">
</form>
```
