# Sponsorship Form Submission

This module manages the logic for handling form submission, donation creation, donator creation, logo uploads, and updating donation statuses.

## File Overview
- **Purpose:** Handles the second step of the sponsorship form submission process.
- **Dependencies:**
    - `DEFAULT_VALUES`, `index`, `FORM_CONFIG` (from `./useSponsorshipForm.svelte`)
    - `createReCaptchaToken`, `putPostDon`, `putPostDonator`, `uploadCompanyLogo` (from `./api`)

## Functions

### `handleSubmitStepTwo`
**Type:** `async function`

Orchestrates the donation and donator creation processes.

#### Workflow
1. Cleans the `DEFAULT_VALUES` based on the `estOrganisme` flag.
2. Calls `createDonation` and `createDonator` functions.

#### Returns
- `createDonationRes` — Result from the donation creation.
- `createDonatorRes` — Result from the donator creation.

---

### `createDonation`
**Type:** `async function`

Handles donation creation with reCAPTCHA token validation.

#### Workflow
1. Generates a reCAPTCHA token.
2. Prepares the request payload.
3. Calls `putPostDon` to create or update the donation.

#### Parameters
- `temp` (*object*): Form data.

#### Returns
- Donation creation result.

#### Error Handling
- Logs errors during token creation or API requests.

---

### `createDonator`
**Type:** `async function`

Handles donator creation.

#### Workflow
1. Prepares the donator payload.
2. Calls `putPostDonator` to create or update the donator.
3. Uploads the company logo if applicable.

#### Parameters
- `temp` (*object*): Form data.

#### Returns
- Donator creation result.

#### Error Handling
- Logs and rejects errors during donator creation.

---

### `uploadProLogo`
**Type:** `async function`

Uploads the company logo if it exists and meets requirements.

#### Parameters
- `temp` (*object*): Form data.

#### Returns
- `true` when successful.

#### Workflow
1. Validates the logo.
2. Uploads using `uploadCompanyLogo` API.

---

### `updateKlubrDonStatus`
**Type:** `async function`

Updates the payment status of a KlubDon.

#### Parameters
- `status` (*StatusPayment*): Payment status (`'notDone' | 'pending' | 'success' | 'error'`).
- `paymentDate` (*Date*): Optional payment date.
- `uuid` (*string*): Donation UUID.

#### Returns
- Updated donation data.

#### Workflow
1. Generates a reCAPTCHA token.
2. Updates donation status via `putPostDon`.

#### Error Handling
- Logs errors during status updates.

---

## Types

**`StatusPayment`**
- `'notDone'`
- `'pending'`
- `'success'`
- `'error'`

## Exports
- `handleSubmitStepTwo`
- `updateKlubrDonStatus`

## Notes
- Ensure API endpoints are correctly configured.
- Validate reCAPTCHA tokens before making requests.

---
**Author:** _Klubr_
**Last Updated:** _02_January_2025_

**Related Files:**
- `./useSponsorshipForm.svelte`
- `./api`
