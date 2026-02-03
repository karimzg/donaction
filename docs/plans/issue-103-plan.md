# Technical Implementation Plan - Issue #103

## Setup route /new-hp et structure de base

### Summary

Setup `/new-hp` route and folder structure for new homepage components. The existing `(main)` layout already provides Header/Footer wrapping automatically.

---

### Files to Create

| Path | Purpose |
|------|---------|
| `donaction-frontend/src/app/(main)/new-hp/page.tsx` | New homepage route |
| `donaction-frontend/src/layouts/partials/newHomepage/index.tsx` | Placeholder partial component |

---

### Implementation Steps

#### Step 1: Create partials directory and placeholder component

Create `donaction-frontend/src/layouts/partials/newHomepage/index.tsx`:

```typescript
import React from 'react';

const NewHomepageContent: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-16 text-black w-full min-h-[25rem]">
      <h1 className="text-3xl font-semibold">New Homepage</h1>
      <p>Content coming soon...</p>
    </div>
  );
};

export default NewHomepageContent;
```

#### Step 2: Create page route

Create `donaction-frontend/src/app/(main)/new-hp/page.tsx`:

```typescript
import { Metadata } from 'next';
import NewHomepageContent from '@/partials/newHomepage';

export const metadata: Metadata = {
  title: 'Donaction - New Homepage',
  description: 'Nouvelle page d\'accueil Donaction',
};

export default async function NewHpPage() {
  return <NewHomepageContent />;
}
```

---

### Verification

1. Start dev server: `cd donaction-frontend && npm run dev`
2. Navigate to `http://localhost:3100/new-hp`
   - ✅ Header displayed at top
   - ✅ Footer displayed at bottom
   - ✅ Placeholder content visible
3. Navigate to `http://localhost:3100/`
   - ✅ Current homepage unchanged
4. Run lint: `cd donaction-frontend && yarn lint`

---

### Notes

- Existing `(main)` layout auto-wraps with Header/Footer
- Project uses `index.tsx` components, not barrel exports
- Server Components are default (async function pattern)
