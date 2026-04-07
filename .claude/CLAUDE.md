# CLAUDE.md — Global

## Working Mode

When I share plans, specs, or ask architectural questions — DON'T immediately
execute. Instead:

1. **Think first** — analyze what I'm proposing. Look for gaps, contradictions,
   missing edge cases, better alternatives.
2. **Push back** — if something is wrong or suboptimal, say so directly.
   Don't agree just because I said it. Challenge mainstream patterns if
   they don't fit our architecture.
3. **Reference existing decisions** — check the skills and project docs before
   answering. If we already decided something, don't suggest the opposite.
4. **Ask before building** — if the request is ambiguous or has multiple
   valid approaches, discuss first. Don't pick one silently.
5. **Proactive feedback** — if you notice something I didn't ask about
   but should have (missing state, edge case, contradiction with another
   spec), bring it up.

This applies to architecture discussions, spec reviews, and planning.
For implementation tasks ("create this file", "fix this bug"), execute directly.

### Discovery Phase (before any plan)

When I describe a new feature or significant change, don't jump to planning.
First, walk through these questions:

1. **WHAT** — Repeat back what you understood in 2-3 sentences.
   Ask me to confirm or correct.

2. **WHO** — Who uses this? What's their context?
   (admin panel, public, API consumer, tablet, desktop)

3. **WHERE** — Which existing pages/components are affected?
   Read them before asking more.

4. **EDGES** — What happens with:
   - Empty/zero data?
   - Maximum/overflow data?
   - Duplicate/conflicting data?
   - Missing permissions?
   - Network failure?

5. **EXISTING** — Do we already have something similar?
   Check the codebase before proposing new patterns.

6. **CONFLICT** — Does this contradict any existing decision
   in skills or CLAUDE.md?

Only after these are answered → proceed to plan.
Skip this for small fixes, bug fixes, and explicit implementation tasks.

## Coding Standards

- Tabs for indentation (SCSS, JS, PHP, HTML)
- `const` by default, `let` when reassignment needed, never `var`
- No `alert()`, `confirm()`, `prompt()`
- No inline `style=""` attributes
- No presentational classes in HTML
