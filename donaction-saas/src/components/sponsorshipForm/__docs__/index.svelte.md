# Sponsorship Form Component

This Svelte component serves as a customizable sponsorship form, handling donation workflows, integration with APIs, and dynamic UI updates.

## File Overview
- **Purpose:** Provides a sponsorship form with donation and donator creation functionalities.
- **Dependencies:**
    - Form logic from `./logic/useSponsorshipForm.svelte`
    - Initialization logic from `./logic/initComponent`
    - Event handling via `../../utils/eventBus`
    - UI Components: `FormBanners`, `FormBody`, `FormNavigation`, `Breadcrumb`
    - Animation: `LottieAnimation`

## Props
- `klubrUuid` (*string*, optional): Unique identifier for the Klubr.
- `projectUuid` (*string*, optional): Unique identifier for the project.

## State Management
- `SCRIPT_LOADED`: Tracks the script loading state (`'loading'`, `'loaded'`, `'error'`).
- `$isBeingFilled`: Tracks if the form is actively being filled.
- `$isCguShown`: Determines if the CGU (terms and conditions) are displayed.
- `$index`: Tracks the current step index in the form.

## Lifecycle
### `onMount`
1. Initializes the `eventBus` and `initListeners`.
2. Dispatches the `LOADED` event.
3. Calls `initComponent` with `klubrUuid` and `projectUuid`.
4. Updates `SCRIPT_LOADED` based on success or error.

## UI Structure
### Loading States
- **Loading Animation:** Displays a loader animation.
- **Error Animation:** Displays an error animation.

### Main Form
- **Breadcrumb:** Navigation breadcrumbs.
- **FormBody:** Handles form fields and slots (`stripe-payment-form`, `c-g-u`).
- **FormNavigation:** Handles navigation buttons.
- **FormBanners:** Dynamic banners based on Klubr branding colors.

## Slots
- `stripe-payment-form`: Slot for payment form integration.
- `c-g-u`: Slot for CGU content.

## Script Tag
A Google reCAPTCHA script is dynamically included:
```html
<script
  defer
  async
  src="https://www.google.com/recaptcha/enterprise.js?render=VITE_GOOGLE_RECAPTCHA_SITE_KEY">
</script>
```

## CSS
- Scoped SCSS for component styling.
- Imports global styles from `../../styles/main`.

## Events
- `LOADED`: Dispatched when the component successfully initializes.

## Error Handling
- Displays an error animation when `SCRIPT_LOADED` equals `'error'`.
- Logs errors encountered during initialization.

## Exports
- `klubr-sponsorship-form` (Custom Element)

## Notes
- Ensure `VITE_GOOGLE_RECAPTCHA_SITE_KEY` is correctly set in the environment variables.
- Custom slots allow flexible UI integration.

---
**Author:** _Klubr_
**Last Updated:** _02_January_2025_

**Related Files:**
- `./logic/useSponsorshipForm.svelte`
- `./logic/initComponent`
- `../../utils/eventBus`
