---
description: Naming conventions for donaction-api (Strapi v5)
globs:
  - "donaction-api/**/*.ts"
  - "donaction-api/**/*.js"
  - "!donaction-api/node_modules/**"
---

# Naming Conventions - Backend API

## Files

- **Convention**: Mixed - kebab-case for routes/controllers/services, PascalCase for types
- **Examples**:
  - Routes: `klubr.ts`, `klubr-custom.ts`
  - Controllers: `klubr.ts`, `invoice.ts`
  - Services: `klubr.ts`, `klub-don.ts`
  - Middlewares: `owner-or-admin.ts`, `request-logger.ts`
  - Types: `User.ts`, `KlubrEntity.ts`
  - Schemas: `schema.json`

## Functions

- **Convention**: camelCase
- **Examples**:
  - `sendInvitationEmail()`
  - `countEmptyFields()`
  - `sendBrevoTransacEmail()`
  - `getKlubrDetail()`

## Variables

- **Convention**: camelCase
- **Examples**:
  - `klubrData`
  - `userId`
  - `emailConfig`
  - `paymentIntent`

## Constants

- **Convention**: UPPER_SNAKE_CASE
- **Examples**:
  - `BREVO_TEMPLATES`
  - `USER_ROLES`
  - `PROJECT_STATUS`
  - `API_TOKEN_ROUTES`

## Types/Interfaces

- **Convention**: PascalCase with `Entity` suffix for Strapi entities
- **Examples**:
  - `KlubrEntity`
  - `MemberEntity`
  - `InvoiceEntity`
  - `LifecycleEvent<T>`
