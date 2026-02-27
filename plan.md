# SEO Audit & Fix Plan - Issue #119

## Audit Summary

| Category | Status | Issues |
|----------|--------|--------|
| Meta Tags (Title/Description) | ✅ 80% | 5 pages missing metadata |
| OpenGraph/Twitter Cards | ⚠️ 75% | Missing on auth pages, broken OG image URL |
| Structured Data (JSON-LD) | ✅ Excellent | Present on all major pages |
| Sitemap | ⚠️ Incomplete | Missing 4 static routes |
| Robots.txt | ✅ Good | Environment-aware |
| Canonical URLs | ❌ Missing | No canonicals anywhere |
| Authenticated pages | ❌ No noindex | 3 pages indexable that shouldn't be |
| Twitter Cards | ❌ Missing | No twitter card meta on any page |

## Implementation Plan (Priority Order)

### Fix 1: CRITICAL - Add `alternates.canonical` to root layout metadata
**File**: `src/app/layout.tsx`
- Add `alternates: { canonical: '/' }` to root metadata
- This sets self-referencing canonical as default for all pages

### Fix 2: CRITICAL - Add `robots: 'noindex, nofollow'` to authenticated/utility pages
**Files** (add static `metadata` export with robots noindex):
- `src/app/(main)/profile/page.tsx`
- `src/app/(main)/mes-dons/page.tsx`
- `src/app/(main)/mes-dons/[uuid]/details/page.tsx`
- `src/app/forbidden/page.tsx`
- `src/app/(main)/new-club/congratulations/page.tsx`
- `src/app/google-signin/page.tsx` (if exists)

### Fix 3: CRITICAL - Fix broken OG image URL in auth pages
**File**: `src/app/(auth)/connexion/page.tsx`
- Change `${SITE_URL}/images/images/auth/loginSignIn.svg` → proper ImageKit URL
- SVG is not ideal for OG images (use the default donaction_home_page.jpg instead)

### Fix 4: WARNING - Add missing description to connexion page metadata
**File**: `src/app/(auth)/connexion/page.tsx`
- Add `description` field to metadata
- Add description to openGraph

### Fix 5: WARNING - Add Twitter card metadata to root layout
**File**: `src/app/layout.tsx`
- Add `twitter: { card: 'summary_large_image', site: '@donaction' }` to root metadata
- This provides default Twitter card for all pages

### Fix 6: WARNING - Complete sitemap with missing static routes
**File**: `src/app/sitemap.tsx`
- Add `/clubs`, `/projets`
- Add `/politique-de-confidentialite`, `/conditions-generales-d-utilisation`
- Uncomment `changeFrequency` and `priority` values

### Fix 7: WARNING - Update robots.txt to disallow authenticated routes
**File**: `src/app/robots.tsx`
- Add disallow rules: `/profile`, `/mes-dons`, `/forbidden`, `/new-club/congratulations`

### Fix 8: WARNING - Add `alternates.canonical` to dynamic pages
**Files** (add canonical in generateMetadata return):
- `src/app/[slug]/page.tsx` → `/${params.slug}`
- `src/app/[slug]/nos-projets/page.tsx` → `/${params.slug}/nos-projets`
- `src/app/[slug]/nos-projets/[projectSlug]/page.tsx` → `/${params.slug}/nos-projets/${params.projectSlug}`

### Fix 9: INFO - Improve image config in next.config.js
**File**: `next.config.js`
- Add standard device sizes: `[640, 750, 828, 1080, 1200, 1920]`
- Move `deviceSizes` and `imageSizes` inside `images` block (currently outside)

### Fix 10: INFO - Add theme-color meta to root layout
**File**: `src/app/layout.tsx`
- Add `themeColor` to metadata for mobile browsers

## Files to Modify (10 files)

1. `src/app/layout.tsx` - canonical, twitter cards, theme-color
2. `src/app/sitemap.tsx` - add missing routes, uncomment priorities
3. `src/app/robots.tsx` - disallow auth routes
4. `src/app/(auth)/connexion/page.tsx` - fix OG image, add description
5. `src/app/(main)/profile/page.tsx` - add noindex metadata
6. `src/app/(main)/mes-dons/page.tsx` - add noindex metadata
7. `src/app/(main)/mes-dons/[uuid]/details/page.tsx` - add noindex metadata
8. `src/app/forbidden/page.tsx` - add noindex metadata
9. `src/app/(main)/new-club/congratulations/page.tsx` - add noindex metadata
10. `next.config.js` - fix image sizes config
11. `src/app/[slug]/page.tsx` - add canonical
12. `src/app/[slug]/nos-projets/page.tsx` - add canonical
13. `src/app/[slug]/nos-projets/[projectSlug]/page.tsx` - add canonical

## Not in Scope
- Font optimization (switch to `next/font`) - separate issue
- Core Web Vitals performance tuning - requires performance profiling
- New structured data types - current JSON-LD coverage is excellent
