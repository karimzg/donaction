# Admin Backend Communication Reference

## Dual Auth Mode

**Location**: `@routes/auth/data-access/repositories/auth.service.ts`

Two authentication modes:
- `'angular'` - Cookie-based JWT via `JwtService`
- `'nextJs'` - Session token from Next.js at `/api/auth/session`

### Initialization Flow
```typescript
// On app load
checkAuthModeAndIfUserAuthentificated():
  1. Try Next.js session endpoint first
  2. Fallback to Angular cookies if fails
  3. Store mode + token in AuthFacade (NgRx)
```

## Auth Interceptor

**Location**: `@shared/utils/interceptors/auth.interceptor.ts`

### Token Routing Logic
```typescript
// Routes using API token (environment.apiTokenV1)
apiTokenRoutes = ['/api/auth/local', '/api/auth/google/callback'];

// Routes skipping auth header
unauthenticatedRoutes = ['maps.googleapis.com'];

// All other routes → use authFacade.token$ from NgRx
```

### Header Injection
```typescript
request.clone({
  setHeaders: { Authorization: `Bearer ${token}` }
});
```

## Query Building

**Location**: `@shared/utils/helpers/query-helpers.ts`

### Core Functions
| Function | Output |
|----------|--------|
| `addFilter(field, value)` | `filters[field][$eq]=value` |
| `addSubElementFilter(el, sub, val)` | `filters[el][sub][$eq]=val` |
| `getPopulateQueryParam(fields)` | `populate[0]=field` |
| `pagination(page, size)` | `pagination[page]=1&pageSize=10` |
| `getSortQueryParam(arr)` | `sort[0]=field:desc` |

### Example Query
```
GET /api/klub-projets/?
  filters[klubr][uuid][$eq]=abc-123
  &populate[0]=couverture
  &populate[1]=klubr_membre.avatar
  &sort[0]=status:desc
  &pagination[page]=1&pagination[pageSize]=9
```

## Cache Invalidation

**Location**: `@shared/services/invalidate-cache.service.ts`

After mutations, invalidate Next.js ISR cache:
```typescript
// In GenericUpdateComponent
cacheToUnvalidate(): string[] {
  return ['klubr', 'projects'];
}

// Calls POST /api/revalidate with paths
```

## NgRx State Access

### AuthFacade Observables
```typescript
token$: Observable<string>
isAuthenticated$: Observable<boolean>
authMode$: Observable<'angular' | 'nextJs'>
```

### Usage in Components
```typescript
private authFacade = inject(AuthFacade);
private token = toSignal(this.authFacade.token$);
```
