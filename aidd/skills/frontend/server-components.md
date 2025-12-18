# Skill: Next.js Server Components

## When to use
When building pages or components that fetch data, access backend resources, or don't need client-side interactivity.

## Key Concepts
- **Default in App Router**: All components are Server Components unless marked with `'use client'`
- **Async allowed**: Can use `async/await` directly in component
- **No hooks**: Cannot use useState, useEffect, or event handlers
- **Direct data access**: Can call APIs, databases, read files

## Recommended Patterns

### Basic Data Fetching
```tsx
// app/(main)/clubs/page.tsx
// No 'use client' = Server Component by default

import { getAllClubs } from '@/core/services/club';
import { ClubCard } from '@/layouts/partials/clubPage/clubCard';

export default async function ClubsPage() {
  const clubs = await getAllClubs();

  return (
    <div className="grid grid-cols-3 gap-4">
      {clubs.data.map((club) => (
        <ClubCard key={club.id} club={club} />
      ))}
    </div>
  );
}
```
**Why**: Data fetching happens at build/request time on server, faster initial load.

### With Cookie Forwarding (Auth)
```tsx
// app/(main)/mes-dons/page.tsx
import { cookies } from 'next/headers';
import { getMyDonations } from '@/core/services/don';

export default async function MyDonationsPage() {
  // Forward cookies for authenticated request
  const donations = await getMyDonations(cookies().toString());

  if (!donations.data.length) {
    return <p>Aucun don trouvé</p>;
  }

  return (
    <ul>
      {donations.data.map((don) => (
        <li key={don.id}>{don.montant}€ - {don.klubr.name}</li>
      ))}
    </ul>
  );
}
```
**Why**: Server Components can access cookies directly for SSR auth.

### Dynamic Route with Params
```tsx
// app/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getClubBySlug } from '@/core/services/club';
import { ClubView } from '@/layouts/partials/clubPage';

interface Props {
  params: { slug: string };
}

export default async function ClubPage({ params }: Props) {
  const club = await getClubBySlug(params.slug);

  if (!club.data) {
    notFound();
  }

  return <ClubView club={club.data} />;
}

// Generate static paths at build time
export async function generateStaticParams() {
  const clubs = await getAllClubs();
  return clubs.data.map((club) => ({
    slug: club.slug,
  }));
}
```
**Why**: Static generation with dynamic routes for SEO and performance.

### Parallel Data Fetching
```tsx
// app/[slug]/page.tsx
export default async function ClubPage({ params }: Props) {
  // Fetch in parallel - don't await sequentially
  const [club, projects, donations] = await Promise.all([
    getClubBySlug(params.slug),
    getProjectsByClub(params.slug),
    getDonationsByClub(params.slug),
  ]);

  return (
    <>
      <ClubHeader club={club.data} />
      <ProjectsList projects={projects.data} />
      <DonationStats donations={donations.data} />
    </>
  );
}
```
**Why**: Parallel fetching reduces total load time.

### Composing with Client Components
```tsx
// Server Component
import { getClub } from '@/core/services/club';
import { DonateButton } from '@/layouts/components/donateButton'; // Client

export default async function ClubPage({ params }) {
  const club = await getClub(params.slug);

  return (
    <div>
      <h1>{club.data.name}</h1>
      {/* Pass data to client component */}
      <DonateButton clubId={club.data.documentId} />
    </div>
  );
}

// Client Component (separate file)
'use client';
export function DonateButton({ clubId }: { clubId: string }) {
  const [loading, setLoading] = useState(false);
  // Interactive logic here
}
```
**Why**: Keep interactivity in small client components, data fetching in server.

## Detailed Anti-patterns

### ❌ Using Hooks in Server Components
```tsx
// Wrong - Server Components can't use hooks
export default async function Page() {
  const [data, setData] = useState(null); // Error!
  useEffect(() => { ... }, []); // Error!
}
```
**Problem**: Server Components run on server, no React state.
**Solution**: Use Client Component for hooks, or fetch data directly.

### ❌ Sequential Awaits
```tsx
// Wrong - Waterfall fetching
export default async function Page() {
  const club = await getClub(slug);      // Wait...
  const projects = await getProjects();   // Then wait...
  const donations = await getDonations(); // Then wait...
}
```
**Problem**: Total time = sum of all fetches.
**Solution**: `Promise.all([...])` for parallel fetching.

### ❌ Forgetting notFound()
```tsx
// Wrong - Returns undefined data
export default async function Page({ params }) {
  const club = await getClub(params.slug);
  return <ClubView club={club.data} />; // club.data might be null
}
```
**Problem**: Renders with null data, crashes or shows empty.
**Solution**: Check and call `notFound()` from `next/navigation`.

## Checklist
- [ ] No 'use client' directive (default is server)
- [ ] Using async/await for data fetching
- [ ] No useState, useEffect, or event handlers
- [ ] Parallel fetching with Promise.all
- [ ] Cookie forwarding for auth requests
- [ ] notFound() for missing resources
- [ ] Client components for interactivity only
