# ln-acme — KPI Card Implementation

> For WHAT KPI cards must have → global ui/components/kpi-card.md.

## SCSS

```scss
#stats ul { @include grid-4; list-style: none; @include p(0); @include m(0); }
#stats li { @include card; @include p(1rem); }
#stats h3 { @include text-sm; @include text-secondary; margin: 0; }
#stats strong { @include text-2xl; @include font-bold; @include block; }
```

## HTML

```html
<ul id="stats">
    <li>
        <h3>Employees</h3>
        <strong>42</strong>
        <small>▲ 12% vs last month</small>
    </li>
</ul>
```

Clickable cards: wrap `<li>` content in `<a>` linking to detail/list page.
