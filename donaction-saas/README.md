# Klubr Web Components Global Documentation

# Sponsorship Form SAAS

This documentation provides an overview of the Sponsorship Form web-component, detailing its components, logic, and functionality. The web-comp is implemented using Svelte and involves state management, form validation, and integration with APIs.

## Table of Contents
1. [Components](#components)
2. [Logic and Utilities](#logic-and-utilities)
3. [State Management](#state-management)
4. [Validation](#validation)
5. [API Integration](#api-integration)
6. [Customization and Usage](#customization-and-usage)

---
https://drive.google.com/file/d/1pa-5abK5j3SZqg90r81atc5m3Am2WEZV/view?usp=drive_link
![Workflow](src/assets/docs/workflow-klubr-donation.drawio.png)

## Components

### Entry point
**File:** `sponsorshipForm/index.svelte`
- **Purpose:** Core custom web component managing the sponsorship form workflow.
- **Features:**
    - Dynamic form structure with navigation.
    - Slots for customizable content.
    - Error and loading animations.
- **Dependencies:**
    - `FormBanners`, `FormBody`, `FormNavigation`, `Breadcrumb`
    - `LottieAnimation` for animations.

---

## Logic and Utilities

### Listeners
**File:** `initListeners`
- **Purpose:** Manages event-based communication using `eventBus`.
- **Events:**
    - Populate form values.
    - Update form configurations.
    - Control form state.

### Initialization
**File:** `initComponent`
- **Purpose:** Initializes the form component, fetching necessary configurations and validating API tokens.
- **Key Functionality:**
    - Fetches data for Klubrs and projects.
    - Updates state objects (`SUBSCRIPTION` and `FORM_CONFIG`).

---

## State Management

### Stores
**File:** `useSponsorshipForm.svelte`
- **Purpose:** Manages reactive state for the form.
- **Key Variables:**
    - `isBeingFilled`: Tracks if the form is active.
    - `isLoading`: Indicates if a process is in progress.
    - `index`: Tracks the current form step.
- **Defaults:**
    - `DEFAULT_VALUES`: Provides default values for form fields.
    - `defVals`: A frozen object of default field values.

---

## Validation

### Validation Utilities
**File:** `validator`
- **Purpose:** Ensures data integrity through field-specific validations.
- **Features:**
    - Validates email, dates, amounts, and SIREN numbers.
    - Provides a Svelte directive for real-time validation.
- **Regular Expressions:**
    - `emailRegExp`, `sirenRegExp`, `stringRegExp`.
- **Key Functions:**
    - `validateAmount`, `validateSiren`, `validateEmail`, `validateRequired`.

---

## API Integration

### Submission Logic
**File:** `submit`
- **Purpose:** Manages donation and donator creation processes.
- **Functions:**
    - `handleSubmitStepTwo`: Coordinates donation and donator creation.
    - `createDonation`: Handles donation creation.
    - `createDonator`: Manages donator data and logo uploads.
    - `updateKlubrDonStatus`: Updates donation statuses.
- **Dependencies:**
    - `createReCaptchaToken`, `putPostDon`, `putPostDonator`.

---

## Customization and Usage

### Slots
**File:** `entry point (index.svelte)`
- **Purpose:** Allows integration with external CGU content and injecting stripe form in the dom.
- **Slots:**
    - `stripe-payment-form`
    - `c-g-u`

### Environment Variables
- **Google reCAPTCHA Key:** Ensure `VITE_GOOGLE_RECAPTCHA_SITE_KEY` is configured.

---

## Notes
- Proper validation and error handling are crucial.
- Ensure the required scripts and styles are included for smooth functionality.

---
**Author:** _Klubr_
**Last Updated:** _02_January_2025_

---
**Related Files:**
- `useSponsorshipForm.svelte`
- `initListeners`
- `initComponent`
- `validator`
- `submit`

v1
