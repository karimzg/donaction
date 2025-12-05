# Sponsorship Form Listeners

This module initializes event listeners for managing the state and behavior of the sponsorship form using an event bus system.

## File Overview
- **Purpose:** Listens to specific events to update form state and configuration dynamically.
- **Dependencies:**
    - `eventBus` (from `../../../utils/eventBus`)
    - `DEFAULT_VALUES`, `FORM_CONFIG`, and `isBeingFilled` (from `useSponsorshipForm.svelte`)

## Exports
### `initListeners`
**Type:** `function`

Initializes event listeners for managing sponsorship form updates.

#### Event Listeners

1. **`${EVENT_CONTEXT}populateForm`**
    - **Description:** Populates form fields with provided default values.
    - **Payload:** `data` (object of type `DEFAULT_VALUES_TYPE`)

   ```ts
   eventBus.on(`${EVENT_CONTEXT}populateForm`, (data: typeof DEFAULT_VALUES_TYPE) => {
       Object.keys(data).forEach((_) => {
           DEFAULT_VALUES[_] = data[_];
       });
   });
   ```

2. **`${EVENT_CONTEXT}editForm`**
    - **Description:** Updates donation-related configuration.
    - **Payload:** Object with:
        - `donatorUuid` (string | null)
        - `donUuid` (string | null)

   ```ts
   eventBus.on(`${EVENT_CONTEXT}editForm`, (data: { donatorUuid: string | null; donUuid: string | null }) => {
       FORM_CONFIG.donatorUuid = data.donatorUuid;
       FORM_CONFIG.donUuid = data.donUuid;
   });
   ```

3. **`${EVENT_CONTEXT}controlForm`**
    - **Description:** Controls the form state (e.g., whether it's actively being filled).
    - **Payload:** `data` (boolean)

   ```ts
   eventBus.on(`${EVENT_CONTEXT}controlForm`, (data: boolean) => {
       isBeingFilled.set(data);
   });
   ```

## Constants
### `EVENT_CONTEXT`
**Type:** `string`
- Prefix used for event names to ensure uniqueness.
- Default value: `'KLUBR_SPONSORSHIP_FORM_'`

## Usage
Ensure that `initListeners` is called during the initialization phase of the sponsorship form component to properly handle events.

```ts
import initListeners from './initListeners';

initListeners();
```

## Dependencies
- `eventBus` for event communication.
- State management relies on `DEFAULT_VALUES`, `FORM_CONFIG`, and `isBeingFilled` from `useSponsorshipForm.svelte`.

## Notes
- Ensure events dispatched match the `EVENT_CONTEXT` prefix.
- Proper validation of event payloads is recommended.

---
**Author:** _Klubr_
**Last Updated:** _02_January_2025_

---
**Related Files:**
- `useSponsorshipForm.svelte`
- `../../../utils/eventBus`
