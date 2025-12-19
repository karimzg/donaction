# Sponsorship Form Initialization

This module provides functionality to initialize the sponsorship form by fetching necessary configurations and validating API tokens.

## File Overview
- **Purpose:** Handles the initialization of the sponsorship form by verifying API tokens and retrieving relevant data.
- **Dependencies:**
    - `Fetch` (from `../../../utils/fetch`)
    - `FORM_CONFIG` and `SUBSCRIPTION` (from `useSponsorshipForm.svelte`)

## Exports

### `initComponent`
**Type:** `async function`

Initializes the sponsorship form component by performing the following steps:
1. Retrieves the API token from the script URL.
2. Validates the token and fetches necessary configuration data from the backend.
3. Populates `SUBSCRIPTION` and `FORM_CONFIG` objects with the fetched data.

#### Parameters
- `klubrUuid` (*string?*): Optional UUID of the Klubr.
- `projectUuid` (*string?*): Optional UUID of the project.

#### Usage Example
```ts
import { initComponent } from './initComponent';

initComponent('klubr-uuid-example', 'project-uuid-example')
  .then(() => console.log('Initialization successful'))
  .catch((error) => console.error('Initialization failed', error));
```

#### Process Flow
1. **API Token Retrieval:**
    - Searches for the API token in the script tag (`/KlubrTest.iife.js`).
    - Throws an error if no token is found.

2. **API Call:**
    - Sends a `POST` request to `/api/klubr-subscriptions/decrypt`.
    - Payload includes `apiToken`, `klubrUuid`, and `projectUuid`.

3. **State Updates:**
    - Updates `SUBSCRIPTION.token`, `SUBSCRIPTION.klubr`, and `SUBSCRIPTION.project`.
    - Updates `FORM_CONFIG.clubUuid` and `FORM_CONFIG.projectUuid`.

#### Example API Payload
```json
{
  "apiToken": "your-api-token",
  "klubrUuid": "klubr-uuid",
  "projectUuid": "project-uuid"
}
```

### Error Handling
- Rejects the promise with an error if:
    - The API token is missing.
    - The API call fails.

## Dependencies
- `Fetch` utility for API communication.
- State management via `FORM_CONFIG` and `SUBSCRIPTION`.

## Notes
- Ensure the script (`/KlubrTest.iife.js`) is correctly loaded on the page.
- Validate API responses to handle edge cases.

---
**Author:** _Klubr_
**Last Updated:** _02_January_2025_

---
**Related Files:**
- `useSponsorshipForm.svelte`
- `../../../utils/fetch`
