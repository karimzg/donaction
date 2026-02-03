### Admin Dashboard - Donaction

> **Version**: 2.1.0 | **Last Updated**: 2025-12-19 | **Angular 21 Migration**: ✅ Complete

#### Context
Angular 21 admin dashboard for association managers. Handles club configuration, member management, donation tracking, project creation, and invoice generation.

#### Stack
- **Framework**: Angular 21.0.6
- **UI**: PrimeNG 19, TailwindCSS 3, PrimeFlex 4
- **State**: NgRx 19 (store, effects, signals)
- **Forms**: Reactive Forms + custom validators
- **Auth**: JWT + Google OAuth via angularx-social-login

#### Angular 21 Migration
Migrated from Angular 19 → 21 with modern signal-based APIs (Dec 2025):
- ✅ Signal inputs: `input()` and `input.required<T>()` replace `@Input()`
- ✅ Signal queries: `viewChild()` replaces `@ViewChild()`
- ✅ Automatic cleanup: `takeUntilDestroyed()` replaces manual `Subject/ngOnDestroy`
- ✅ Bundle size: 1.62 MB (unchanged)
- ⏳ PrimeNG v21: Deferred (breaking changes, future PR)
- See commits: `5f7d371` (packages), `3706967` (signals)

#### Commands
| Command | Description |
|---------|-------------|
| `npm run start` | Dev server on port 4300 |
| `ng test` | Run Jasmine/Karma tests |
| `ng build` | Production build |

#### Folder Structure
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

#### Rules

##### Naming Conventions
See `@docs/rules/admin/naming-conventions.md` for file, component, function, variable, constant, and type naming standards.

##### Architecture
- [ARCH] Feature modules in `routes/{feature}/` with lazy loading
- [ARCH] State in `data-access/+state/` (actions, reducer, effects, selectors, facade)
- [ARCH] Components interact ONLY with facades, never directly with services

##### Components
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

##### Signals & Reactivity
- [SIGNAL] Use Signals API: `signal()`, `computed()`, `effect()`
- [SIGNAL] Use `input()` and `model()` for component inputs
- [SIGNAL] Use `viewChild()` for view queries
- [SIGNAL] Convert Observables with `toSignal()` from `@angular/core/rxjs-interop`
```typescript
readonly user = input.required<User>();
readonly isAdmin = computed(() => this.user().role === 'admin');
```

##### Control Flow
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

##### State Management (NgRx)
- [STATE] Facades expose state via `selectSignal()` and `toSignal()`
- [STATE] Effects handle side effects, dispatch success/failure actions
- [STATE] Use `createActionGroup()` for related actions
- [STATE] Selectors use `createFeatureSelector` + `createSelector`

##### RxJS
- [RX] Suffix all Observable variables with `$`: `user$`, `isLoading$`
- [RX] Use `takeUntilDestroyed()` for automatic cleanup (no manual `takeUntil`)
- [RX] Standard operators: `map`, `tap`, `switchMap`, `catchError`, `filter`, `take`
```typescript
this.data$ = this.trigger$.pipe(
  switchMap(() => this.service.getData()),
  takeUntilDestroyed(this.destroyRef)
);
```

##### Forms
- [FORM] Use `FormGroup`, `FormControl`, `Validators`
- [FORM] Access controls with `FormControlPipe`: `form | formControl:'fieldName'`
- [FORM] Display errors via `ErrorDisplayComponent`
- [FORM] Custom validators in `@shared/utils/validators/`
- [FORM] Extend `GenericUpdateComponent` for CRUD forms

##### Typing
- [TS] No `any` unless unavoidable
- [TS] Import types from `@shared/utils/models/`
- [TS] Use `Partial<T>` for partial updates

##### Error Handling
- [ERR] HTTP errors caught in `http-errors.interceptor.ts`
- [ERR] Toast notifications via `ToastService.showErrorToast()`
- [ERR] 403 → logout, 400 → validation message, 504 → network toast

#### Anti-Patterns
| ❌ Don't | ✅ Do | Why |
|----------|-------|-----|
| `constructor(private svc: Service)` | `private svc = inject(Service)` | Modern DI pattern |
| `*ngIf="condition"` | `@if (condition)` | New control flow |
| `observable` without `$` | `observable$` | Naming convention |
| Manual `takeUntil(destroy$)` | `takeUntilDestroyed()` | Auto cleanup |
| Direct service calls in components | Use facades | Separation of concerns |
| `any` types | Proper typing | Type safety |

#### Key Files
| Path | Purpose |
|------|---------|
| `app.config.ts` | App configuration, providers |
| `app.routes.ts` | Root routing with lazy loading |
| `shared/utils/interceptors/` | HTTP interceptors (auth, errors) |
| `shared/utils/theme/theme.preset.ts` | PrimeNG Aura theme config |
| `shared/components/generics/generic-update/` | Base CRUD component |

#### Reference Files
| File | When to consult |
|------|-----------------|
| `FORMS.md` | GenericUpdateComponent implementation |
| `BACKEND_COMMUNICATION.md` | Dual auth mode, interceptors, NgRx patterns |

#### Skills
Detailed patterns in `@aidd/skills/admin/`:
- `standalone-component.md` - Component creation
- `reactive-form.md` - Form patterns
- `ngrx-feature-state.md` - State setup
- `generic-update-component.md` - CRUD forms


### Admin Backend Communication Reference

#### Dual Auth Mode

**Location**: `@routes/auth/data-access/repositories/auth.service.ts`

Two authentication modes:
- `'angular'` - Cookie-based JWT via `JwtService`
- `'nextJs'` - Session token from Next.js at `/api/auth/session`

##### Initialization Flow
```typescript
// On app load
checkAuthModeAndIfUserAuthentificated():
  1. Try Next.js session endpoint first
  2. Fallback to Angular cookies if fails
  3. Store mode + token in AuthFacade (NgRx)
```

#### Auth Interceptor

**Location**: `@shared/utils/interceptors/auth.interceptor.ts`

##### Token Routing Logic
```typescript
// Routes using API token (environment.apiTokenV1)
apiTokenRoutes = ['/api/auth/local', '/api/auth/google/callback'];

// Routes skipping auth header
unauthenticatedRoutes = ['maps.googleapis.com'];

// All other routes → use authFacade.token$ from NgRx
```

##### Header Injection
```typescript
request.clone({
  setHeaders: { Authorization: `Bearer ${token}` }
});
```

#### Query Building

**Location**: `@shared/utils/helpers/query-helpers.ts`

##### Core Functions
| Function | Output |
|----------|--------|
| `addFilter(field, value)` | `filters[field][$eq]=value` |
| `addSubElementFilter(el, sub, val)` | `filters[el][sub][$eq]=val` |
| `getPopulateQueryParam(fields)` | `populate[0]=field` |
| `pagination(page, size)` | `pagination[page]=1&pageSize=10` |
| `getSortQueryParam(arr)` | `sort[0]=field:desc` |

##### Example Query
```
GET /api/klub-projets/?
  filters[klubr][uuid][$eq]=abc-123
  &populate[0]=couverture
  &populate[1]=klubr_membre.avatar
  &sort[0]=status:desc
  &pagination[page]=1&pagination[pageSize]=9
```

#### Cache Invalidation

**Location**: `@shared/services/invalidate-cache.service.ts`

After mutations, invalidate Next.js ISR cache:
```typescript
// In GenericUpdateComponent
cacheToUnvalidate(): string[] {
  return ['klubr', 'projects'];
}

// Calls POST /api/revalidate with paths
```

#### NgRx State Access

##### AuthFacade Observables
```typescript
token$: Observable<string>
isAuthenticated$: Observable<boolean>
authMode$: Observable<'angular' | 'nextJs'>
```

##### Usage in Components
```typescript
private authFacade = inject(AuthFacade);
private token = toSignal(this.authFacade.token$);
```


### Admin Forms Reference

#### Custom Validators

Located in `@shared/utils/validators/`:

| Validator | Purpose |
|-----------|---------|
| `passwordStrengthValidator()` | Min 8 chars, digit, special, lower/upper |
| `passwordMatchValidator` | Compare password fields |
| `differentPasswordValidator` | New ≠ current password |
| `minHtmlLengthValidator(n)` | HTML content min length |
| `maxHtmlLengthValidator(n)` | HTML content max length |
| `hexColorValidator()` | Hex color format |
| `webSiteValidator()` | URL format (http/https) |
| `dateAtLeastTomorrowValidator()` | Future date validation |
| `warn(validator)` | Convert error to warning |

#### Form Pipes

| Pipe | Usage |
|------|-------|
| `FormControlPipe` | `form \| formControl:'fieldName'` |
| `FormArrayPipe` | `form \| formArray:'items'` |
| `FormStatusPipe` | Access form status |

#### GenericUpdateComponent

**Location**: `@shared/components/generics/generic-update/generic-update.component.ts`

##### Required Methods
```typescript
initForm(): void           // Initialize FormGroup
formFields(): object       // Return form values for API
serviceUpdate(uuid, data)  // Update API call → Observable
serviceCreate(data)        // Create API call → Observable
```

##### Optional Hooks
```typescript
preUpdateHook(): void              // Before update
preCreateHook(): void              // Before create
updateFile(uuid): Observable       // File upload
cacheToUnvalidate(): string[]      // Cache tags to clear
redirectAfterCreate(): string      // Navigation path
redirectAfterUpdate(): string      // Navigation path
reloadEntity(): void               // Refresh data
```

##### Properties
- `successMsg`, `errorUpdateMsg`, `errorCreateMsg` - Toast messages
- `routePrefix` - Base route for navigation
- `isSubmitted`, `loading`, `isReady` - State signals
- `entitySignal` - Current entity data

##### Usage Pattern
```typescript
export class MemberUpdateComponent extends GenericUpdateComponent<Member> {
  protected override successMsg = 'Profil mis à jour';
  protected override routePrefix = '/profile';

  constructor() {
    super();
    this.entity.set(this.config.data.profile);
  }

  protected override initForm(): void {
    const entity = untracked(this.entitySignal);
    this.entityForm = new FormGroup({
      nom: new FormControl(entity?.nom, Validators.required)
    });
  }

  protected override formFields() {
    return { ...this.entityForm.value };
  }

  protected override serviceUpdate(uuid: string, data: any) {
    this.sharedFacade.updateProfile(uuid, data);
    return this.actions$.pipe(
      ofType(SharedActions.updateProfileSuccess),
      map(({ profile }) => profile),
      take(1)
    );
  }

  protected override serviceCreate(data: any) {
    return this.profileService.createProfile(data)
      .pipe(map(res => res.data as Member));
  }
}
```

#### Error Display

Use `ErrorDisplayComponent` with form controls:
```html
<app-error-display [control]="form | formControl:'email'" />
```

Shows errors when control is dirty OR form submitted.
