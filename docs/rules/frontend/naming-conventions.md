---
description: Naming conventions for donaction-frontend (Next.js 14)
globs:
  - "donaction-frontend/**/*.ts"
  - "donaction-frontend/**/*.tsx"
  - "!donaction-frontend/node_modules/**"
---

# Naming Conventions - Frontend

## Files

- **Convention**: Mixed - kebab-case for pages, camelCase for components
- **Examples**:
  - Pages: `page.tsx`, `layout.tsx`, `[slug]/page.tsx`
  - Components: `index.tsx` (in feature folders)
  - Hooks: `useLoginForm.ts`, `useAppDispatch.ts`
  - Constants: `consts.ts`
  - Services: `index.ts` (in service folders)

## Components

- **Convention**: PascalCase
- **Examples**:
  - `LoginForm`
  - `ErrorDisplay`
  - `SponsorshipForm`
  - `HeaderComponent`

## Functions

- **Convention**: camelCase
- **Examples**:
  - `getAllClubs()`
  - `getClubDetailBySlug()`
  - `createKlubDonPayment()`
  - `validateEmail()`

## Variables

- **Convention**: camelCase
- **Examples**:
  - `isSubmitted`
  - `entityForm`
  - `receivedFeedbacks`
  - `defaultValues`

## Constants

- **Convention**: UPPER_CASE
- **Examples**:
  - `API_TOKEN`
  - `USER_TOKEN_ENDPOINTS`
  - `DEFAULT_FEEDBACK`
  - `BACKEND_URL`

## Types/Interfaces

- **Convention**: PascalCase, with optional `I` prefix for interfaces
- **Examples**:
  - `User`
  - `Club`
  - `ExecutorInterface`
  - `FeedbackParamsType`
