---
name: architecture
description: Module architecture and structure
argument-hint: N/A
---

### Architecture

- [Language/Framework](#languageframework)
  - [Dashboard](#dashboard)
- [Full project structure](#full-project-structure)
- [Services communication](#services-communication)
  - [Component to API Flow](#component-to-api-flow)

#### Language/Framework

##### Dashboard

- **Framework**: Angular 19 → @donaction-admin/package.json
- **UI Library**: PrimeNG 19 with custom theme preset - Component library with Tailwind integration via `tailwindcss-primeui`
- **Routing**: Angular Router with lazy loading - Feature-based routing with guards (`authGuard`, `invitationCodeGuard`)
- **Data Fetching**: Angular HttpClient with interceptors - JWT auth and error handling interceptors
- **Form Handling**: Angular Reactive Forms - Template-driven and reactive forms
- **Validation**: Angular Validators with custom validators - Located in `@shared/utils/validators`
- **State Management**: NgRx Store 19 with Effects - Feature-based state organization with facades pattern
- **Build Tool**: Angular CLI with esbuild - Application builder with service worker support
- **Structure**: Feature-based architecture - Routes contain feature modules, shared contains reusable code

#### Full project structure

```text
donaction-admin/
├── src/
│   ├── app/
│   │   ├── routes/                          # Feature routes (lazy loaded)
│   │   │   ├── auth/                        # Authentication feature
│   │   │   │   ├── data-access/            # NgRx state management
│   │   │   │   │   ├── +state/             # Actions, reducers, effects, selectors, facade
│   │   │   │   │   └── repositories/       # HTTP services
│   │   │   │   ├── model/                  # Feature models
│   │   │   │   └── ui/                     # Feature components
│   │   │   ├── klub/                        # Club management
│   │   │   ├── members/                     # Member management
│   │   │   ├── project/                     # Project management
│   │   │   ├── don/                         # Donations
│   │   │   ├── facturation/                 # Invoicing
│   │   │   ├── stats/                       # Statistics
│   │   │   ├── profile/                     # User profiles
│   │   │   ├── dashboard/                   # Main dashboard layout
│   │   │   └── homepage/                    # Home page
│   │   ├── shared/                          # Shared resources
│   │   │   ├── components/                  # Reusable components
│   │   │   │   ├── atoms/                   # Atomic components
│   │   │   │   ├── header/                  # Header component
│   │   │   │   ├── sidebar/                 # Sidebar component
│   │   │   │   ├── dialog/                  # Dialog components
│   │   │   │   ├── form/                    # Form components
│   │   │   │   └── ...                      # Domain-specific components
│   │   │   ├── data-access/                 # Shared state
│   │   │   │   ├── +state/                  # Shared NgRx state
│   │   │   │   └── repositories/            # Shared HTTP services
│   │   │   ├── pipes/                       # Custom pipes by domain
│   │   │   ├── services/                    # Business logic services
│   │   │   │   ├── entities/                # Entity services
│   │   │   │   ├── analytics/               # Analytics service
│   │   │   │   └── misc/                    # Utility services
│   │   │   └── utils/                       # Utilities
│   │   │       ├── guards/                  # Route guards
│   │   │       ├── interceptors/            # HTTP interceptors
│   │   │       ├── models/                  # Shared models/interfaces
│   │   │       ├── validators/              # Custom validators
│   │   │       ├── helpers/                 # Helper functions
│   │   │       ├── theme/                   # PrimeNG theme config
│   │   │       └── config/                  # Config files
│   │   ├── app.component.ts                 # Root component
│   │   ├── app.config.ts                    # Application configuration
│   │   └── app.routes.ts                    # Root routing
│   ├── environments/                        # Environment configs
│   ├── assets/                              # Static assets
│   └── styles.scss                          # Global styles
├── angular.json                             # Angular workspace config
├── tailwind.config.js                       # Tailwind configuration
├── tsconfig.json                            # TypeScript config
└── package.json                             # Dependencies
```

#### Services communication

##### Component to API Flow

```mermaid
graph LR
    A[Component] --> B[Facade]
    B --> C[Actions]
    C --> D[Effects]
    D --> E[Repository Service]
    E --> F[HTTP Interceptor]
    F --> G[Backend API]
    G --> F
    F --> E
    E --> D
    D --> H[Reducer]
    H --> I[Selectors]
    I --> A
```

Flow:
- Component dispatches action via `Facade`
- `Actions` trigger `Effects`
- `Effects` call `Repository Service` (HTTP service)
- `Interceptors` add auth token and handle errors
- Response updates `State` via `Reducer`
- Component observes state via `Selectors`


### Backend Communication

#### API Client Setup

##### Base Configuration

@donaction-admin/src/environments/environment.ts
@donaction-admin/src/app/app.config.ts

- `environment.apiUrl` for Strapi backend (`http://localhost:1437/api/`)
- `environment.nextJsUrl` for Next.js SSR routes
- `environment.apiTokenV1` for API-level authentication
- Native Angular `HttpClient` via `provideHttpClient()`

##### HTTP Client

**Location**: `@angular/common/http`

**Configuration**:
- Functional interceptors via `withInterceptors([authInterceptor, httpErrorsInterceptor])`
- JSONP support via `withJsonpSupport()`
- Standalone services pattern with `providedIn: 'root'`
- Direct `HttpClient` injection in services

#### Authentication Flow

##### Dual Auth Mode

@donaction-admin/src/app/routes/auth/data-access/repositories/auth.service.ts

**Auth Modes**:
- `'angular'` - Cookie-based JWT via `JwtService`
- `'nextJs'` - Session token from Next.js backend at `/api/auth/session`

**Initialization**:
1. On app load, call `checkAuthModeAndIfUserAuthentificated()`
2. Try Next.js session endpoint first
3. Fallback to Angular cookies if Next.js fails
4. Store mode, token, and auth state in `AuthFacade` (NgRx)

##### Auth Interceptor

@donaction-admin/src/app/shared/utils/interceptors/auth.interceptor.ts

**Token Routing**:
- `apiTokenRoutes` use `environment.apiTokenV1` (e.g., `/api/auth/local`, `/api/auth/google/callback`)
- `unauthenticatedRoutes` skip token injection (e.g., Google Maps API)
- All other routes use `authFacade.token$` from NgRx state
- Adds `Authorization: Bearer <token>` header via `HttpRequest.clone()`

##### Auth Endpoints

**AuthService**:
- `authenticate()` - POST `/auth/local` with credentials
- `register()` - POST `/auth/local/register`
- `getMe()` - GET `/users/me` with full population
- `changeMePassword()` - POST `/auth/change-password`
- `googleOAuthRegister()` - GET `/auth/google/callback?access_token=`

#### Error Handling

##### HTTP Errors Interceptor

@donaction-admin/src/app/shared/utils/interceptors/http-errors.interceptor.ts

**Error Types**:
- `403` - Expired session: show toast, delay 3s, trigger `authFacade.logout()`
- `400` - Validation error: extract `error.error.message`, show toast
- `504` - Gateway timeout: show network toast, return `NEVER` observable
- Blob errors: parse via `FileReader`, extract nested error details
- Default: show generic error toast

**Error Structure**:
- Nested error parsing: `error.error || error`
- Details array flattened to `'<key> ><value>'` format
- HTML error messages for detailed display

#### API Patterns

##### Endpoint Organization

@donaction-admin/src/app/shared/utils/config/endpoints.ts

**Constants**:
- Authentication: `LOGIN`, `REGISTER`, `CHANGE_PASSWORD`
- Users: `USER`, `USER_PERMISSIONS`, `AVATAR`
- Clubs: `KLUBR`, `KLUBR_BY_SLUG`, `KLUBR_HOUSE`, `FEDERATION`
- Members: `MEMBER`, `LINK_MEMBER_TO_USER`, `SWITCH_TO_PROFILE`, `SWITCH_TO_ADMIN_EDITOR`
- Projects: `KLUB_PROJECT`, `PROJECT_TMPL_CATEGORY`, `PROJECT_TMPL_LIBRARY`
- Donations: `DON`, `DON_RECEIVED`, `MY_DONS`, `ATTESTATION_PDF`, `RECU_PDF`
- Invoices: `INVOICES`, `STATS`
- Media: `MEDIAS_PROFILE`, `KLUBR_DOCUMENTS`
- Cache: `REVALIDATE`

##### Service Layer Architecture

**SharedService** - `@shared/data-access/repositories/shared.service.ts`:
- `getUserDetail()`, `switchToProfile()`, `linkMemberToUser()`
- `getKlubrDetail()`, `updateKlub()`, `filterKlubs()`
- `filterMembers()`, `createProfile()`, `updateProfile()`
- `getKlubrHouseDetails()`, `updateKlubrHouseDetails()`
- `switchToProfileAdminEditor()`

**ProjectService** - `@shared/services/project.service.ts`:
- `getProjectsWithFilters()`, `getProject()`, `createProject()`, `updateProject()`
- `getProjectTmplLibraries()`, `getOwnProjectTmplLibraries()`
- Filter system: `ProjectFilters` with klubrUUIDs, status, member, isTemplate
- Populate arrays: `defaultProjectPopulate`, `defaultProjectResolverPopulate`

**UserService** - `@shared/services/user.service.ts`:
- `getUsersWithFilters()` with `UserFilters`
- Complex filter logic: role, profiles, origin, searchParams, creationDate

##### Query Building System

@donaction-admin/src/app/shared/utils/helpers/query-helpers.ts

**Core Functions**:
- `getQueryString()` - Combines filters, populate, sort, pagination
- `getPopulateQueryParam()` - Nested population: `populate[0]=field`
- `getUserPopulateQueryParam()` - Pre-built complex user population
- `addFilter()` - Single field: `filters[field][$eq]=value`
- `addSubElementFilter()` - Relation: `filters[element][subElement][$eq]=value`
- `addSubSubElementFilter()` - Deep relation (3 levels)
- `addGreaterEqualFilter()`, `addGreaterLessFilter()` - Date ranges
- `pagination()` - `pagination[page]=1&pagination[pageSize]=10`
- `getSortQueryParam()` - Array to `sort[0]=field:desc`

**Strapi V4 Query Pattern**:
```typescript
// Example: GET /api/klub-projets/?
// filters[klubr][uuid][$eq]=abc-123
// &populate[0]=couverture
// &populate[1]=klubr_membre.avatar
// &sort[0]=status:desc
// &pagination[page]=1&pagination[pageSize]=9
```

#### Data Fetching Strategies

##### Service-Based Pattern

**Standard Flow**:
1. Component injects service (e.g., `ProjectService`)
2. Calls method with typed filters (e.g., `ProjectFilters`)
3. Service builds query string via `query-helpers`
4. Returns `Observable<ApiListResult<T>>` or `Observable<T>`
5. Component subscribes or uses `async` pipe

**Populate Strategy**:
- Default arrays per entity (e.g., `defaultProjectPopulate`)
- Resolver-specific arrays for detail views
- Update-specific arrays to get modified relations

##### NgRx State Management

@donaction-admin/src/app/routes/auth/data-access/+state/

**Features**:
- `AuthFacade` exposes observables: `token$`, `isAuthenticated$`, `authMode$`
- `SharedFacade` for shared entities
- Effects handle async operations
- Reducers store normalized data

##### Cache Invalidation

@donaction-admin/src/app/shared/services/invalidate-cache.service.ts

**Pattern**:
- Services return `pathsToUnvalidateDataRequest()` with affected routes
- Call Next.js `/api/revalidate` endpoint with path array
- Invalidates Next.js ISR cache for updated entities

#### External Integrations

##### Google OAuth

@donaction-admin/src/app/routes/auth/data-access/repositories/google-auth.service.ts

- Client ID via `environment.googleClientId`
- Callback: `${apiUrl}/auth/google/callback?access_token=<token>`
- Backend returns Strapi JWT

##### Google Maps

@donaction-admin/src/app/shared/components/form/google-maps/

- API key: `environment.GOOGLE_MAPS_API_KEY`
- Unauthenticated route (no Bearer token)
- Services: `google-maps-api.service.ts`, `google-maps-utils.service.ts`

##### reCAPTCHA

@donaction-admin/src/app/app.config.ts

- Site key: `environment.ANGULAR_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY`
- Provided via `RECAPTCHA_V3_SITE_KEY` injection token

#### State & Caching

##### Service Worker

- Configured via `provideServiceWorker()`
- Enabled when `environment.pwaEnabled === true`
- Strategy: `registerWhenStable:30000`

##### Dashboard Cache

@donaction-admin/src/app/shared/services/caching.service.ts

- In-memory caching layer
- Used for repeated queries within session

#### Key Dependencies

@donaction-admin/package.json

- `@angular/common` ^19 (HttpClient)
- `@ngrx/store` ^19
- `@ngrx/effects` ^19
- `rxjs` ^7
- `primeng` ^19


---
name: coding-assertions
description: Technical reference for donaction-admin stack and configuration
argument-hint: N/A
---

### Admin Technical Reference

> **Note:** Coding rules have been extracted to `docs/rules/admin/` and reusable patterns to `aidd/skills/code/`. This document serves as a technical reference for the stack.

#### Key Libraries

##### Core
- Angular 19
- RxJS 7
- TypeScript 5.5
- zone.js 0.15

##### UI
- PrimeNG 19
- PrimeFlex 4
- PrimeIcons 7
- ngx-lottie 13
- ngx-editor 18
- ngx-image-cropper 9

##### State & Auth
- @ngrx/store 19
- @ngrx/effects 19
- @ngrx/signals 19
- jwt-decode 4
- ngx-cookie-service 19

##### Other
- @angular/google-maps 19
- @angular/service-worker 19
- ngx-device-detector 9
- ng-recaptcha 13
- plausible-tracker

#### Configuration Files

- @angular.json: build config, base href `/admin/`
- @tsconfig.app.json: TypeScript config
- @package.json: dependencies
- @proxy.conf.json: dev proxy

#### File Structure

##### Feature Organization
- Feature modules: `routes/{feature}/ui`, `routes/{feature}/data-access`, `routes/{feature}/model`
- Shared: `shared/components`, `shared/services`, `shared/pipes`, `shared/utils`
- Config: `shared/utils/config/` (endpoints, settings)
- Helpers: `shared/utils/helpers/` (query, form, pdf, html, type)

##### State Management Organization
- `data-access/repositories`: API calls
- `data-access/+state`: NgRx state (actions, effects, selectors, facade)
- `shared/services`: reusable services
- `shared/utils`: helpers, interceptors, guards, models

#### Testing

##### Test Framework
- Jasmine with Karma
- Test files: `*.spec.ts`
- Component tests check basic rendering
- Service tests mock dependencies

#### Build & Validation

##### Commands
| Order | Command    | Description                |
|-------|------------|----------------------------|
| 1     | ng test    | Run unit tests with Karma |
| 2     | ng build   | Build application          |


---
name: design
description: Design system reference for donaction-admin
argument-hint: N/A
---

### Admin Design System Reference

> **Note:** Design rules have been extracted to `docs/rules/admin/03-libs-frameworks/` and design patterns to `aidd/skills/code/`. This document serves as a reference for design system files and configuration.

#### Design System Approach

- **Method**: Hybrid - PrimeNG Aura preset + TailwindCSS utilities + SCSS for custom components
- **Theme**: Custom klubr theme with layered CSS architecture

#### Design System Files

##### Theme Configuration

- **PrimeNG Theme**: @donaction-admin/src/app/shared/utils/theme/theme.preset.ts (Aura preset with custom colors)
- **Theme Provider**: @donaction-admin/src/app/app.config.ts (application-level configuration)

##### Styling Files

- **Layout Styles**: @donaction-admin/src/assets/layout/ (typography, spacing, layout patterns)
- **Theme Overrides**: @donaction-admin/src/assets/theme/ (PrimeNG component customizations)
- **Global Styles**: @donaction-admin/src/styles.scss (layer order, base styles)

#### Color Palette

See @donaction-admin/src/app/shared/utils/theme/theme.preset.ts for complete color definitions:

- **Primary**: Indigo palette (50-950)
- **Secondary**: Zinc (light mode), Slate (dark mode)
- **Accent**: Orange-400
- **Surface**: Gray variants (0, 50-950)

#### Typography

See @donaction-admin/src/assets/layout/_typography.scss for typography system:

- **Primary Font**: Inter
- **Fallback**: sans-serif
- **Font Features**: Configured for branded elements

#### Tokens Reference

Design tokens (spacing, radius, shadows, breakpoints) are documented in:
- `docs/rules/admin/03-libs-frameworks/5-design-system-tokens.mdc`

#### Component Patterns

UI component patterns and variants are documented in:
- `docs/rules/admin/03-libs-frameworks/6-primeng-theme-usage.mdc`
- `docs/rules/admin/03-libs-frameworks/7-button-variants.mdc`
- `docs/rules/admin/03-libs-frameworks/8-card-patterns.mdc`
- `docs/rules/admin/03-libs-frameworks/9-grid-layouts.mdc`
- `docs/rules/admin/03-libs-frameworks/10-input-states.mdc`

#### Accessibility

Accessibility requirements documented in:
- `docs/rules/admin/07-quality/2-accessibility.mdc`


---
name: forms
description: Dashboard form handling guidelines
argument-hint: N/A
---

### Forms

This part describe how dashboard forms are handled in the project, including libraries used, validation strategies, and state management.

#### State Management

- Angular Reactive Forms - Form state managed through `FormGroup`, `FormControl`, `FormArray`
- Local component state using signals (`WritableSignal`, `Signal`)
- Form submission tracked with `isSubmitted` signal
- Form reset via `resetForm()` method restoring initial values
- Form dirty state tracked to determine if changes exist
- No data persistence, forms reset on component destroy

#### Validation

- Angular built-in validators - `Validators.required`, `Validators.email`, `Validators.minLength`, `Validators.maxLength`, `Validators.min`, `Validators.max`, `Validators.pattern`
- Custom validators in @shared/utils/validators/:
  - `passwordStrengthValidator()` - Min 8 chars, digit, special char, lower/upper case
  - `passwordMatchValidator` - Compares password and passwordConfirmation fields
  - `differentPasswordValidator` - Ensures new password differs from current
  - `minHtmlLengthValidator(minLength)` - Validates HTML content length
  - `maxHtmlLengthValidator(maxLength)` - Validates HTML content length
  - `hexColorValidator()` - Validates hex color format
  - `webSiteValidator()` - Validates URL format (http/https)
  - `dateAtLeastTomorrowValidator()` - Ensures date is at least tomorrow
  - `warn(validator)` - Transforms validator to warning instead of error
- Custom pipes for type-safe form access:
  - `FormControlPipe` - Extract typed `FormControl` from `FormGroup`
  - `FormArrayPipe` - Extract typed `FormArray` from `FormGroup`
  - `FormStatusPipe` - Access form status
- Client-side validation using reactive patterns with `statusChanges` observable

#### Error handling

- `FormErrorHandlingService` - Centralized error message mapping
- `ErrorDisplayComponent` - Displays errors and warnings
  - Shows errors when control is dirty or form submitted
  - Supports warnings via `AbstractControlWarn` interface
  - Subscribes to `statusChanges` for real-time feedback
- Error messages in French, mapped from validation errors
- Custom `AbstractControlWarn` interface extends `AbstractControl` with warnings property

#### GenericUpdateComponent Pattern

**Pattern CRUD** pour formulaires create/update avec gestion automatique de validation, uploads, cache et navigation.

**Location**: @donaction-admin/src/app/shared/components/generics/generic-update/generic-update.component.ts

**Documentation complète**:
- 📋 Règle: `docs/rules/admin/06-patterns/2-generic-update-component.mdc`
- 🎯 Skill: `aidd/skills/code/generic-update-component.md`

**Méthodes obligatoires**: `initForm()`, `formFields()`, `serviceUpdate()`, `serviceCreate()`

**Pattern rapide**:
```typescript
export class MemberUpdateComponent extends GenericUpdateComponent<Member> {
  protected override successMsg = 'Le profil a été mis à jour';
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

  protected override formFields(): { [key: string]: any } {
    return { ...this.entityForm.value };
  }

  protected override serviceUpdate(uuid: string, formValues: any): Observable<Member> {
    this.sharedFacade.updateProfile(uuid, formValues);
    return this.actions$.pipe(ofType(SharedActions.updateProfileSuccess), map(({profile}) => profile), take(1));
  }

  protected override serviceCreate(formValues: any): Observable<Member> {
    return this.profileService.createProfile(formValues).pipe(map(res => res.data as Member));
  }
}
```

**Voir la règle/skill pour exemples complets, hooks optionnels et best practices.**

#### Form Flow

1. Component initializes form with `FormGroup`/`FormControl`
2. User interacts with PrimeNG form components (`p-inputtext`, `p-inputmask`, `p-datepicker`, `app-editor`)
3. Validators run on value changes, set control errors
4. `ErrorDisplayComponent` subscribes to `statusChanges`, displays errors when dirty/submitted
5. On submit: set `isSubmitted` signal to true, validate form
6. If valid: transform data via `TransformationService`, call service method
7. Service returns Observable, component handles success/error
8. On success: update cache via `CachingService`, navigate or update entity
9. File uploads handled separately via `FormMediaUpdateComponent`, merged with main form data

```mermaid
graph TD
    A[User fills form] --> B[PrimeNG Input Components]
    B --> C{Validators run}
    C -->|Invalid| D[ErrorDisplayComponent shows error]
    C -->|Valid| E[Form state updated]
    E --> F[User submits]
    F --> G{Form valid?}
    G -->|No| H[Mark all touched, show errors]
    G -->|Yes| I[Transform data]
    I --> J[Call service method]
    J --> K{File uploads?}
    K -->|Yes| L[Upload files via FormMediaUpdateComponent]
    K -->|No| M[Submit form data]
    L --> M
    M --> N{Success?}
    N -->|Yes| O[Update cache, navigate/reload]
    N -->|No| P[Show error message]
```


---
name: testing
description: Testing strategy and guidelines
argument-hint: N/A
---

### Testing Guidelines

This document outlines the testing strategies and guidelines for donaction-admin.

#### Tools and Frameworks

- Jasmine v5
- Karma v6
- karma-chrome-launcher
- karma-coverage
- karma-jasmine
- karma-jasmine-html-reporter
- @angular/core/testing TestBed
- zone.js/testing

#### Testing Strategy

- Unit tests for all components, services, guards, pipes, resolvers, interceptors
- Tests co-located with source files using `.spec.ts` suffix
- TestBed configuration for dependency injection and component testing
- Standalone component testing with imports array
- Basic smoke tests ("should create") for all entities

Types of tests implemented:
- Unit Tests (components, services, guards, pipes, interceptors, resolvers)

#### Test Execution Process

- Run tests: `npm test` or `ng test`
- Config in @angular.json under `test` architect section
- Builder: `@angular-devkit/build-angular:karma`
- Polyfills: `zone.js` and `zone.js/testing`
- TypeScript config: @tsconfig.spec.json
- Style language: scss
- Assets: favicon.png, assets folder

#### Mocking and Stubbing

- TestBed.configureTestingModule for dependency injection setup
- TestBed.inject() for service instance retrieval
- TestBed.runInInjectionContext() for functional guards/resolvers
- ComponentFixture for component instance access
- fixture.detectChanges() for change detection triggering
- No functional component mocking (per CLAUDE.md rules)
