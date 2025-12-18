# Frontend Backend Communication Reference

## HttpService Interface

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

### URL Switching
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

## NextAuth Token Flow

**Location**: `src/app/api/auth/[...nextauth]/route.ts`

### JWT Callback
```typescript
jwt({ token, user, account }) {
  if (user) {
    token.jwt = user.jwt;      // Strapi JWT
    token.id = user.id;        // User ID
  }
  return token;
}
```

### Session Callback
```typescript
session({ session, token }) {
  // Fetch fresh user data
  const userData = await me(token.jwt);
  session.user = userData;
  return session;
}
```

## Strapi Proxy

**Location**: `src/app/api/[...fetch]/route.ts`

### Token Selection Logic
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

### Path Rewriting
```typescript
// Frontend path → Strapi path
'/strapi-auth/local' → '/auth/local'
'/strapi-auth/forgot-password' → '/auth/forgot-password'
```

## Revalidation Tags

### Usage in Services
```typescript
export async function getClub(slug: string, cookies?: string) {
  return HttpService.ExecuteRequest({
    endPoint: GET_KLUB_BY_SLUG(slug),
    tags: [TagsEnum.Club, TagsEnum.Club_ClubHouse_Slugs],
    cookies,
  });
}
```

### On-Demand Revalidation
```typescript
// POST /api/revalidate
export async function POST(request: Request) {
  const { tags } = await request.json();
  tags.forEach(tag => revalidateTag(tag));
  return NextResponse.json({ revalidated: true });
}
```

## Cookie Forwarding (SSR)

```typescript
// In Server Component
import { cookies } from 'next/headers';

const data = await getClub(slug, cookies().toString());
```

## Stripe Payment Flow

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
