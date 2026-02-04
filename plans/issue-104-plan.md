# Plan: Issue #104 - NewHpHero Section

## Summary
Create Hero section for `/new-hp` with 60/40 text/illustration layout, dual CTAs, and animated scroll indicator.

## Technical Analysis

### Affected Files
1. `src/layouts/partials/newHomepage/NewHpHero/index.tsx` (NEW)
2. `src/layouts/partials/newHomepage/NewHpHero/index.scss` (NEW)
3. `src/layouts/partials/newHomepage/index.tsx` (MODIFY)

### Design Tokens (from theme.json)
- Primary: `#000` (black)
- Secondary: `#73cfa8` (green)
- Tertiary: `#fb9289` (coral/pink)

### Layout Pattern
Based on existing `textImageSection` and project conventions:
- 60% text / 40% illustration (lg breakpoint)
- Mobile: stack vertically
- Use Tailwind responsive classes

## Implementation Steps

### Step 1: Create NewHpHero component

**File:** `src/layouts/partials/newHomepage/NewHpHero/index.tsx`

```typescript
import Link from 'next/link';
import './index.scss';

export default function NewHpHero() {
  return (
    <section className="new-hp-hero w-full min-h-[80vh] flex items-center py-16 px-6 md:px-0">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-12 w-full max-w-screen-xl mx-auto">
        {/* Text content - 60% */}
        <div className="lg:w-[60%] w-full flex flex-col gap-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight">
            Mobilisez votre communauté pour vos projets
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-xl">
            Créez des collectes de dons, fidélisez vos donateurs et développez votre association avec Donaction.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link href="/new-club" className="btn btn-primary text-center">
              Créer mon club
            </Link>
            <Link href="/projets" className="btn btn-outline-primary text-center">
              Voir les projets
            </Link>
          </div>
        </div>

        {/* Illustration - 40% */}
        <div className="lg:w-[40%] w-full flex items-center justify-center">
          <div className="w-full max-w-md aspect-square bg-secondary/20 rounded-3xl flex items-center justify-center">
            {/* Placeholder for illustration */}
            <span className="text-6xl">🎯</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="new-hp-hero__scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="scroll-indicator-arrow"></div>
      </div>
    </section>
  );
}
```

### Step 2: Create SCSS for scroll animation

**File:** `src/layouts/partials/newHomepage/NewHpHero/index.scss`

```scss
.new-hp-hero {
  position: relative;

  &__scroll-indicator {
    animation: bounce 2s infinite;

    .scroll-indicator-arrow {
      width: 24px;
      height: 24px;
      border-right: 3px solid #000;
      border-bottom: 3px solid #000;
      transform: rotate(45deg);
    }
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  40% {
    transform: translateX(-50%) translateY(-10px);
  }
  60% {
    transform: translateX(-50%) translateY(-5px);
  }
}
```

### Step 3: Update NewHomepageContent

**File:** `src/layouts/partials/newHomepage/index.tsx`

```typescript
import NewHpHero from './NewHpHero';

export default function NewHomepageContent() {
  return (
    <main className="flex flex-col items-center w-full">
      <NewHpHero />
      {/* Future sections will be added here */}
    </main>
  );
}
```

## Acceptance Criteria Verification
- ✅ `/new-hp` shows Hero with title and illustration
- ✅ Two CTA buttons visible (primary → /new-club, secondary → /projets)
- ✅ 60/40 layout on desktop
- ✅ Animated scroll indicator

## Notes
- Using Server Component (no `'use client'`) - Links work without client-side JS
- Following existing patterns from `textImageSection` and `buttons.scss`
- Placeholder illustration (emoji) - can be replaced with actual image later
