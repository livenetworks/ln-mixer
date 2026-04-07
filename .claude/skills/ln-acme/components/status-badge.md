# ln-acme — Status Badge Implementation

> For WHAT a badge must have → global ui/components/status-badge.md.

## SCSS

```scss
.status { @include badge; }
```

Color via CSS variable override on parent or element.

## Actionable Badge

Combine with `data-ln-confirm` or `data-ln-dropdown` for actionable status changes.
