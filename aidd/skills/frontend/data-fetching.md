---
name: skill:fetching-data
description: Fetches data from Strapi API with caching and revalidation. Use when building data services in donaction-frontend.
model: claude-sonnet-4-5
---

# Skill: Next.js Data Fetching

## When to use
When fetching data from Strapi API in Server Components, with proper caching and revalidation.

## Key Concepts
- Use `HttpService.ExecuteRequest` wrapper
- Tag requests for on-demand revalidation
- Forward cookies for authenticated SSR
- Cache public data, skip cache for auth

## Recommended Patterns

### HttpService Configuration
```typescript
// core/services/index.ts
interface ExecutorInterface {
  endPoint: string;
  method?: 'get' | 'post' | 'put' | 'delete';
  data?: Record<string, any>;
  tags?: Array<string>;     // Revalidation tags
  noCache?: boolean;        // Skip cache
  cookies?: string;         // SSR cookie forwarding
  isFormData?: boolean;
  responseType?: 'blob' | 'json';
}

export const HttpService = {
  async ExecuteRequest<T>(params: ExecutorInterface): Promise<T> {
    const baseUrl = typeof window === 'undefined'
      ? process.env.NEXT_PUBLIC_SERVER_COMPONENTS_DEV_API_URL
      : process.env.NEXT_PUBLIC_SITE_URL;

    const response = await fetch(`${baseUrl}${params.endPoint}`, {
      method: params.method || 'get',
      headers: {
        'Content-Type': 'application/json',
        ...(params.cookies && { Cookie: params.cookies }),
      },
      body: params.data ? JSON.stringify(params.data) : undefined,
      next: {
        tags: params.tags || [],
        revalidate: params.noCache ? 0 : undefined,
      },
      cache: params.noCache ? 'no-cache' : undefined,
    });

    return response.json();
  },
};
```
**Why**: Centralized fetch with Next.js caching integration.

### Service Layer Pattern
```typescript
// core/services/club/index.ts
import { HttpService } from '@/core/services';
import { TagsEnum } from '@/core/enum/tagsEnum';
import { GET_KLUBRS, GET_KLUB_BY_SLUG } from '../endpoints';

export async function getAllClubs(page = 1, pageSize = 25) {
  return HttpService.ExecuteRequest<ApiListResponse<Club>>({
    endPoint: GET_KLUBRS(page, pageSize),
    tags: [TagsEnum.AllClubs],
  });
}

export async function getClubBySlug(slug: string, cookies?: string) {
  return HttpService.ExecuteRequest<ApiResponse<Club>>({
    endPoint: GET_KLUB_BY_SLUG(slug),
    tags: [TagsEnum.Club, TagsEnum.Club_ClubHouse_Slugs],
    cookies,
  });
}

// Authenticated endpoint
export async function getMyClubs(cookies: string) {
  return HttpService.ExecuteRequest<ApiListResponse<Club>>({
    endPoint: '/api/klubrs/my-clubs',
    tags: [TagsEnum.MyClubs],
    cookies,
    noCache: true, // Skip cache for user-specific data
  });
}
```
**Why**: Services abstract API calls with proper tags and auth handling.

### In Server Components
```tsx
// app/(main)/clubs/page.tsx
import { cookies } from 'next/headers';
import { getAllClubs } from '@/core/services/club';

export default async function ClubsPage() {
  // Public data - cached
  const clubs = await getAllClubs();

  return <ClubsList clubs={clubs.data} />;
}

// app/(main)/mes-clubs/page.tsx
export default async function MyClubsPage() {
  // Authenticated - forward cookies
  const myClubs = await getMyClubs(cookies().toString());

  return <MyClubsList clubs={myClubs.data} />;
}
```
**Why**: Server Components fetch directly, no loading states.

### Revalidation Tags
```typescript
// core/enum/tagsEnum.ts
export enum TagsEnum {
  AllClubs = 'all-clubs',
  Club = 'club',
  Club_ClubHouse_Slugs = 'club-clubhouse-slugs',
  MyClubs = 'my-clubs',
  PROJECTS = 'projects',
  GetProjectDetail = 'project-detail',
  DONATIONS = 'donations',
  GetMyDonations = 'my-donations',
}
```

### On-Demand Revalidation
```typescript
// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { tags } = await request.json();

  if (!tags || !Array.isArray(tags)) {
    return NextResponse.json({ error: 'Tags required' }, { status: 400 });
  }

  tags.forEach((tag) => revalidateTag(tag));

  return NextResponse.json({ revalidated: true, tags });
}

// Called from admin after mutations
// POST /api/revalidate { tags: ['club', 'all-clubs'] }
```
**Why**: Invalidate specific cached data without full rebuild.

### Parallel Fetching
```tsx
// app/[slug]/page.tsx
export default async function ClubPage({ params }) {
  // Parallel fetch - much faster
  const [club, projects, donations] = await Promise.all([
    getClubBySlug(params.slug),
    getProjectsByClub(params.slug),
    getDonationStats(params.slug),
  ]);

  return (
    <>
      <ClubHeader club={club.data} />
      <ProjectsSection projects={projects.data} />
      <DonationsStats stats={donations.data} />
    </>
  );
}
```
**Why**: Parallel fetching reduces total request time.

### Error Handling
```tsx
// app/[slug]/page.tsx
import { notFound, redirect } from 'next/navigation';

export default async function ClubPage({ params }) {
  try {
    const club = await getClubBySlug(params.slug);

    if (!club.data) {
      notFound();
    }

    if (club.data.status === 'inactive') {
      redirect('/clubs');
    }

    return <ClubView club={club.data} />;
  } catch (error) {
    // Log error, show fallback
    console.error('Failed to fetch club:', error);
    notFound();
  }
}
```
**Why**: Graceful handling with proper HTTP responses.

## Detailed Anti-patterns

### ❌ Forgetting Tags
```typescript
// Wrong - No cache invalidation possible
export async function getClub(slug: string) {
  return HttpService.ExecuteRequest({
    endPoint: `/api/klubrs/${slug}`,
    // Missing tags!
  });
}
```
**Problem**: Can't invalidate when data changes.
**Solution**: Always include relevant tags.

### ❌ Caching User Data
```typescript
// Wrong - User data cached across users
export async function getMyProfile(cookies: string) {
  return HttpService.ExecuteRequest({
    endPoint: '/api/users/me',
    cookies,
    // Missing noCache: true
  });
}
```
**Problem**: One user might see another's data.
**Solution**: `noCache: true` for user-specific data.

### ❌ Sequential Fetching
```typescript
// Wrong - Waterfall
const club = await getClub(slug);
const projects = await getProjects(club.id); // Waits for club
const donations = await getDonations(club.id); // Waits for projects
```
**Problem**: Total time = sum of all requests.
**Solution**: `Promise.all()` for independent requests.

## Checklist
- [ ] Using HttpService wrapper
- [ ] Tags on all cacheable requests
- [ ] noCache for user-specific data
- [ ] Cookie forwarding for auth
- [ ] Parallel fetching where possible
- [ ] Error handling with notFound/redirect
