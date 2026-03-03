### Frontend - Donaction

> **Version**: 2.0.0 | **Last Updated**: 2025-12-18

#### Context
Next.js 14 public-facing website for donors. Handles club discovery, donation flows, payment processing via Stripe, user authentication via NextAuth, and donor dashboards.

#### Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **UI**: TailwindCSS 3, PrimeReact 10
- **State**: Redux Toolkit 2
- **Auth**: NextAuth 4
- **Payments**: Stripe 14

#### Commands
| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port 3100 |
| `yarn lint` | ESLint check |
| `yarn format` | Prettier format |
| `yarn build` | Production build |

#### Folder Structure
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

#### Rules

##### Naming Conventions
See `@docs/rules/frontend/naming-conventions.md` for file, component, function, variable, constant, and type naming standards.

##### Server vs Client Components
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

##### Component Boundaries
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

##### Data Fetching
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

##### API Routes
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

##### State Management (Redux)
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

##### Authentication (NextAuth)
- [AUTH] Providers: Google OAuth, Credentials
- [AUTH] JWT strategy with 30-day expiry
- [AUTH] Access token in `jwt` callback, user in `session` callback
- [AUTH] Protected routes via middleware matcher

##### Forms
- [FORM] Use custom hooks for complex forms: `useLoginForm`
- [FORM] Track validation with `receivedFeedbacks` ref
- [FORM] Show inline errors below inputs
- [FORM] Toast notifications for API errors
- [FORM] reCAPTCHA via `grecaptcha.enterprise`

##### Stripe Integration
- [PAY] Create payment intent in API route, not client
- [PAY] Return `client_secret` to frontend
- [PAY] Use `@stripe/react-stripe-js` for Elements
- [PAY] Convert amount to cents

##### Typing
- [TS] Strict mode enabled
- [TS] Path aliases: `@/components/*`, `@/helpers/*`, `@/*`
- [TS] Type page params explicitly
- [TS] Export types from `core/models/`

##### Styling
- [STYLE] TailwindCSS utilities + SCSS for complex components
- [STYLE] Custom theme in `config/theme.json`
- [STYLE] Design tokens: primary (#000), secondary (#73cfa8), tertiary (#fb9289)

#### Anti-Patterns
| ❌ Don't | ✅ Do | Why |
|----------|-------|-----|
| `'use client'` at top of tree | Push client boundary down | Performance |
| Import Server into Client | Compose via children | RSC rules |
| Fetch in useEffect | Fetch in Server Component | Better perf |
| Direct fetch calls | Use HttpService | Consistency |
| Form state everywhere | Custom hooks | Reusability |
| Expose Stripe secret | Server-side only | Security |

#### Key Files
| Path | Purpose |
|------|---------|
| `app/Providers.tsx` | Redux + NextAuth + PrimeReact |
| `app/api/[...fetch]/route.ts` | Strapi proxy |
| `app/api/auth/[...nextauth]/route.ts` | NextAuth handler |
| `core/services/index.ts` | HttpService |
| `core/services/endpoints.ts` | API endpoints |
| `middleware.ts` | Route protection |

#### Reference Files
| File | When to consult |
|------|-----------------|
| `FORMS.md` | Validation patterns, feedback refs |
| `BACKEND_COMMUNICATION.md` | NextAuth flow, Stripe setup, proxy |

#### Skills
Detailed patterns in `@aidd/skills/frontend/`:
- `server-components.md` - Async data fetching
- `client-components.md` - Interactivity patterns
- `data-fetching.md` - HttpService, tags, cache
- `redux-slice.md` - State management


### Frontend Backend Communication Reference

#### HttpService Interface

**Location**: `src/core/services/index.ts`

```typescript
interface ExecutorInterface {
  endPoint: string;
  method?: 'get' | 'post' | 'put' | 'delete';
  data?: Record<string, any>;
  headers?: Record<string, any>;
  isFormData?: boolean;
  responseType?: 'blob' | 'json';
  tags?: Array<string>;        // Revalidation tags
  noCache?: boolean;           // Bypass cache
  cookies?: string;            // SSR cookie forwarding
}
```

##### URL Switching
```typescript
// Server-side (SSR)
if (typeof window === 'undefined') {
  baseUrl = process.env.NEXT_PUBLIC_SERVER_COMPONENTS_DEV_API_URL;
}
// Client-side (CSR)
else {
  baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
}
```

#### NextAuth Token Flow

**Location**: `src/app/api/auth/[...nextauth]/route.ts`

##### JWT Callback
```typescript
jwt({ token, user, account }) {
  if (user) {
    token.jwt = user.jwt;      // Strapi JWT
    token.id = user.id;        // User ID
  }
  return token;
}
```

##### Session Callback
```typescript
session({ session, token }) {
  // Fetch fresh user data
  const userData = await me(token.jwt);
  session.user = userData;
  return session;
}
```

#### Strapi Proxy

**Location**: `src/app/api/[...fetch]/route.ts`

##### Token Selection Logic
```typescript
const USER_TOKEN_ENDPOINTS = [
  '/api/users',
  '/api/klub-dons/my-dons',
  '/api/klubr-donateurs/my-last'
];

if (USER_TOKEN_ENDPOINTS.includes(endpoint)) {
  const token = await getToken({ req });
  TOKEN = token?.jwt || API_TOKEN;  // User JWT or fallback
} else {
  TOKEN = API_TOKEN;  // System token
}
```

##### Path Rewriting
```typescript
// Frontend path → Strapi path
'/strapi-auth/local' → '/auth/local'
'/strapi-auth/forgot-password' → '/auth/forgot-password'
```

#### Revalidation Tags

##### Usage in Services
```typescript
export async function getClub(slug: string, cookies?: string) {
  return HttpService.ExecuteRequest({
    endPoint: GET_KLUB_BY_SLUG(slug),
    tags: [TagsEnum.Club, TagsEnum.Club_ClubHouse_Slugs],
    cookies,
  });
}
```

##### On-Demand Revalidation
```typescript
// POST /api/revalidate
export async function POST(request: Request) {
  const { tags } = await request.json();
  tags.forEach(tag => revalidateTag(tag));
  return NextResponse.json({ revalidated: true });
}
```

#### Cookie Forwarding (SSR)

```typescript
// In Server Component
import { cookies } from 'next/headers';

const data = await getClub(slug, cookies().toString());
```

#### Stripe Payment Flow

1. **Create Intent** (server): `POST /api/create-payment-intent`
2. **Receive** `client_secret`
3. **Confirm** via `@stripe/react-stripe-js` Elements
4. **Update Status**: `POST /klub-don-payments/check`

```typescript
// API Route
const paymentIntent = await stripe.paymentIntents.create({
  amount: price * 100,  // Convert to cents
  currency: 'eur',
});
return NextResponse.json({ clientSecret: paymentIntent.client_secret });
```


### Frontend Forms Reference

#### Validation Functions

Located in `validations.ts`:

| Function | Purpose |
|----------|---------|
| `validateEmail(value)` | Email format (regex) |
| `validateRequired(value)` | Non-empty check |
| `validateString(value)` | String format |
| `validatePassword(value)` | Password strength |
| `validateSame(val1, val2)` | Field match |
| `validateTrue(value)` | Boolean true |
| `validateSiren(value)` | SIREN format (9 digits) |
| `validateAmount(value)` | Numeric amount |
| `validateDate(value)` | Date format |
| `validateDateMajor(value)` | Age 18+ check |
| `validateSelection(value)` | Selection made |

#### Regex Patterns

```typescript
emailRexExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
sirenRexExp = /^\d{9}$/
stringRexExp = /^[a-zA-ZÀ-ÿ\s'-]+$/
stringWithoutNumbersRexExp = /^[^\d]+$/
```

#### Feedback Pattern

##### Structure
```typescript
interface Feedback {
  attribute: string;      // Field name
  cast: Constructor;      // String, Number, Boolean
  isValid: boolean;
}
```

##### Collection Flow
```typescript
// In custom hook (e.g., useSponsorshipForm)
const receivedFeedbacks = useRef<Feedback[]>([]);

const DEFAULT_FEEDBACK = (feedback: Feedback) => {
  receivedFeedbacks.current.push(feedback);
  // Update defaultValues in config
  // Check email existence if needed
};
```

##### Validation Trigger
```typescript
// Increment counter to trigger all fields
const [triggerValidation, setTriggerValidation] = useState(0);

// On submit
receivedFeedbacks.current = []; // Clear
setTriggerValidation(prev => prev + 1); // Trigger

// Wait for async validation
process.nextTick(() => {
  const allValid = receivedFeedbacks.current.every(f => f.isValid);
  if (allValid) submitForm();
});
```

#### Error Display

```tsx
<input
  className={error ? 'invalid' : 'valid'}
  onBlur={handleValidation}
/>
{error && <small className="error">{error}</small>}
```

#### reCAPTCHA Integration

```typescript
const token = await grecaptcha.enterprise.execute(
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  { action: 'submit_donation' }
);

// Include in API call
await postDon({ ...formData, recaptchaToken: token });
```
