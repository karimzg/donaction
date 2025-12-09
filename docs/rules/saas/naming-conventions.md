---
name: naming-conventions
description: Naming conventions for donaction-saas (Svelte 5 Web Components)
argument-hint: N/A
---

# Naming Conventions - SaaS Web Components

## Files

- **Convention**: Mixed - kebab-case for directories, PascalCase for Svelte components
- **Examples**:
  - Directories: `sponsorshipForm/`, `formBanner/`, `videoPlayer/`
  - Svelte components: `index.svelte`, `FormBanner.svelte`
  - TypeScript: `api.ts`, `stripe.ts`, `validator.ts`
  - Tests: `initComponent.test.ts`

## Components

- **Convention**: PascalCase
- **Examples**:
  - `FormBanner`
  - `FormNavigation`
  - `VideoPlayer`
  - `Breadcrumb`

## Functions

- **Convention**: camelCase
- **Examples**:
  - `submitForm()`
  - `initComponent()`
  - `createReCaptchaToken()`
  - `validateEmail()`

## Variables

- **Convention**: camelCase
- **Examples**:
  - `isSubmitted`
  - `formConfig`
  - `defaultValues`
  - `triggerValidation`

## Constants

- **Convention**: SCREAMING_SNAKE_CASE
- **Examples**:
  - `DEFAULT_VALUES`
  - `FORM_CONFIG`
  - `API_BASE_URL`
  - `RECAPTCHA_SITE_KEY`

## Types/Interfaces

- **Convention**: PascalCase
- **Examples**:
  - `User`
  - `Klubr`
  - `FetchOptions`
  - `ValidationResult`
