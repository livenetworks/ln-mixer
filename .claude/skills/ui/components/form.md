# Form

> The primary component for data input — create, edit, and configure.

## Core Principle

A form is a conversation: the system asks questions (labels), the user answers (inputs), and the system gives instant feedback (validation). Every field validates on keyup from the first keystroke. Error space is always reserved — no layout shifts.

## Anatomy

```
┌─────────────────────────────────────────────────────────────────┐
│ <form>                                                          │
│  ┌────────────────────────┐ ┌────────────────────────────────┐  │
│  │ Name *                 │ │ Surname *                      │  │
│  │ ┌────────────────────┐ │ │ ┌────────────────────────────┐ │  │
│  │ │ input              │ │ │ │ input                      │ │  │
│  │ └────────────────────┘ │ │ └────────────────────────────┘ │  │
│  │ (reserved error space) │ │ (reserved error space)         │  │
│  └────────────────────────┘ └────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ • Cancel                                    • Save (dis) │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Requirements

### Layout
- CSS Grid, multi-column (6 columns recommended, adjustable per project)
- Column spans communicate expected input width
- Grid spans in SCSS — never inline styles or width classes

### Two Components Required
- **Validator (per field):** Validates single input on keyup via native HTML ValidityState. Shows/hides error messages. Works standalone.
- **Form coordinator (per form):** Manages lifecycle — fill (edit mode), track child validity, enable/disable submit, serialize on submit.
- **Auto-submit variant:** For search/filter forms. Submits on any input change with debounce.

### Validation
- Rules from native HTML attributes (`required`, `type="email"`, `minlength`, `pattern`) — zero JS config
- Error messages pre-rendered in HTML by backend (multilanguage ready) — zero display text in JS
- Custom validation (password match, uniqueness) via coordinator events

### Modal vs Page
- **Modal:** Flat form, single entity, no conditional logic, no tabs
- **Page:** Conditional fields, tabs/sections, multi-entity, file uploads

### Behavior
- Keyup validation from first keystroke
- Reserved error space below every field (no layout shift)
- Untouched required fields start clean — error only after first interaction
- Submit disabled until all fields valid
- Submit button shows loading state during request
- Success = navigate away + toast. Never show success on the form itself.
- Preserve input on server error — never clear the form

### Fill (Edit Mode)
- Coordinator populates inputs by name attribute from data source
- Form doesn't know or care about data origin

## Anti-Patterns
- Validate on blur only / on submit only
- Clear form on error
- Generic "Form is invalid" instead of per-field errors
- Submit always enabled with re-validate on click
- Modal for complex forms (use page)
- Layout shift on error
- Validation rules in JS config instead of HTML attributes
- Error text hardcoded in JS instead of HTML

> For implementation with ln-acme → see ln-acme components/form.md
