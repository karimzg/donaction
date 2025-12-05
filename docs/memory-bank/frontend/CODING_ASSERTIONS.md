---
name: coding-assertions
description: Code quality verification checklist
argument-hint: N/A
---

# Coding Guidelines

> Those rules must be minimal because the MUST be checked after EVERY CODE GENERATION.

## Requirements to complete a feature

**A feature is really completed if ALL of the above are satisfied: if not, iterate to fix all until all are green.**

## Steps to follow

1. Check their is no duplication
2. Ensure code is re-used
3. Run all those commands, in order to ensure code is perfect:

```markdown
| Order | Command               | Description                  |
|-------|-----------------------|------------------------------|
| 1     | yarn lint             | ESLint check                 |
| 2     | yarn format           | Format with Prettier         |
| 3     | yarn build            | Next.js production build     |
```

## TypeScript Configuration

Config: @donaction-frontend/tsconfig.json

- Strict mode enabled (`"strict": true`)
- Target ES6
- Module resolution: Node
- Path aliases configured:
  - `@/components/*` → `./src/layouts/components/*`
  - `@/shortcodes/*` → `./src/layouts/shortcodes/*`
  - `@/helpers/*` → `./src/layouts/helpers/*`
  - `@/partials/*` → `./src/layouts/partials/*`
  - `@/shapes` → `./src/shapes`
  - `@/*` → `./src/*`

## Component Structure

- Client components: Use `'use client'` directive at top of file
- Component files: Named `index.tsx` in feature folders
- Custom hooks: Separate files prefixed with `use` (e.g., `useLoginForm.ts`)
- Constants: Separate `consts.ts` files when needed

## Naming Conventions

- Components: PascalCase (e.g., `LoginForm`)
- Hooks: camelCase with `use` prefix (e.g., `useLoginForm`)
- Files: kebab-case for folders, `index.tsx` for components
- Types/Interfaces: PascalCase with `I` prefix for interfaces when appropriate

## TypeScript Patterns

- Prefer `interface` for object shapes with properties
- Use `type` for unions, intersections, mapped types
- Export types from `@/core/models/` by domain
- Use `Omit` and `Pick` utilities for type composition
- Typed Redux hooks: `useAppDispatch`, `useAppSelector`, `useAppStore`

## State Management

- Redux Toolkit for global state (@reduxjs/toolkit)
- Typed hooks from `@/core/store/hooks`
- Local state with `useState` for component-specific data
- `useRef` for non-rendering state (e.g., validation feedback)
- Dispatch actions via `useAppDispatch`

## React Patterns

- Functional components only
- Custom hooks for business logic separation
- Props destructuring in component signature
- Conditional rendering with ternary or `&&`
- Event handlers: Arrow functions or extracted functions

## HTTP Services

- Centralized `HttpService.ExecuteRequest` in `@/core/services`
- Service functions exported from domain folders (e.g., `@/core/services/auth`)
- Promises returned, no internal error handling
- Cookie support via optional `cookies` parameter
- FormData support via `isFormData` flag

## Error Handling

- Services return rejected promises on error
- Components use try/catch in async handlers
- Toast notifications via Redux (`pushToast`)
- GA event tracking for errors (`sendGaEvent`)
- Silent catch discouraged, always notify user

## Forms & Validation

- Custom validation pattern with `FeedbackParamsType`
- `receivedFeedbacks` ref to collect validation results
- `triggerValidation` counter to trigger revalidation
- `process.nextTick` for async validation checks
- Form state in custom hooks (e.g., `useLoginForm`)

## Next.js Specifics

Config: @donaction-frontend/next.config.js

- App Router (Next.js 14)
- `reactStrictMode: false`
- Remote images from: `lh3.googleusercontent.com`, `res.cloudinary.com`, `ik.imagekit.io`, `cdn.kcak11.com`
- Output: `standalone`
- Bundle analyzer enabled via `ANALYZE=true`

## Styling

Config: @donaction-frontend/.prettierrc

- Prettier for formatting
- Tabs for indentation (`"useTabs": true`)
- Tab width: 2
- Print width: 100
- Single quotes for strings
- JSX single quotes
- Trailing commas: all
- Tailwind CSS for styling

## Code Quality

- No `console.log` in production code (55 instances found - should be removed)
- Prefer early returns over nested conditionals
- Extract complex logic into custom hooks
- Keep components focused on rendering
- Colocate related files (component + hook + consts)

## Dependencies

Key libraries:
- `next` (14)
- `react` (18)
- `next-auth` (4) for authentication
- `@reduxjs/toolkit` (2) for state
- `primereact` (10) for UI components
- `stripe` (14) for payments
- `swiper` (11) for carousels
- `react-icons` (4) for icons
- `date-fns` (2) for dates

## File Organization

```
src/
├── app/              # Next.js app router
├── config/           # App configuration
├── core/             # Core functionality
│   ├── helpers/      # Utility functions
│   ├── hooks/        # Shared hooks
│   ├── models/       # TypeScript types by domain
│   ├── services/     # API services by domain
│   └── store/        # Redux store
├── layouts/          # Layout components
│   ├── components/   # Reusable components
│   ├── partials/     # Page partials
│   └── shortcodes/   # Content shortcodes
├── middleware.ts     # Next.js middleware
├── styles/           # Global styles
└── types/            # Global type definitions
```
