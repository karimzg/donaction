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
| Order | Command    | Description                |
|-------|------------|----------------------------|
| 1     | ng test    | Run unit tests with Karma |
| 2     | ng build   | Build application          |
```

## Angular Coding Patterns

### Component Architecture
- Use **standalone components** (no `NgModule` except legacy `google-maps-utils.module.ts`)
- Components declare imports in `@Component` decorator `imports` array
- Use `inject()` function for dependency injection (not constructor injection)
- File naming: `*.component.ts`, `*.service.ts`, `*.pipe.ts`, `*.guard.ts`
- Component prefix: `app-` (configured in @angular.json)

### Modern Angular Features
- Use `signal()`, `computed()`, `effect()` from `@angular/core`
- Use `input()` and `model()` for component inputs
- Use `viewChild()` for view queries
- Control flow: `@if`, `@for`, `@switch` in templates (modern syntax)
- Use `toSignal()` from `@angular/core/rxjs-interop` for signal conversion
- Use `takeUntilDestroyed()` for subscription cleanup (no manual `takeUntil`)

### State Management
- NgRx Store for global state with signals integration
- Facades pattern: services expose state via `selectSignal()` and `toSignal()`
- Actions/Effects pattern for side effects
- Services use `providedIn: 'root'`

### Forms
- Reactive forms with `FormGroup`, `FormControl`, `Validators`
- Custom `FormControlPipe` to access controls: `form | formControl:'fieldName'`
- Helper functions in `form-helpers.ts`
- Validation errors displayed via `ErrorDisplayComponent`

### RxJS Patterns
- Prefer `takeUntilDestroyed()` over manual `takeUntil(destroyed$)`
- Use operators: `map`, `tap`, `switchMap`, `catchError`, `filter`, `take`
- Observable naming: suffix with `$` (e.g., `me$`, `isAuthenticated$`)
- Combine observables with `combineLatest`, `merge`

### HTTP & API
- Services inject `HttpClient` via `inject(HttpClient)`
- Interceptors: `httpErrorsInterceptor` for centralized error handling
- Guards: functional guards with `CanActivateFn` (e.g., `authGuard`)
- Query helpers in `query-helpers.ts` for API filters/pagination
- Environment config via `@environments/environment`

### Error Handling
- HTTP errors caught in `httpErrorsInterceptor`
- Toast notifications via `ToastService.showErrorToast()`
- Errors thrown early, never silent
- Blob responses parsed for error details

### Routing
- Functional guards: `authGuard`, `invitationCodeGuard`, `linkMemberGuard`
- Resolvers for data preloading
- Routes defined in `*.routes.ts` files
- Base href: `/admin/` (configured in @angular.json)

### Services Organization
- `data-access/repositories`: API calls
- `data-access/+state`: NgRx state (actions, effects, selectors, facade)
- `shared/services`: reusable services
- `shared/utils`: helpers, interceptors, guards, models

### Styling
- SCSS with `styleUrl` in components
- PrimeNG v19 with PrimeFlex v4
- Tailwind CSS with `tailwindcss-primeui`
- Animations: `fadeAnimation` from `animations.ts`

### Change Detection
- Most components use default change detection
- `OnPush` used sparingly (e.g., `klub-house-update.component.ts`)

## TypeScript Usage

### Types & Interfaces
- Models in `shared/utils/models/`: `klubr.ts`, `user-details.ts`, `media.ts`, `misc.ts`
- Strict typing, no `any` unless unavoidable
- Use `Partial<T>` for partial updates
- Type imports from models

### Dependency Injection
- Use `inject()` function in component/service body
- Private services: `private http = inject(HttpClient)`
- Public when needed in template: `public toastService = inject(ToastService)`

### Async/Await
- Helper functions use `async/await` (e.g., `urlToFormData` in `form-helpers.ts`)
- Services prefer observables over promises

## Code Organization

### Component Structure
- Template-driven with reactive forms
- Component extends base classes when needed (e.g., `GenericListingComponent`)
- Lifecycle hooks: `ngOnInit`, `AfterViewInit`
- Signals for local state
- Facade for global state

### Service Structure
- Injectable with `providedIn: 'root'`
- Methods return `Observable<T>`
- Inject dependencies via `inject()`
- Actions dispatched via facade or store

### File Structure
- Feature modules: `routes/{feature}/ui`, `routes/{feature}/data-access`, `routes/{feature}/model`
- Shared: `shared/components`, `shared/services`, `shared/pipes`, `shared/utils`
- Config: `shared/utils/config/` (endpoints, settings)
- Helpers: `shared/utils/helpers/` (query, form, pdf, html, type)

## Testing

### Test Framework
- Jasmine with Karma
- Test files: `*.spec.ts`
- Component tests check basic rendering
- Service tests mock dependencies

## Key Libraries

### Core
- Angular 19
- RxJS 7
- TypeScript 5.5
- zone.js 0.15

### UI
- PrimeNG 19
- PrimeFlex 4
- PrimeIcons 7
- ngx-lottie 13
- ngx-editor 18
- ngx-image-cropper 9

### State & Auth
- @ngrx/store 19
- @ngrx/effects 19
- @ngrx/signals 19
- jwt-decode 4
- ngx-cookie-service 19

### Other
- @angular/google-maps 19
- @angular/service-worker 19
- ngx-device-detector 9
- ng-recaptcha 13
- plausible-tracker

## Configuration Files
- @angular.json: build config, base href `/admin/`
- @tsconfig.app.json: TypeScript config
- @package.json: dependencies
- @proxy.conf.json: dev proxy
