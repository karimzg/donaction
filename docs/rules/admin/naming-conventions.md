---
name: naming-conventions
description: Naming conventions for donaction-admin (Angular 19)
argument-hint: N/A
---

# Naming Conventions - Admin Dashboard

## Files

- **Convention**: kebab-case with suffix
- **Examples**:
  - `auth.service.ts`
  - `login.component.ts`
  - `user.guard.ts`
  - `form-control.pipe.ts`
  - `auth.interceptor.ts`

## Components

- **Convention**: PascalCase
- **Examples**:
  - `LoginComponent`
  - `HeaderComponent`
  - `ErrorDisplayComponent`
  - `GenericUpdateComponent`

## Functions

- **Convention**: camelCase
- **Examples**:
  - `initForm()`
  - `onSubmit()`
  - `updateProfile()`
  - `getEntityForCreateMode()`

## Variables

- **Convention**: camelCase
- **Examples**:
  - `entityForm`
  - `isSubmitted`
  - `receivedFeedbacks`
  - `authFacade`

## Constants

- **Convention**: UPPER_CASE
- **Examples**:
  - `AUTH_FEATURE_KEY`
  - `API_URL`
  - `DEFAULT_PAGE_SIZE`
  - `USER_TOKEN_ENDPOINTS`

## Types/Interfaces

- **Convention**: PascalCase
- **Examples**:
  - `User`
  - `Member`
  - `ApiListResult<T>`
  - `AbstractControlWarn`
