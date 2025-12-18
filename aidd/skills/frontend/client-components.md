---
name: "nextjs-client-components"
description: "Create Next.js client components with hooks, event handlers, and browser APIs"
triggers: ["client component", "use client", "useState", "useEffect", "interactive", "onClick"]
tags: ["nextjs", "react", "frontend", "typescript", "client"]
priority: high
scope: file
output: code
---

# Skill: Next.js Client Components

## When to use
When building interactive UI that requires:
- React hooks (useState, useEffect, useRef)
- Event handlers (onClick, onChange, onSubmit)
- Browser APIs (window, localStorage)
- Third-party client libraries (Stripe Elements, Maps)

## Key Concepts
- Mark with `'use client'` at file top
- Runs in browser after hydration
- Can use hooks and event handlers
- Keep as small as possible for performance

## Recommended Patterns

### Basic Interactive Component
```tsx
// layouts/components/donateButton/index.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  clubId: string;
  defaultAmount?: number;
}

export function DonateButton({ clubId, defaultAmount = 50 }: Props) {
  const [amount, setAmount] = useState(defaultAmount);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDonate = async () => {
    setLoading(true);
    try {
      // Navigate to donation form
      router.push(`/don/${clubId}?amount=${amount}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="border rounded px-2"
      />
      <button
        onClick={handleDonate}
        disabled={loading}
        className="btn-primary"
      >
        {loading ? 'Chargement...' : 'Faire un don'}
      </button>
    </div>
  );
}
```
**Why**: Only the interactive parts are client-side, rest stays server.

### Form with Validation
```tsx
// layouts/partials/authentication/loginForm/index.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useAppDispatch } from '@/core/store/hooks';
import { pushToast } from '@/core/store/modules/rootSlice';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        dispatch(pushToast({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Email ou mot de passe incorrect',
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  );
}
```
**Why**: Forms need state management and event handlers.

### Receiving Server Data as Props
```tsx
// Client component receives serializable data
'use client';

import { useState } from 'react';

interface Club {
  id: number;
  documentId: string;
  name: string;
  description: string;
}

interface Props {
  club: Club; // Data from Server Component
}

export function ClubActions({ club }: Props) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div>
      <h2>{club.name}</h2>
      <button onClick={() => setIsFavorite(!isFavorite)}>
        {isFavorite ? '❤️ Favori' : '🤍 Ajouter aux favoris'}
      </button>
    </div>
  );
}
```
**Why**: Server fetches data, client handles interaction.

### Using Browser APIs
```tsx
'use client';

import { useEffect, useState } from 'react';

export function ShareButton({ url, title }: { url: string; title: string }) {
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    // Check if Web Share API is available
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ url, title });
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <button onClick={handleShare}>
      Partager
    </button>
  );
}
```
**Why**: Browser APIs only available in client components.

### Redux Integration
```tsx
'use client';

import { useAppSelector, useAppDispatch } from '@/core/store/hooks';
import { setSession, clearSession } from '@/core/store/modules/authSlice';

export function UserMenu() {
  const session = useAppSelector((state) => state.auth.session);
  const dispatch = useAppDispatch();

  if (!session) {
    return <LoginButton />;
  }

  return (
    <div>
      <span>{session.user.email}</span>
      <button onClick={() => dispatch(clearSession())}>
        Déconnexion
      </button>
    </div>
  );
}
```
**Why**: Redux requires hooks, only works in client components.

## Detailed Anti-patterns

### ❌ Marking Entire Pages as Client
```tsx
// Wrong - Makes everything client-side
'use client';

export default function ClubPage({ params }) {
  // Now ALL children are client too
  // Can't do server-side data fetching
}
```
**Problem**: Loses SSR benefits, larger bundle.
**Solution**: Only mark interactive leaf components as client.

### ❌ Fetching in useEffect
```tsx
// Wrong - Causes loading states, waterfall
'use client';

export function ClubInfo({ slug }) {
  const [club, setClub] = useState(null);

  useEffect(() => {
    fetch(`/api/clubs/${slug}`)
      .then(res => res.json())
      .then(setClub);
  }, [slug]);

  if (!club) return <Loading />;
  return <div>{club.name}</div>;
}
```
**Problem**: Shows loading spinner, bad for SEO.
**Solution**: Fetch in Server Component, pass data as props.

### ❌ Importing Server Components
```tsx
// Wrong - Will fail
'use client';

import ServerComponent from './ServerComponent'; // Error!

export function ClientWrapper() {
  return <ServerComponent />;
}
```
**Problem**: Can't import server into client.
**Solution**: Pass as children from server parent.

## Checklist
- [ ] 'use client' at very top of file
- [ ] Only for components that NEED interactivity
- [ ] Receiving data as props, not fetching
- [ ] Small, focused components
- [ ] No server-only code (fs, headers, cookies)
