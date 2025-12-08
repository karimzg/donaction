# Backend Communication

## API Client Setup

### Base Configuration

@donaction-frontend/src/core/services/endpoints.ts
@donaction-frontend/src/core/services/index.ts

- Environment URLs via `process.env`
- `NEXT_PUBLIC_API_URL` for Strapi backend
- `NEXT_PUBLIC_SERVER_COMPONENTS_DEV_API_URL` for server-side calls
- `NEXT_PUBLIC_SITE_URL` for internal Next.js routes

### HTTP Service

**Location**: `src/core/services/index.ts`

**Core Features**:
- Native `fetch` API wrapper
- Automatic Bearer token injection via `NEXT_PUBLIC_STRAPI_API_TOKEN`
- SSR/CSR URL switching based on `typeof window === 'undefined'`
- FormData support with `isFormData` flag
- Response type handling: `json` (default) | `blob`
- Next.js revalidation tags support via `tags` array
- Cache control with `noCache` flag and `cache` option

**Request Interface**:
```typescript
ExecutorInterface {
  endPoint: string
  method?: 'get' | 'post' | 'put' | 'delete'
  data?: Record<string, any>
  headers?: Record<string, any>
  isFormData?: boolean
  responseType?: 'blob' | 'json'
  tags?: Array<string>
  noCache?: boolean
  cookies?: string
  useDefaultHttp?: boolean
}
```

## Authentication Flow

### NextAuth Integration

@donaction-frontend/src/app/api/auth/[...nextauth]/route.ts

**Providers**:
- Google OAuth via `GoogleProvider`
- Credentials (email/password) via `CredentialsProvider`

**Session Strategy**: JWT-based, 30-day expiry

**Token Flow**:
1. `authorize()` calls backend `/api/auth/local` (credentials) or Google callback
2. JWT stored in token with user ID
3. Session callback fetches fresh user data via `me()` endpoint
4. Updates `lastLogin` timestamp on each session refresh

**Key Callbacks**:
- `jwt()`: Stores backend JWT and user ID in NextAuth token
- `session()`: Fetches current user data from Strapi using stored JWT

### Auth Service Layer

@donaction-frontend/src/core/services/auth/index.ts

**Endpoints**:
- `me()` - GET `/api/users/me` with role, klubr_membres, avatar
- `login()` - POST `/api/strapi-auth/local`
- `register()` - POST `/api/strapi-auth/local/register`
- `postForgotPassword()` - POST `/api/strapi-auth/forgot-password`
- `postResetPassword()` - POST `/api/strapi-auth/reset-password`
- `changePassword()` - POST `/api/strapi-auth/change-password`
- `update()` - PUT `/api/users/:id`
- `updateUserImg()` - POST `/api/medias/user/:uuid/files` (FormData)
- `uploadCompanyLogo()` - POST `/api/medias/klubr-donateur/:uuid/files` (FormData)
- `checkUserExistence()` - GET `/api/users-permissions/users/exists/:email`
- `getAvatars()` - GET `/api/medias/avatars/:type`

### State Management

@donaction-frontend/src/core/store/modules/authSlice.ts

- Redux Toolkit slice for session state
- Stores NextAuth session data
- Status: `'loading'` | `'authenticated'` | `'unauthenticated'`

## API Patterns

### Endpoint Organization

@donaction-frontend/src/core/services/endpoints.ts

**Strapi Entities**:
- Clubs: `/api/klubrs`
- Projects: `/api/klub-projets`
- Donations: `/api/klub-dons`
- Donors: `/api/klubr-donateurs`
- CMS: `/api/page-*`, `/api/cgu*`, `/api/page-cookie`

**Naming Convention**: `GET_<ENTITY>_<ACTION>`
- `GET_KLUB_BY_SLUG(slug)` returns parameterized endpoint string
- Functions accept pagination: `page`, `pageSize`
- UUID vs slug variants for flexible querying

### Service Modules

**Club Service** - `src/core/services/club/index.ts`:
- `getAllClubs()`, `getClubDetailBySlug()`, `getClubHouse()`
- Preview mode support with `isPreview` flag
- Tags: `TagsEnum.Club_ClubHouse_Slugs`, `TagsEnum.AllClubs`

**Project Service** - `src/core/services/projet/index.ts`:
- `getProjets()`, `getProjetDetail()`, `getProjetsByKlub()`
- Tags: `TagsEnum.PROJECTS`, `TagsEnum.GetProjectDetail`

**Donation Service** - `src/core/services/don/index.ts`:
- `getDonsByKlubOrProjet()`, `postDon()`, `putDon()`
- Payment: `createKlubDonPayment()`, `updateKlubDonPayment()`
- Tags: `TagsEnum.DONATIONS`, `TagsEnum.GetMyDonations`

**Donor Service** - `src/core/services/donateur/index.ts`:
- `getDonateur()`, `postDonateur()`, `putDonateur()`

**CMS Service** - `src/core/services/cms/index.ts`:
- `getHp()`, `getMecenat()`, `getCGU()`, `getCookies()`
- Forms: `postContactUs()`, `postNewsletters()`
- reCAPTCHA integration via `grecaptcha.enterprise`

## Data Fetching Strategies

### SSR with Revalidation Tags

- Server Components use `tags` for on-demand revalidation
- Tags organized by entity group (e.g., `TagsEnum.Club_ClubHouse_Slugs`)
- Cache bypass with `noCache: true` for authenticated/preview content

### CSR with Redux

- Client-side state in Redux for user session
- React hooks fetch data directly via service functions
- Cookie forwarding for SSR context: `cookies().toString()`

### Hybrid: Next.js API Routes as Proxy

@donaction-frontend/src/app/api/[...fetch]/route.ts

**Purpose**: Unified proxy for all Strapi requests

**Features**:
- Rewrites `/strapi-auth` to `/auth`
- Token switching: user JWT vs API token based on endpoint
- User endpoints: `/api/users`, `/api/klub-dons/my-dons`, `/api/klubr-donateurs/my-last`
- Preview mode detection via `isPreviewMode` cookie
- Blob response streaming for file downloads
- Automatic `Strapi-Response-Format: v4` header

**Token Logic**:
```typescript
// User-specific endpoints use NextAuth JWT
if (USER_TOKEN_ENDPOINTS.includes(endpoint)) {
  const token = await getToken({ req })
  TOKEN = token?.jwt || API_TOKEN
}
```

## External Integrations

### Stripe Payment

@donaction-frontend/src/app/api/create-payment-intent/route.ts

- Endpoint: `/api/create-payment-intent`
- Creates Stripe PaymentIntent via server-side Stripe SDK
- Converts price to cents (multiply by 100)
- Currency: EUR
- Client receives `client_secret` for Stripe Elements

### Google OAuth

- Provider: `next-auth/providers/google`
- Callback URL: `${BACKEND}/api/auth/google/callback?access_token=<token>`
- Backend returns JWT, stored in NextAuth session

## Error Handling

- HTTP Service: Promise rejection with raw response
- API Routes: Status codes preserved, JSON error responses
- Session errors: `logout: true` flag triggers client-side logout

## Cache Strategy

- Public content: Default Next.js caching with tags
- Authenticated: `cache: 'no-cache'`
- Preview mode: Always `noCache: true`
- Blob responses: No cache

## Key Dependencies

@donaction-frontend/package.json

- `next` ^14
- `next-auth` ^4
- `@stripe/stripe-js` ^2
- `@stripe/react-stripe-js` ^2
- `stripe` ^14
- `@reduxjs/toolkit` ^2
- `react-redux` ^9
