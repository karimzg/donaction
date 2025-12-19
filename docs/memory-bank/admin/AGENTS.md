# Admin Dashboard - Donaction

> **Version**: 2.1.0 | **Last Updated**: 2025-12-19 | **Angular 21 Migration**: ✅ Complete

## Context
Angular 21 admin dashboard for association managers. Handles club configuration, member management, donation tracking, project creation, and invoice generation.

## Stack
- **Framework**: Angular 21.0.6
- **UI**: PrimeNG 19, TailwindCSS 3, PrimeFlex 4
- **State**: NgRx 19 (store, effects, signals)
- **Forms**: Reactive Forms + custom validators
- **Auth**: JWT + Google OAuth via angularx-social-login

## Angular 21 Migration
Migrated from Angular 19 → 21 with modern signal-based APIs (Dec 2025):
- ✅ Signal inputs: `input()` and `input.required<T>()` replace `@Input()`
- ✅ Signal queries: `viewChild()` replaces `@ViewChild()`
- ✅ Automatic cleanup: `takeUntilDestroyed()` replaces manual `Subject/ngOnDestroy`
- ✅ Bundle size: 1.62 MB (unchanged)
- ⏳ PrimeNG v21: Deferred (breaking changes, future PR)
- See commits: `5f7d371` (packages), `3706967` (signals)

## Commands
| Command | Description |
|---------|-------------|
| `npm run start` | Dev server on port 4300 |
| `ng test` | Run Jasmine/Karma tests |
| `ng build` | Production build |

## Folder Structure
```
src/app/
├── routes/           # Feature modules (lazy loaded)
│   └── {feature}/
│       ├── data-access/  # NgRx state + repositories
│       ├── model/        # Feature types
│       └── ui/           # Components
├── shared/
│   ├── components/   # Reusable UI (atoms, dialogs, forms)
│   ├── data-access/  # Shared NgRx state
│   ├── services/     # Business logic
│   ├── pipes/        # Custom pipes
│   └── utils/        # Guards, interceptors, helpers, models
```

## Rules

### Naming Conventions
See `@docs/rules/admin/naming-conventions.md` for file, component, function, variable, constant, and type naming standards.

### Architecture
- [ARCH] Feature modules in `routes/{feature}/` with lazy loading
- [ARCH] State in `data-access/+state/` (actions, reducer, effects, selectors, facade)
- [ARCH] Components interact ONLY with facades, never directly with services

### Components
- [COMP] All components must use `standalone: true`
- [COMP] Explicit imports in `imports` array (no NgModule)
- [COMP] Component prefix: `app-`
- [COMP] Use `inject()` function, NOT constructor injection
```typescript
// ✅ Correct
private http = inject(HttpClient);
private facade = inject(AuthFacade);

// ❌ Wrong
constructor(private http: HttpClient) {}
```

### Signals & Reactivity
- [SIGNAL] Use Signals API: `signal()`, `computed()`, `effect()`
- [SIGNAL] Use `input()` and `model()` for component inputs
- [SIGNAL] Use `viewChild()` for view queries
- [SIGNAL] Convert Observables with `toSignal()` from `@angular/core/rxjs-interop`
```typescript
readonly user = input.required<User>();
readonly isAdmin = computed(() => this.user().role === 'admin');
```

### Control Flow
- [FLOW] Use `@if`, `@for`, `@switch` (NOT `*ngIf`, `*ngFor`)
```html
@if (isLoading()) {
  <app-spinner />
} @else {
  @for (item of items(); track item.id) {
    <app-card [data]="item" />
  }
}
```

### State Management (NgRx)
- [STATE] Facades expose state via `selectSignal()` and `toSignal()`
- [STATE] Effects handle side effects, dispatch success/failure actions
- [STATE] Use `createActionGroup()` for related actions
- [STATE] Selectors use `createFeatureSelector` + `createSelector`

### RxJS
- [RX] Suffix all Observable variables with `$`: `user$`, `isLoading$`
- [RX] Use `takeUntilDestroyed()` for automatic cleanup (no manual `takeUntil`)
- [RX] Standard operators: `map`, `tap`, `switchMap`, `catchError`, `filter`, `take`
```typescript
this.data$ = this.trigger$.pipe(
  switchMap(() => this.service.getData()),
  takeUntilDestroyed(this.destroyRef)
);
```

### Forms
- [FORM] Use `FormGroup`, `FormControl`, `Validators`
- [FORM] Access controls with `FormControlPipe`: `form | formControl:'fieldName'`
- [FORM] Display errors via `ErrorDisplayComponent`
- [FORM] Custom validators in `@shared/utils/validators/`
- [FORM] Extend `GenericUpdateComponent` for CRUD forms

### Typing
- [TS] No `any` unless unavoidable
- [TS] Import types from `@shared/utils/models/`
- [TS] Use `Partial<T>` for partial updates

### Error Handling
- [ERR] HTTP errors caught in `http-errors.interceptor.ts`
- [ERR] Toast notifications via `ToastService.showErrorToast()`
- [ERR] 403 → logout, 400 → validation message, 504 → network toast

## Anti-Patterns
| ❌ Don't | ✅ Do | Why |
|----------|-------|-----|
| `constructor(private svc: Service)` | `private svc = inject(Service)` | Modern DI pattern |
| `*ngIf="condition"` | `@if (condition)` | New control flow |
| `observable` without `$` | `observable$` | Naming convention |
| Manual `takeUntil(destroy$)` | `takeUntilDestroyed()` | Auto cleanup |
| Direct service calls in components | Use facades | Separation of concerns |
| `any` types | Proper typing | Type safety |

## Key Files
| Path | Purpose |
|------|---------|
| `app.config.ts` | App configuration, providers |
| `app.routes.ts` | Root routing with lazy loading |
| `shared/utils/interceptors/` | HTTP interceptors (auth, errors) |
| `shared/utils/theme/theme.preset.ts` | PrimeNG Aura theme config |
| `shared/components/generics/generic-update/` | Base CRUD component |

## Reference Files
| File | When to consult |
|------|-----------------|
| `FORMS.md` | GenericUpdateComponent implementation |
| `BACKEND_COMMUNICATION.md` | Dual auth mode, interceptors, NgRx patterns |

## Skills
Detailed patterns in `@aidd/skills/admin/`:
- `standalone-component.md` - Component creation
- `reactive-form.md` - Form patterns
- `ngrx-feature-state.md` - State setup
- `generic-update-component.md` - CRUD forms
