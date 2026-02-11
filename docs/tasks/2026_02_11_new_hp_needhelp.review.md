# Code Review for NewHpNeedHelp FAQ Section

New FAQ section for the new homepage with split-panel desktop layout, mobile accordion, JSON-LD SEO schema, and CMS-driven content via existing Strapi `page-home.FAQ` field.

- Statuts: **PASS with minor issues**
- Confidence: **HIGH**

## Main expected Changes

- [x] Data wiring: `getHp()` call in `new-hp/page.tsx`, prop threading to `NewHomepageContent`
- [x] Server component: `NewHpNeedHelp/index.tsx` with JSON-LD FAQPage schema
- [x] Client component: `FaqAccordion.tsx` with split-panel (desktop) / accordion (mobile)
- [x] SCSS: BEM styles, animations, responsive, reduced-motion
- [x] Tests: 15/15 passing

## Scoring

### Potentially Unnecessary Elements

- [🟢] No dead code or unused imports detected
- [🟡] **Dual DOM rendering**: `FaqAccordion.tsx` renders BOTH desktop and mobile layouts simultaneously (hidden via CSS). Both share `activeIndex` state. This means the DOM contains 2x the FAQ elements. Acceptable for small FAQ lists (5-8 items), but worth noting for future optimization if lists grow large.

### Standards Compliance

- [🟢] Naming conventions followed (BEM `new-hp-needhelp__*`, PascalCase components, camelCase functions)
- [🟢] Coding rules ok (Server Component for wrapper, `'use client'` only on interactive `FaqAccordion`)
- [🟡] **DRY violation**: `index.tsx:8-15` `getPathname()` is duplicated from `mecenatPage/needHelp/index.tsx:8-15`. Also duplicated in `common/breadcrumb/index.tsx`. Should be extracted to a shared helper.
- [🟡] **DRY violation**: `index.tsx:17-27` `getAnswer()` is duplicated from `mecenatPage/needHelp/index.tsx:34-44`. Should be extracted to a shared utility.

### Architecture

- [🟢] Proper separation: Server Component (data/SEO) + Client Component (interactivity)
- [🟢] Follows established NewHp section patterns (folder structure, SCSS import, BEM naming)
- [🟢] Reuses existing types (`FaqI`, `FaqItemsType`, `RichTextBlockEl`) and services (`getHp()`)
- [🟢] `Promise.all` for parallel data fetching in `page.tsx` -- good optimization over sequential calls
- [🟢] CSS-only responsive strategy (no JS breakpoint detection)

### Code Health

- [🟢] Functions and file sizes reasonable (largest: `index.scss` at 397 lines, well-organized with section comments)
- [🟢] No magic numbers -- SCSS variables for all design tokens and timing
- [🟢] `FaqAccordion.tsx` is 137 lines -- clean, focused
- [🟢] Error handling: `.catch(() => undefined)` on `getHp()` prevents page crash if CMS unavailable
- [🟢] Null guard: `if (!faq?.faq_item?.length) return null` prevents empty section rendering

### Security

- [🟢] No SQL injection risk (read-only CMS data)
- [🟡] **XSS surface**: `index.tsx:56` `dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}` -- safe here because `JSON.stringify` escapes special chars and input is from trusted CMS, but worth noting. This matches the pattern used in the old NeedHelp component.
- [🟢] No authentication flaws (public page, no user data)
- [🟢] No data exposure (CMS content only)
- [🟢] Environment variables secured (`SITE_URL` from env)

### Error management

- [🟢] Graceful degradation when FAQ data unavailable (returns null)
- [🟢] `getPathname()` try/catch handles both server and client contexts

### Performance

- [🟢] `Promise.all` for parallel fetching -- no waterfall
- [🟢] Staggered CSS animations via `--item-index` variable (GPU-accelerated `transform` + `opacity`)
- [🟢] `grid-template-rows: 0fr/1fr` for smooth accordion height animation (no JS measurement)
- [🟡] **Minor**: `getAnswer()` creates string concatenation in a loop. For large FAQ answers, `Array.join` would be more efficient. Negligible for typical FAQ content.

### Frontend specific

#### State Management

- [🟢] Loading states: N/A (server-fetched data, no client loading)
- [🟢] Empty states: null render when no FAQ items
- [🟢] Error states: graceful fallback to no section
- [🟢] Transition states: smooth crossfade (desktop) and height animation (mobile)

#### UI/UX

- [🟢] Consistent design patterns (matches other NewHp sections)
- [🟢] Responsive design: 3 breakpoints (mobile, tablet `md:768px`, desktop `lg:1024px`)
- [🟢] Accessibility: `role="tablist"/"tab"/"tabpanel"` (desktop), `aria-expanded`/`aria-controls` (mobile), `aria-hidden` on decorative SVGs
- [🟢] Semantic HTML: `<section>`, `<h2>`, `<h3>`, `<button>` elements
- [🟢] `prefers-reduced-motion: reduce` support
- [🟢] Hover effects gated behind `@media (hover: hover)` (no ghost-hover on touch)

### Backend specific

- N/A (no backend changes)

## Final Review

- **Score**: 8.5/10
- **Feedback**: Solid implementation following established patterns. Clean architecture with proper Server/Client component boundary. Good accessibility and responsive design. Two DRY violations should be addressed before merge.
- **Follow-up Actions**:
  1. **Extract `getPathname()`** to a shared helper (e.g., `src/core/helpers/getPathname.ts`) -- used in 3 files
  2. **Extract `getAnswer()`** to a shared utility (e.g., `src/core/helpers/richTextToPlainText.ts`) -- used in 2 files
  3. Exclude `donaction-saas/index.html` change from this PR (unrelated token rotation)
- **Additional Notes**: The `donaction-saas/index.html` diff contains a JWT token change that should not be part of this feature branch.
