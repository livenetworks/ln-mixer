# Modal

> A dialog overlay for decisions and short forms.

## Core Principle

A modal interrupts the user's flow. The interruption must be justified by the consequence weight. Use modal for decisions and focused input — use a page for complex workflows.

## Anatomy

- `<form>` is always the content root — no wrapper `<div>`
- Three zones: **header** (title + close), **body** (scrollable content), **footer** (actions)
- Close button: top-right, always present
- Footer: primary action right, cancel left. One primary per modal.
- Body scrolls independently — header and footer stay sticky

## Requirements

### Sizes
- Four sizes based on content needs: small (confirmation), medium (short form), large (multi-field form), extra-large (complex content)
- Size is a content decision, not aesthetic

### Behavior
- Backdrop dims page content — signals "page is suspended"
- `<form>` is root — all modal content is inside the form
- Cancel = `type="button"` to prevent submission
- ESC closes the modal
- Backdrop click does NOT close (prevents accidental dismiss)
- Focus trap: Tab cycles within modal only
- No nested modals — use inline confirmation instead

### Destructive Confirm
- Error color on confirm button
- Pre-focus on Cancel (not the destructive button)
- Title names the consequence: "Delete membership record" not "Are you sure?"
- Body states irreversibility only when truly permanent

### Inline Confirmation Alternative
- First click transforms button to confirm state in place
- Second click executes. Auto-reverts after timeout.
- Use for single-item deletes in lists — less overhead than modal

## Anti-Patterns
- Modal for content that could be a page
- Nested modals (modal on top of modal)
- Backdrop click closes (too easy to dismiss accidentally)
- "OK" / "Cancel" instead of descriptive labels
- Two primary buttons in one modal
- Full-viewport modal on desktop (that's a page)

> For implementation with ln-ashlar → see ln-ashlar components/modal.md
