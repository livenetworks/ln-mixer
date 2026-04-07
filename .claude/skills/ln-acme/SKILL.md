---
name: ln-acme
description: "Implementation reference for the ln-acme frontend library. Use this skill when working on a project that uses ln-acme for CSS/JS. Covers: SCSS mixins and token values, JS component boilerplate, ln-core helpers API, icon system, naming conventions, and component-specific implementation patterns."
---

# ln-acme — Implementation Reference

> This skill covers HOW to build with ln-acme.
> For WHY and WHAT decisions → see global skills (css, js, html, ui, ux).

---

## What is ln-acme?

Unified frontend library: **SCSS CSS framework** + **vanilla JS components**. Zero dependencies. Used in Laravel projects via npm or git submodule.

## Architecture

```
SCSS: tokens → mixins → components
  scss/config/_tokens.scss     → :root CSS variables
  scss/config/mixins/_*.scss   → @mixin recipes
  scss/components/_*.scss      → Applied to default selectors

JS: IIFE components + ln-core helpers
  js/ln-core/                  → Shared helpers (fill, renderList, reactive)
  js/ln-{name}/                → Self-contained IIFE component
```

## Build

```bash
npm run build    # dist/ln-acme.css + .js + .iife.js
npm run dev      # Watch mode
```

## Sub-Skills

| File | Content |
|------|---------|
| `css/mixins.md` | Complete mixin reference with examples |
| `css/tokens.md` | Token values (colors, spacing, radii, shadows) |
| `css/icons.md` | SVG sprite system, Tabler icons, custom icons |
| `css/visual-rules.md` | ln-acme specific visual rules (§1-§8 implementation) |
| `js/component-template.md` | Full IIFE boilerplate for new components |
| `js/naming.md` | `data-ln-*`, `window.ln*`, event naming conventions |
| `js/ln-core-api.md` | fill, renderList, cloneTemplate, reactive, batcher API |

## Quick Reference

### CSS — Key Patterns

```scss
// Project integration
@use 'ln-acme/scss/ln-acme';       // full framework
@use 'scss/overrides';              // project tokens
@use 'scss/components/feature';     // project components

// Mixin on semantic selector
#add-user { @include btn; }
#users article { @include card; }

// Color override via token
#delete-user { --color-primary: var(--color-error); }

// Form grid (6 columns)
#my-form { @include form-grid; }
#my-form .form-element { grid-column: span 3; }

// Container query
#folders { @include container(foldersgrid); }
```

### JS — Key Patterns

```javascript
// Import helpers from ln-core
import { dispatch, fill, renderList, cloneTemplate } from '../ln-core';
import { deepReactive, createBatcher } from '../ln-core';

// Event communication
dispatch(element, 'ln-modal:open', { id: modalId });

// Declarative DOM binding
fill(el, { name: user.name, email: user.email });

// Keyed list rendering
renderList(container, items, 'template-name', keyFn, fillFn, 'ln-component');
```

### HTML — Key Patterns

```html
<!-- Icon (SVG sprite) -->
<svg class="ln-icon" aria-hidden="true"><use href="#ln-plus"></use></svg>

<!-- Modal -->
<div class="ln-modal" data-ln-modal id="my-modal">
    <form>
        <header><h3>Title</h3><button type="button" aria-label="Close" data-ln-modal-close>...</button></header>
        <main>...</main>
        <footer><button type="button" data-ln-modal-close>Cancel</button><button type="submit">Save</button></footer>
    </form>
</div>

<!-- Accordion -->
<ul data-ln-accordion>
    <li>
        <header data-ln-toggle-for="panel1">Title</header>
        <main id="panel1" data-ln-toggle class="collapsible">
            <section class="collapsible-body">...</section>
        </main>
    </li>
</ul>
```
