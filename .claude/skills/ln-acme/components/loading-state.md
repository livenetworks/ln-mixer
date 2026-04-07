# ln-acme — Loading State Implementation

> For WHAT loading states must have → global ui/components/loading-state.md.

## Spinner

```scss
.my-spinner { @include loader; }
```

## Shimmer

```html
<div class="ln-skeleton">...</div>
```

Uses `ln-shimmer` keyframe animation. See css/visual-rules.md for implementation.

## Button Loading

Coordinator toggles `aria-busy="true"` and `disabled` on submit button during request.
