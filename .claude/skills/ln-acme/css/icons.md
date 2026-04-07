# ln-acme — Icon System

> SVG sprite injection via `ln-icons.js`. For icon consistency principles → global ui/visual-language.md §3.

---

## How It Works

`ln-icons.js` builds a hidden `<svg>` sprite from `js/ln-icons/icons/*.svg` and inserts it into `<body>` at init. Icons render via `<use href="#ln-{name}">` and inherit `currentColor`.

## Markup

```html
<!-- Standalone icon -->
<svg class="ln-icon" aria-hidden="true"><use href="#ln-plus"></use></svg>

<!-- Icon in button with text -->
<button>
    <svg class="ln-icon" aria-hidden="true"><use href="#ln-plus"></use></svg>
    Add
</button>

<!-- Icon-only button — aria-label required -->
<button aria-label="Close">
    <svg class="ln-icon" aria-hidden="true"><use href="#ln-x"></use></svg>
</button>

<!-- Accordion chevron (CSS rotates on open) -->
<header data-ln-toggle-for="panel1">
    Title
    <svg class="ln-icon ln-chevron" aria-hidden="true"><use href="#ln-arrow-down"></use></svg>
</header>
```

## Two Prefixes

- `#ln-{name}` — Tabler icons (bundled in sprite)
- `#lnc-{name}` — Custom CDN icons (served from `window.LN_ICONS_CUSTOM_CDN`)

## Available Icons

Any icon from [Tabler Icons](https://tabler.io/icons). Common ones:
`home` `x` `menu` `users` `settings` `logout` `books`
`plus` `edit` `trash` `eye` `device-floppy` `search` `check` `copy` `link` `filter` `calendar`
`upload` `download` `refresh` `printer` `lock` `star` `arrow-up` `arrow-down` `arrows-sort`
`chart-bar` `clock` `mail` `book` `world` `list` `box` `building` `alert-triangle`
`info-circle` `circle-x` `circle-check` `user` `phone` `square-compass` `file`

Full list: `scss/tabler-icons.txt`

Custom icons: `lnc-file-pdf` `lnc-file-doc` `lnc-file-epub`

## Sizes

| Class | Size |
|-------|------|
| `ln-icon--sm` | 1rem |
| (default) | 1.25rem |
| `ln-icon--lg` | 1.5rem |
| `ln-icon--xl` | 4rem |

## Color

Icons inherit parent's `color` property automatically. No color properties needed in SCSS.
Exception: custom icons (`lnc-file-pdf`, etc.) have embedded semantic stroke colors.

## Adding a Custom Icon

1. Add SVG to `js/ln-icons/icons/{name}.svg`
2. Run `npm run build`
3. Upload `dist/icons/{name}.svg` to custom CDN
4. Use as `#lnc-{name}`

## Close Buttons

Always use `@mixin close-button` — resets padding to 0, sets 2rem fixed size.

## Pseudo-Element Awareness

- `::before` / `::after` may be occupied by existing component styles — NEVER override for loading/overlay effects
- For overlays: use `box-shadow: inset 0 0 0 9999px rgba(...)` instead
- For spinners: inject a real DOM `<span>` via JS, not pseudo-elements
