# Sponsorship Form Store

This module manages the state, default values, and form submission logic for the sponsorship form.

## File Overview
- **Purpose:** Provides state management, default form values, and submission handling.
- **Dependencies:**
    - `svelte/store` for reactive state management.
    - `tick` from Svelte for DOM updates.
    - `handleSubmitStepTwo` (from `./submit`).
    - `dispatchToast` (from `./toaster`).
    - `eventBus` (from `../../../utils/eventBus`).
    - `EVENT_CONTEXT` (from `./initListeners`).

## State Variables

### Writable Stores

- **`isBeingFilled`** (`boolean`) — Tracks whether the form is actively being filled.
- **`isLoading`** (`boolean`) — Tracks if the form submission is in progress.
- **`index`** (`number`) — Tracks the current step of the form.
- **`triggerValidation`** (`number`) — Triggers validation checks.
- **`isCguShown`** (`boolean`) — Tracks whether CGU (terms and conditions) are displayed.

### Subscription State

**`SUBSCRIPTION`**
- **token:** `string | null`
- **klubr:** `string | null`
- **project:** `string | null`

**`FORM_CONFIG`**
- **donatorUuid:** `string | null`
- **donUuid:** `string | null`
- **clubUuid:** `string | null`
- **projectUuid:** `string | null`

### Default Values
**`defVals`** (Frozen Object)
- Provides initial default values for the form fields (e.g., `firstName`, `email`, `country`, etc.).

**`DEFAULT_VALUES`**
- Reactive copy of `defVals`.

## Functions

### `submitForm`
**Type:** `async function`

Handles form submission logic and validation.

#### Parameters
- `acc` (*number*): Controls the step index increment.

#### Workflow
1. Validates the form fields.
2. Checks for any error messages in the DOM.
3. If no errors exist:
    - If on step 2, calls `handleSubmitStepTwo`.
    - Emits the `klubDonResult` event via `eventBus`.
4. Updates the `index` store to proceed to the next step.

#### Usage Example
```ts
await submitForm(1);
```

### Error Handling
- Logs errors to the console.
- Displays toast messages using `dispatchToast`.

## Exports
- `index`
- `submitForm`
- `defVals`
- `triggerValidation`
- `isBeingFilled`
- `isCguShown`
- `DEFAULT_VALUES`
- `isLoading`
- `FORM_CONFIG`
- `SUBSCRIPTION`

## Notes
- Ensure proper validation of dynamic form fields.
- Handle edge cases during form submission.

---
**Author:** _Klubr_
**Last Updated:** _02_January_2025_

---
**Related Files:**
- `./submit`
- `./toaster`
- `./initListeners`
- `../../../utils/eventBus`
