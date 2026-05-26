# Empty State

> What the user sees when there is no data to display.

## Core Principle

Two distinct types — using the wrong one confuses users.

### Type 1: No Data Exists
The resource has never been created. This is an onboarding moment.
- Heading: "No employees yet"
- Message: "Add your first employee to get started"
- CTA: [+ Add Employee] (primary action)

### Type 2: Query Returned Zero
Data exists, but current search/filter shows nothing.
- Heading: "No results" or "No matching employees"
- Message: "Try different search terms" or "No employees match the selected filters"
- CTA: [Clear Search] or [Clear Filters]

## Rules
- Never show blank area — always one of these two types
- CTA matches the cause (search empty → clear search, filter empty → clear filters)
- Type 1 appears only once — after first item created, never again
- Empty state must never be visually heavier than the populated state

> For implementation with ln-ashlar → see ln-ashlar components/empty-state.md
