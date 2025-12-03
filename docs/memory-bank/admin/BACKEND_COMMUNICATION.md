# Backend Communication

## API Client Setup

### Base Configuration

@klubr-admin/src/environments/environment.ts
@klubr-admin/src/app/app.config.ts

- `environment.apiUrl` for Strapi backend (`http://localhost:1337/api/`)
- `environment.nextJsUrl` for Next.js SSR routes
- `environment.apiTokenV1` for API-level authentication
- Native Angular `HttpClient` via `provideHttpClient()`

### HTTP Client

**Location**: `@angular/common/http`

**Configuration**:
- Functional interceptors via `withInterceptors([authInterceptor, httpErrorsInterceptor])`
- JSONP support via `withJsonpSupport()`
- Standalone services pattern with `providedIn: 'root'`
- Direct `HttpClient` injection in services

## Authentication Flow

### Dual Auth Mode

@klubr-admin/src/app/routes/auth/data-access/repositories/auth.service.ts

**Auth Modes**:
- `'angular'` - Cookie-based JWT via `JwtService`
- `'nextJs'` - Session token from Next.js backend at `/api/auth/session`

**Initialization**:
1. On app load, call `checkAuthModeAndIfUserAuthentificated()`
2. Try Next.js session endpoint first
3. Fallback to Angular cookies if Next.js fails
4. Store mode, token, and auth state in `AuthFacade` (NgRx)

### Auth Interceptor

@klubr-admin/src/app/shared/utils/interceptors/auth.interceptor.ts

**Token Routing**:
- `apiTokenRoutes` use `environment.apiTokenV1` (e.g., `/api/auth/local`, `/api/auth/google/callback`)
- `unauthenticatedRoutes` skip token injection (e.g., Google Maps API)
- All other routes use `authFacade.token$` from NgRx state
- Adds `Authorization: Bearer <token>` header via `HttpRequest.clone()`

### Auth Endpoints

**AuthService**:
- `authenticate()` - POST `/auth/local` with credentials
- `register()` - POST `/auth/local/register`
- `getMe()` - GET `/users/me` with full population
- `changeMePassword()` - POST `/auth/change-password`
- `googleOAuthRegister()` - GET `/auth/google/callback?access_token=`

## Error Handling

### HTTP Errors Interceptor

@klubr-admin/src/app/shared/utils/interceptors/http-errors.interceptor.ts

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

## API Patterns

### Endpoint Organization

@klubr-admin/src/app/shared/utils/config/endpoints.ts

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

### Service Layer Architecture

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

### Query Building System

@klubr-admin/src/app/shared/utils/helpers/query-helpers.ts

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

## Data Fetching Strategies

### Service-Based Pattern

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

### NgRx State Management

@klubr-admin/src/app/routes/auth/data-access/+state/

**Features**:
- `AuthFacade` exposes observables: `token$`, `isAuthenticated$`, `authMode$`
- `SharedFacade` for shared entities
- Effects handle async operations
- Reducers store normalized data

### Cache Invalidation

@klubr-admin/src/app/shared/services/invalidate-cache.service.ts

**Pattern**:
- Services return `pathsToUnvalidateDataRequest()` with affected routes
- Call Next.js `/api/revalidate` endpoint with path array
- Invalidates Next.js ISR cache for updated entities

## External Integrations

### Google OAuth

@klubr-admin/src/app/routes/auth/data-access/repositories/google-auth.service.ts

- Client ID via `environment.googleClientId`
- Callback: `${apiUrl}/auth/google/callback?access_token=<token>`
- Backend returns Strapi JWT

### Google Maps

@klubr-admin/src/app/shared/components/form/google-maps/

- API key: `environment.GOOGLE_MAPS_API_KEY`
- Unauthenticated route (no Bearer token)
- Services: `google-maps-api.service.ts`, `google-maps-utils.service.ts`

### reCAPTCHA

@klubr-admin/src/app/app.config.ts

- Site key: `environment.ANGULAR_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY`
- Provided via `RECAPTCHA_V3_SITE_KEY` injection token

## State & Caching

### Service Worker

- Configured via `provideServiceWorker()`
- Enabled when `environment.pwaEnabled === true`
- Strategy: `registerWhenStable:30000`

### Dashboard Cache

@klubr-admin/src/app/shared/services/caching.service.ts

- In-memory caching layer
- Used for repeated queries within session

## Key Dependencies

@klubr-admin/package.json

- `@angular/common` ^19 (HttpClient)
- `@ngrx/store` ^19
- `@ngrx/effects` ^19
- `rxjs` ^7
- `primeng` ^19
