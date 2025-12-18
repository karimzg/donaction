# Frontend - Donaction

> **Version**: 2.0.0 | **Last Updated**: 2025-12-18

## Context
Next.js 14 public-facing website for donors. Handles club discovery, donation flows, payment processing via Stripe, user authentication via NextAuth, and donor dashboards.

## Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **UI**: TailwindCSS 3, PrimeReact 10
- **State**: Redux Toolkit 2
- **Auth**: NextAuth 4
- **Payments**: Stripe 14

## Commands
| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port 3100 |
| `yarn lint` | ESLint check |
| `yarn format` | Prettier format |
| `yarn build` | Production build |

## Folder Structure
```
src/
├── app/                    # App Router pages
│   ├── (auth)/            # Auth route group
│   ├── (main)/            # Public route group
│   ├── [slug]/            # Dynamic club pages
│   └── api/               # API routes
├── core/
│   ├── services/          # API communication
│   ├── store/modules/     # Redux slices
│   ├── models/            # TypeScript types
│   ├── hooks/             # Custom hooks
│   └── helpers/           # Utilities
├── layouts/
│   ├── partials/          # Page sections
│   └── components/        # Reusable UI
```

## Rules

### Naming Conventions
See `@docs/rules/frontend/naming-conventions.md` for file, component, function, variable, constant, and type naming standards.

### Server vs Client Components
- [COMP] All components are Server Components by default
- [COMP] Add `'use client'` only when needed for interactivity
- [COMP] Server Components: async, direct API calls, no hooks
- [COMP] Client Components: useState, useEffect, event handlers
```typescript
// Server Component (default)
export default async function ClubPage({ params }) {
  const club = await getClubBySlug(params.slug);
  return <ClubView data={club} />;
}

// Client Component
'use client';
export function DonateButton({ clubId }) {
  const [loading, setLoading] = useState(false);
  // ...
}
```

### Component Boundaries
- [BOUND] Place `'use client'` as low as possible in tree
- [BOUND] Pass Server Components as children to Client
- [BOUND] Never import Server Components into Client directly
```typescript
// ✅ Correct - composition
<ClientWrapper>
  <ServerContent />  {/* Passed as children */}
</ClientWrapper>

// ❌ Wrong - direct import in client
'use client';
import ServerComponent from './ServerComponent'; // Will fail
```

### Data Fetching
- [FETCH] Use `HttpService.ExecuteRequest` for all API calls
- [FETCH] Use revalidation tags for cache invalidation
- [FETCH] Use `cache: 'no-cache'` for authenticated requests
- [FETCH] Forward cookies for SSR: `cookies().toString()`
```typescript
// Service layer
export async function getClub(slug: string, cookies?: string) {
  return HttpService.ExecuteRequest({
    endPoint: GET_KLUB_BY_SLUG(slug),
    tags: [TagsEnum.Club],
    cookies,
  });
}

// Server Component
const club = await getClub(slug, cookies().toString());
```

### API Routes
- [API] Create `route.ts` in `app/api/` directory
- [API] Export named functions: GET, POST, PUT, DELETE
- [API] Use `[...fetch]` catch-all for Strapi proxy
- [API] Switch tokens based on endpoint (user vs system)
```typescript
export async function GET(request: NextRequest) {
  const data = await fetchFromStrapi();
  return NextResponse.json(data);
}
```

### State Management (Redux)
- [STATE] Use Redux Toolkit slices in `core/store/modules/`
- [STATE] Use typed hooks: `useAppDispatch`, `useAppSelector`
- [STATE] Keep form state local, global only for shared data
- [STATE] Dispatch actions on form success
```typescript
// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: { setSession, clearSession }
});

// Component
const session = useAppSelector(state => state.auth.session);
dispatch(setSession(data));
```

### Authentication (NextAuth)
- [AUTH] Providers: Google OAuth, Credentials
- [AUTH] JWT strategy with 30-day expiry
- [AUTH] Access token in `jwt` callback, user in `session` callback
- [AUTH] Protected routes via middleware matcher

### Forms
- [FORM] Use custom hooks for complex forms: `useLoginForm`
- [FORM] Track validation with `receivedFeedbacks` ref
- [FORM] Show inline errors below inputs
- [FORM] Toast notifications for API errors
- [FORM] reCAPTCHA via `grecaptcha.enterprise`

### Stripe Integration
- [PAY] Create payment intent in API route, not client
- [PAY] Return `client_secret` to frontend
- [PAY] Use `@stripe/react-stripe-js` for Elements
- [PAY] Convert amount to cents

### Typing
- [TS] Strict mode enabled
- [TS] Path aliases: `@/components/*`, `@/helpers/*`, `@/*`
- [TS] Type page params explicitly
- [TS] Export types from `core/models/`

### Styling
- [STYLE] TailwindCSS utilities + SCSS for complex components
- [STYLE] Custom theme in `config/theme.json`
- [STYLE] Design tokens: primary (#000), secondary (#73cfa8), tertiary (#fb9289)

## Anti-Patterns
| ❌ Don't | ✅ Do | Why |
|----------|-------|-----|
| `'use client'` at top of tree | Push client boundary down | Performance |
| Import Server into Client | Compose via children | RSC rules |
| Fetch in useEffect | Fetch in Server Component | Better perf |
| Direct fetch calls | Use HttpService | Consistency |
| Form state everywhere | Custom hooks | Reusability |
| Expose Stripe secret | Server-side only | Security |

## Key Files
| Path | Purpose |
|------|---------|
| `app/Providers.tsx` | Redux + NextAuth + PrimeReact |
| `app/api/[...fetch]/route.ts` | Strapi proxy |
| `app/api/auth/[...nextauth]/route.ts` | NextAuth handler |
| `core/services/index.ts` | HttpService |
| `core/services/endpoints.ts` | API endpoints |
| `middleware.ts` | Route protection |

## Reference Files
| File | When to consult |
|------|-----------------|
| `FORMS.md` | Validation patterns, feedback refs |
| `BACKEND_COMMUNICATION.md` | NextAuth flow, Stripe setup, proxy |

## Skills
Detailed patterns in `@aidd/skills/frontend/`:
- `server-components.md` - Async data fetching
- `client-components.md` - Interactivity patterns
- `data-fetching.md` - HttpService, tags, cache
- `redux-slice.md` - State management
