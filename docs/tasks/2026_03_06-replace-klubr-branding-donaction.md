# Instruction: Replace all Klubr branding with Donaction across all apps

## Feature

- **Summary**: Replace all remaining Klubr logos, icons, favicons, and text references in meta tags, manifests, page titles, and CSS layer names across admin, frontend, and saas apps with Donaction branding.
- **Stack**: `Angular 21`, `Next.js 14`, `Svelte 5`, `SCSS`
- **Branch name**: `feature/issue-185-replace-klubr-branding-donaction`

## Existing files

- @donaction-admin/src/public/manifest.webmanifest
- @donaction-admin/src/public/manifest-re7.webmanifest
- @donaction-admin/src/index.html
- @donaction-admin/src/styles.scss
- @donaction-admin/src/assets/theme/theme-fix.scss
- @donaction-admin/src/assets/theme/datatable.scss
- @donaction-admin/src/favicon.ico
- @donaction-admin/src/favicon.png
- @donaction-admin/src/public/icons/ (8 PWA icons)
- @donaction-frontend/src/config/config.json
- @donaction-frontend/src/layouts/partials/mecenatPage/manifestMecenat/consts.ts
- @donaction-frontend/src/layouts/partials/mecenatPage/avantageMecenat/consts.ts
- @donaction-frontend/src/layouts/components/Share.tsx
- @donaction-frontend/analyze/nodejs.html
- @donaction-frontend/public/images/favicon.ico
- @donaction-frontend/public/images/favicon.png
- @donaction-admin/src/assets/logoKlubr.svg
- @donaction-admin/src/app/shared/components/header/header.component.html
- @donaction-admin/src/app/routes/auth/ui/login/login.component.html
- @donaction-admin/src/app/routes/auth/ui/register/register.component.html
- @donaction-admin/src/app/shared/components/member/link-member/link-member.component.html
- @donaction-frontend/src/layouts/components/DonactionLogo.tsx
- @donaction-saas/index.html
- @donaction-saas/index.e2e.html

### New file to create

- @donaction-admin/src/assets/donaction-logo-animated.svg (copy from tmp/logo/)
- @donaction-frontend/public/images/donaction-logo-animated.svg (copy from tmp/logo/)

## Implementation phases

### Phase 1: Admin app branding

> Replace all Klubr references in admin app with Donaction branding

1. Copy binary assets from tmp/ to admin
   [] 1.1. Copy `tmp/icons/icon-*.png` (8 files) to `donaction-admin/src/public/icons/`
   [] 1.2. Copy `tmp/favicon/favicon.ico` to `donaction-admin/src/favicon.ico`
   [] 1.3. Copy `tmp/favicon/favicon.png` to `donaction-admin/src/favicon.png`
2. Update manifest files
   [] 2.1. `manifest.webmanifest`: "Klubr Admin" -> "Donaction Admin", "Klubr" -> "Donaction"
   [] 2.2. `manifest-re7.webmanifest`: "Klubr Admin re7" -> "Donaction Admin re7", "Klubr re7" -> "Donaction re7"
3. Update index.html
   [] 3.1. `<title>` "Klubr | Admin" -> "Donaction | Admin"
   [] 3.2. `<meta name="description">` "Klubr Admin" -> "Donaction Admin"
   [] 3.3. `<meta property="og:title">` "Klubr | Admin" -> "Donaction | Admin"
   [] 3.4. `<meta property="og:site_name">` "Klubr" -> "Donaction"
4. Rename CSS layer
   [] 4.1. `styles.scss`: `klubr` -> `donaction` in @layer declaration
   [] 4.2. `theme-fix.scss`: `@layer klubr` -> `@layer donaction`
   [] 4.3. `datatable.scss`: `@layer klubr` -> `@layer donaction`
5. Replace logo SVG
   [] 5.1. Copy `tmp/logo/donaction-logo-animated.svg` to `donaction-admin/src/assets/donaction-logo-animated.svg`
   [] 5.2. Update `header.component.html`: `logoKlubr.svg` -> `donaction-logo-animated.svg`, alt "Klubr" -> "Donaction"
   [] 5.3. Update `login.component.html`: same replacement
   [] 5.4. Update `register.component.html`: same replacement
   [] 5.5. Update `link-member.component.html`: same replacement

### Phase 2: Frontend app branding

> Replace all Klubr references in frontend app with Donaction branding

1. Copy binary assets from tmp/ to frontend
   [] 1.1. Copy `tmp/favicon/favicon.ico` to `donaction-frontend/public/images/favicon.ico`
   [] 1.2. Copy `tmp/favicon/favicon.png` to `donaction-frontend/public/images/favicon.png`
2. Update config.json
   [] 2.1. `site.title`: "Klubr." -> "Donaction."
   [] 2.2. `site.logo`: update URL from logo-klubr-black.png to donaction-logo-animated.svg
   [] 2.3. `site.logo_darkmode`: update URL from logo-klubr-white.png to donaction-logo-animated.svg
   [] 2.4. `site.logo_text`: "Klubr." -> "Donaction."
   [] 2.5. `metadata.meta_author`: "Klubr" -> "Donaction"
   [] 2.6. `metadata.meta_description`: "Klubr description" -> "Donaction description"
3. Update content text files
   [] 3.1. `manifestMecenat/consts.ts`: "Chez Klubr" -> "Chez Donaction" (5 occurrences)
   [] 3.2. `avantageMecenat/consts.ts`: "Cher Klubr" -> "Cher Donaction" (1 occurrence, line 117)
   [] 3.3. `Share.tsx`: hashtag '#klubr' -> '#donaction', hashtags ['klubr'] -> ['donaction']
   [] 3.4. `analyze/nodejs.html`: update title if it contains Klubr
4. Replace logo in DonactionLogo component
   [] 4.1. Copy `tmp/logo/donaction-logo-animated.svg` to `donaction-frontend/public/images/donaction-logo-animated.svg`
   [] 4.2. Update `DonactionLogo.tsx`: change image src from PNG to SVG (`/images/donaction-logo-animated.svg`)

### Phase 3: SaaS app branding (title only)

> Update HTML titles only - web component tag names are OUT OF SCOPE

1. Update HTML titles
   [] 1.1. `index.html`: title "Klubr Web Components" -> "Donaction Web Components"
   [] 1.2. `index.e2e.html`: title "Klubr Web Components - E2E" -> "Donaction Web Components - E2E"

## Reviewed implementation

- [ ] Phase 1: Admin app branding
- [ ] Phase 2: Frontend app branding
- [ ] Phase 3: SaaS app branding

## Validation flow

1. Grep all 3 apps for remaining "Klubr" in meta tags, titles, and manifest files
2. Verify admin: open index.html, check title and og tags
3. Verify admin: open manifests, confirm Donaction names
4. Verify admin: grep SCSS files for @layer donaction (not klubr)
5. Verify frontend: open config.json, confirm all Donaction values
6. Verify frontend: check consts.ts files for "Donaction" replacements
7. Verify frontend: check Share.tsx for #donaction hashtag
8. Verify saas: check both HTML files for "Donaction Web Components"

## Estimations

- Confidence: 9/10 (straightforward text/asset replacement, clear scope)
- Risk: config.json logo URLs reference donaction.fr domain - new logo filenames must match what's deployed
- Time to implement: 20 minutes
