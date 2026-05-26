# ln-ashlar — Tabs Implementation

> HOW to build tabs with ln-ashlar. For WHAT tabs must have → global ui/components/tabs.md.

## Component

- Attribute: `data-ln-tabs` on tab container
- Tab buttons: `data-ln-tabs-tab="panel-id"`
- Tab panels: `data-ln-tabs-panel="panel-id"`
- URL hash sync: automatic

## HTML Pattern

```html
<div data-ln-tabs>
    <nav>
        <button data-ln-tabs-tab="general">General</button>
        <button data-ln-tabs-tab="permissions">Permissions (5)</button>
        <button data-ln-tabs-tab="history">History</button>
    </nav>
    <section data-ln-tabs-panel="general">...</section>
    <section data-ln-tabs-panel="permissions">...</section>
    <section data-ln-tabs-panel="history">...</section>
</div>
```

## SCSS

```scss
[data-ln-tabs] nav { @include tabs-nav; }
[data-ln-tabs] [data-ln-tabs-tab] { @include tabs-tab; }
[data-ln-tabs] [data-ln-tabs-tab].active { @include tabs-tab-active; }
```

## Events

| Event | When |
|-------|------|
| `ln-tabs:change` | Tab switched. Detail: `{ tab, panel }` |
