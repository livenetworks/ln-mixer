# ln-acme — Form Implementation

> HOW to build forms with ln-acme. For WHAT a form must have → global ui/components/form.md.

## Components

### ln-validate (per field)

- Attribute: `data-ln-validate` on `<input>`
- Validates on keyup using native `input.validity` (ValidityState)
- Shows/hides matching `<li data-ln-validate-error="...">` elements
- Emits: `ln-validate:valid` / `ln-validate:invalid`

### ln-form (per form)

- Attribute: `data-ln-form` on `<form>`
- Listens: `ln-validate:valid/invalid` from child fields
- Tracks all-valid state → enables/disables submit button
- Fill: receives data object, populates inputs by `name` attribute
- Submit: `preventDefault`, emits `ln-form:submit` with serialized data
- Auto-submit: `data-ln-form-auto` — submits on any input change
- Debounce: `data-ln-form-debounce="300"`

## Validation Rules → HTML Attributes

| HTML attribute | ValidityState | `data-ln-validate-error` value |
|---|---|---|
| `required` | `valueMissing` | `required` |
| `type="email"` | `typeMismatch` | `typeMismatch` |
| `minlength` | `tooShort` | `tooShort` |
| `maxlength` | `tooLong` | `tooLong` |
| `pattern` | `patternMismatch` | `patternMismatch` |
| `min` / `max` | `rangeUnderflow/Overflow` | `rangeUnderflow` / `rangeOverflow` |

## HTML Pattern

```html
<form id="my-form" data-ln-form>
  <div class="form-element">
    <label for="email">Email</label>
    <input id="email" name="email" type="email" required data-ln-validate>
    <ul data-ln-validate-errors>
      <li data-ln-validate-error="required">Полето е задолжително</li>
      <li data-ln-validate-error="typeMismatch">Невалиден е-маил формат</li>
    </ul>
  </div>

  <div class="form-actions">
    <button type="button">Cancel</button>
    <button type="submit">Save</button>
  </div>
</form>
```

## SCSS

```scss
#my-form {
    @include form-grid;
    .form-element { grid-column: span 3; }
    .form-element:has([name="notes"]) { grid-column: span 6; }
    .form-actions { grid-column: span 6; }
}
```

## Auto-Submit (Search/Filter)

```html
<form action="/search" method="get" data-ln-form-auto data-ln-form-debounce="300">
    <input name="q" type="search" placeholder="Search...">
</form>
```

## Custom Validation

```javascript
// Coordinator sets custom error
dispatch(input, 'ln-validate:set-custom', { error: 'emailTaken' });
// Coordinator clears custom error
dispatch(input, 'ln-validate:clear-custom');
```

## Coordinator Wiring

```javascript
document.addEventListener('ln-form:submit', function(e) {
    const formData = e.detail;
    dispatch(e.target, 'ln-http:request', {
        url: '/api/users',
        method: 'POST',
        body: formData,
        tag: 'create-user'
    });
});
```

## Autosave

`ln-autosave` is separate and independent. If present on same `<form>`, works alongside `ln-form` without coordination.
