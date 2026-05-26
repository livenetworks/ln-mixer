# KPI Card

> A single key metric displayed prominently on a dashboard.

## Core Principle

One metric per card. The number is the answer — label and trend are context.

## Anatomy

```
┌──────────────────────┐
│ Employees            │ ← Label (small, muted)
│ 42                   │ ← Value (large, bold)
│ ▲ 12% vs last month  │ ← Trend (optional)
└──────────────────────┘
```

## Requirements
- One primary metric per card — never two numbers competing
- Clickable → navigates to list/detail view for that metric
- Trend indicator (up/down arrow + percentage) when comparison data available
- 3-5 cards per dashboard maximum (if everything is key, nothing is)
- Label is the heading (`<h3>`), value is `<strong>` — not the other way around

## Anti-Patterns
- More than 5 KPI cards on one dashboard
- Two numbers in one card
- KPI card without click-through to detail
- Number as heading (`<h2>42</h2>`)

> For implementation with ln-ashlar → see ln-ashlar components/kpi-card.md
