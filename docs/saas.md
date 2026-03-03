### SaaS Widgets - Donaction

> **Version**: 2.1.0 | **Last Updated**: 2026-01-30

#### Context
Svelte 5 web components (custom elements) for embedding donation forms on third-party websites. Handles multi-step sponsorship flow, Stripe payments, fee calculations, and analytics.

#### Stack
- **Framework**: Svelte 5
- **Build**: Vite 5
- **Testing**: Vitest 4, Playwright (E2E)
- **Payments**: Stripe JS 4
- **Animations**: Lottie Web 5
- **Analytics**: Google Analytics (gtag), Plausible
- **External**: Google Maps Places API, reCAPTCHA Enterprise

#### Commands
| Command | Description |
|---------|-------------|
| `npm run dev:serve` | Dev server on port 3101 |
| `npm run dev:build` | Dev build |
| `npm run dev:watch` | Dev build with watch |
| `npm run build` | Production build (ESM individual components) |
| `npm test` | Run Vitest tests |
| `npm run test:coverage` | Tests with coverage |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run lint` | ESLint check |

#### Folder Structure
```
src/
├── components/
│   └── sponsorshipForm/
│       ├── __docs__/       # Component documentation
│       ├── __tests__/      # Unit tests (Vitest)
│       ├── components/     # Sub-components (breadcrumb, steps, etc.)
│       ├── logic/          # Business logic (.ts & .svelte.ts)
│       ├── index.svelte    # Main component
│       └── index.scss      # Styles
├── types/                  # TypeScript definitions
├── utils/                  # Shared utilities (fetch, eventBus, analytics)
├── styles/                 # Global SCSS (_design-tokens.scss)
├── assets/                 # Fonts, icons, animations (Lottie JSON)
└── main.ts                 # Entry point
e2e/
├── tests/                  # E2E specs (step1-5, smoke, edge-cases)
├── pages/                  # Page objects (BasePage, Step1Page, etc.)
├── helpers/                # Shadow DOM, API mocking, Stripe helpers
└── fixtures/               # Test data factories
```

#### Rules

##### Naming Conventions
See @docs/rules/saas/naming-conventions.md

##### Runes & Reactivity
- [RUNE] Use `$state()` for reactive local state
- [RUNE] Use `$derived()` for computed values
- [RUNE] Use `$effect()` for side effects (cleanup in return)
- [RUNE] Use `$props()` for component props with TypeScript
- [RUNE] Declare runes at top level, never in conditionals
- [RUNE] **Hybrid pattern**: `$state()` for local reactive objects, `writable()` for cross-component shared state
```typescript
// Hybrid pattern used in useSponsorshipForm.svelte.ts
const FORM_CONFIG = $state({ /* local reactive */ });
const isLoading = writable<boolean>(false); // shared across components
```

##### Web Components (Custom Elements)
- [WC] Use `<svelte:options customElement={{tag: 'kebab-name'}} />`
- [WC] Tag names must be kebab-case, no uppercase
- [WC] Use `dispatchEvent(new CustomEvent())` for events
- [WC] Set `bubbles: true, composed: true` for cross-shadow events
- [WC] Inject fonts/styles into `document.head` (shadow DOM can't access host styles)
- [WC] Toast notifications inject into `shadowRoot` directly
- [WC] Reset all state in `onDestroy` to support re-mounting

##### Component Structure
- [COMP] Order: `<svelte:options>`, `<script>`, markup, `<style>`
- [COMP] Use `<script lang="ts">` for TypeScript
- [COMP] Keep logic in separate `logic/` folder
- [COMP] Use `.svelte.ts` for shared reactive state

##### Stores (Cross-Component State)
- [STORE] Use `writable()` from `svelte/store` for shared state
- [STORE] Subscribe with `$` prefix or `.subscribe()`
- [STORE] Use `get()` to read without subscription
- [STORE] Prefer runes over stores for local state

##### Forms & Validation
- [FORM] `validator` is a **Svelte action** (not a component) applied to input elements
- [FORM] **Dual validation modes**: on-blur (full) + while-typing (clear errors only, debounced 150ms)
- [FORM] Regex patterns for email, postal code, SIREN, phone (FR + DOM-TOM)
- [FORM] `triggerValidation` store for form-wide validation
- [FORM] Centralized `fieldErrors` reactive store (`fieldErrors.svelte.ts`) using `$state<Record<string, string>>({})`
- [FORM] Error display: `setFieldError()` / `clearFieldError()` + CSS class on parent `.form-group`
- [FORM] Dirty tracking via `dirtyKeys` array for "form modified" detection
- [FORM] Phone validation: supports FR mainland + DOM-TOM, auto-formatting
- [FORM] Step navigation: backward-only to completed steps, forward blocked if validation fails

##### Fee Calculation
- [FEE] Two scenarios in `fee-calculation-helper.ts`:
  - **Scenario A** (`donorPaysFee=true`): donor pays donation + commission + Stripe fees + contribution
  - **Scenario B** (`donorPaysFee=false`): donor pays donation + contribution, association absorbs fees
- [FEE] Stripe constants: 1.5% EU cards + €0.25 fixed per transaction
- [FEE] `montantRecuFiscal` computed for tax receipt generation

##### Tax Calculations
- [TAX] Individual: 66% deduction (`TAUX_DEDUCTION_FISCALE_PART = 0.66`)
- [TAX] Organization: 60% deduction (`TAUX_DEDUCTION_FISCALE_PRO = 0.6`)
- [TAX] `calculateTaxReduction()` and `calculateTaxSavings()` in `logic/utils.ts`

##### Event Bus
- [EVT] Use custom event bus for cross-component communication
- [EVT] Prefix events with `EVENT_CONTEXT` constant to avoid collisions
- [EVT] Exposed globally via `window.KLUBR_EVENT_BUS`
- [EVT] Clean up subscriptions in `onDestroy`

##### Dynamic Branding
- [BRAND] Club colors injected as CSS custom properties: `--don-brand-primary`, `--don-brand-secondary`
- [BRAND] Fallback to design tokens: `var(--don-brand-primary, var(--don-color-primary))`
- [BRAND] Colors sourced from `klubr.klubr_house.primary_color` / `secondary_color`

##### Accessibility
- [A11Y] `autoScrollOnFocus`: scrolls input into view on mobile focus (below sticky header)
- [A11Y] Respects `prefers-reduced-motion: reduce`
- [A11Y] Mobile breakpoint check (`window.innerWidth > MOBILE_BREAKPOINT`)
- [A11Y] Breadcrumb: `aria-label`, `aria-current="step"`, disabled dots for future steps

##### Special Elements
- [ELEM] `<svelte:component>` for dynamic components
- [ELEM] `<svelte:element>` for dynamic HTML elements
- [ELEM] `<svelte:window>` for window events
- [ELEM] `<svelte:head>` for meta tags
- [ELEM] Listeners auto-cleanup on destroy

##### Styling
- [STYLE] Use `<style lang="scss">`
- [STYLE] Styles scoped by default, use `:global()` for global
- [STYLE] CSS custom properties for theming (see Dynamic Branding)
- [STYLE] Design tokens in `@src/styles/_design-tokens.scss`

##### TypeScript
- [TS] Always `lang="ts"` in script tags
- [TS] Type props explicitly in `$props()`
- [TS] Avoid `any`, use `Record<string, unknown>`
- [TS] Export types from `.svelte.ts` files

##### Testing
- [TEST] Unit: Vitest 4 with jsdom environment
- [TEST] E2E: Playwright with page objects pattern
- [TEST] E2E projects: chromium, firefox, mobile (iPhone 14)
- [TEST] Shadow DOM: Playwright auto-pierces; custom helpers for form interaction
- [TEST] API mocking for external deps (Stripe, reCAPTCHA, backend)
- [TEST] Test files colocated: `__tests__/` folders + `e2e/tests/` by step

##### Performance
- [PERF] Use `{#key}` for keyed each blocks
- [PERF] Flatten state structure (avoid deep reactivity)
- [PERF] Debounce expensive operations in `$effect`
- [PERF] Lazy load with dynamic imports

#### Anti-Patterns
| Don't | Do | Why |
|-------|-----|-----|
| `let x = 0` (non-reactive) | `let x = $state(0)` | Reactivity |
| Manual dependencies | `$derived()` | Auto-tracking |
| Runes in conditionals | Declare at top level | Svelte limitation |
| `$state.set()` | Direct reassignment | Simpler API |
| Uppercase in tag name | `kebab-case` only | Custom element spec |
| Missing `composed: true` | Always set for shadow DOM | Event propagation |
| Business logic in components | Extract to `logic/` folder | Separation of concerns |
| Forward step navigation | Backward-only to completed steps | UX validation flow |

#### Key Files
| Path | Purpose |
|------|---------|
| `vite.config.ts` | Build config with customElement |
| `src/components/sponsorshipForm/index.svelte` | Main widget |
| `src/components/sponsorshipForm/logic/api.ts` | API calls |
| `src/components/sponsorshipForm/logic/stripe.ts` | Payment logic |
| `src/components/sponsorshipForm/logic/validator.ts` | Svelte action for field validation |
| `src/components/sponsorshipForm/logic/fieldErrors.svelte.ts` | Centralized error state |
| `src/components/sponsorshipForm/logic/fee-calculation-helper.ts` | Fee scenarios A/B |
| `src/components/sponsorshipForm/logic/useSponsorshipForm.svelte.ts` | Form state & config |
| `src/components/sponsorshipForm/logic/utils.ts` | Tax calculations, helpers |
| `src/components/sponsorshipForm/logic/autoScrollOnFocus.ts` | Mobile scroll a11y |
| `src/utils/fetch.ts` | HTTP utility |
| `src/utils/eventBus.ts` | Cross-component events |
| `src/utils/initPlausible.ts` | Plausible analytics setup |
| `e2e/pages/` | Playwright page objects |

#### Reference Files
- @donaction-saas/src/components/sponsorshipForm/__docs__/ — component documentation

#### Skills
Detailed patterns in `@aidd/skills/saas/`:
- `runes.md` - $state, $derived, $effect
- `custom-elements.md` - Web component setup
- `stores.md` - Svelte stores patterns
