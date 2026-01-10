---
name: skill:angular-admin-patterns
description: Angular 19 patterns for admin dashboard. Use when creating components, forms, state management, or UI elements in donaction-admin.
model: claude-sonnet-4-5
---

# Angular Admin Dashboard Skills

## Available Patterns

| Pattern | File | Use When |
|---------|------|----------|
| Standalone Component | [standalone-component.md](standalone-component.md) | Creating new components |
| Reactive Form | [reactive-form.md](reactive-form.md) | Building forms with validation |
| NgRx Feature State | [ngrx-feature-state.md](ngrx-feature-state.md) | Adding state management |
| Generic Update | [generic-update-component.md](generic-update-component.md) | CRUD form components |
| Functional Guard | [functional-guard.md](functional-guard.md) | Route protection |
| Accessible Form | [accessible-form.md](accessible-form.md) | A11y compliance |
| PrimeNG Component | [primeng-component.md](primeng-component.md) | UI components |
| HTTP Service | [http-service.md](http-service.md) | API communication |
| RxJS Pipeline | [rxjs-data-pipeline.md](rxjs-data-pipeline.md) | Observable patterns |
| Card Variants | [card-variants.md](card-variants.md) | Reusable cards |
| Responsive Grid | [responsive-grid.md](responsive-grid.md) | PrimeFlex layouts |

## Core Principles

- **Standalone**: No NgModules, explicit imports
- **Signals**: `signal()`, `computed()`, `input()`, `model()`
- **Control flow**: `@if`, `@for`, `@switch`
- **DI**: `inject()` function, no constructor injection
- **Facade pattern**: Components → Facades → Services
