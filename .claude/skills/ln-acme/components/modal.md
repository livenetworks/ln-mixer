# ln-acme — Modal Implementation

> HOW to build modals with ln-acme. For WHAT a modal must have → global ui/components/modal.md.

## Component

- Attribute: `data-ln-modal` on modal element (value = state: "open"/"close")
- Trigger: `data-ln-modal-for="id"` on trigger button
- Close: `data-ln-modal-close` on close/cancel buttons
- API: `el.lnModal.open()` / `.close()` — just set the attribute
- Direct attribute: `el.setAttribute('data-ln-modal', 'open')` — identical result
- ESC listener active only while modal is open

## HTML Pattern

```html
<button data-ln-modal-for="my-modal">Open</button>

<div class="ln-modal" data-ln-modal id="my-modal">
    <form>
        <header>
            <h3>Title</h3>
            <button type="button" aria-label="Close" data-ln-modal-close>
                <svg class="ln-icon" aria-hidden="true"><use href="#ln-x"></use></svg>
            </button>
        </header>
        <main>...</main>
        <footer>
            <button type="button" data-ln-modal-close>Cancel</button>
            <button type="submit">Save</button>
        </footer>
    </form>
</div>
```

## SCSS Sizes

```scss
#my-modal > form { @include modal-lg; }
```

| Mixin | Width |
|-------|-------|
| `modal-sm` | 28rem |
| `modal-md` | 32rem |
| `modal-lg` | 42rem |
| `modal-xl` | 48rem |

## Events

| Event | When |
|-------|------|
| `ln-modal:before-open` | Before opening (cancelable) |
| `ln-modal:open` | After opened |
| `ln-modal:before-close` | Before closing (cancelable) |
| `ln-modal:close` | After closed |

## Rules
- `<form>` is the content root — select via `.ln-modal > form`
- Cancel needs `type="button"` to prevent form submission
- No `.ln-modal__content` class — semantic selectors only
- Sizes via SCSS mixins on `#id > form`, not CSS classes
