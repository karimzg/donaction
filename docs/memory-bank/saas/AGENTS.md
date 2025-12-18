# SaaS Widgets - Donaction

## Context
Svelte 5 web components (custom elements) for embedding donation forms on third-party websites. Handles sponsorship flow, Stripe payments, and analytics.

## Stack
- **Framework**: Svelte 5
- **Build**: Vite 5
- **Testing**: Vitest 2
- **Payments**: Stripe JS 4
- **Animations**: Lottie Web 5

## Commands
| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build to `build/` |
| `npm test` | Run Vitest tests |

## Folder Structure
```
src/
├── components/
│   └── sponsorshipForm/
│       ├── components/     # Sub-components
│       ├── logic/          # Business logic (api, stripe, validator)
│       ├── index.svelte    # Main component
│       └── index.scss      # Styles
├── types/                  # TypeScript definitions
├── utils/                  # Shared utilities
├── styles/                 # Global styles
└── main.ts                 # Entry point
```

## Rules

### Naming Conventions
See `@docs/rules/saas/naming-conventions.md` for file, component, function, variable, constant, and type naming standards.

### Runes & Reactivity
- [RUNE] Use `$state()` for reactive local state
- [RUNE] Use `$derived()` for computed values
- [RUNE] Use `$effect()` for side effects (cleanup in return)
- [RUNE] Use `$props()` for component props with TypeScript
- [RUNE] Declare runes at top level, never in conditionals
```typescript
// ✅ Correct
let count = $state(0);
let doubled = $derived(count * 2);
let { name, onSubmit }: Props = $props();

$effect(() => {
  console.log('Count changed:', count);
  return () => console.log('Cleanup');
});
```

### Web Components (Custom Elements)
- [WC] Use `<svelte:options customElement={{tag: 'kebab-name'}} />`
- [WC] Tag names must be kebab-case, no uppercase
- [WC] Use `dispatchEvent(new CustomEvent())` for events
- [WC] Set `bubbles: true, composed: true` for cross-shadow events
```svelte
<svelte:options customElement={{ tag: 'klubr-sponsorship-form' }} />

<script lang="ts">
  function emitComplete(data: any) {
    dispatchEvent(new CustomEvent('complete', {
      detail: data,
      bubbles: true,
      composed: true
    }));
  }
</script>
```

### Component Structure
- [COMP] Order: `<svelte:options>`, `<script>`, markup, `<style>`
- [COMP] Use `<script lang="ts">` for TypeScript
- [COMP] Keep logic in separate `logic/` folder
- [COMP] Use `.svelte.ts` for shared reactive state
```typescript
// logic/state.svelte.ts
export const formState = $state({
  step: 0,
  data: {}
});
```

### Stores (Cross-Component State)
- [STORE] Use `writable()` from `svelte/store` for shared state
- [STORE] Subscribe with `$` prefix or `.subscribe()`
- [STORE] Use `get()` to read without subscription
- [STORE] Prefer runes over stores for local state
```typescript
import { writable, get } from 'svelte/store';

export const isSubmitting = writable(false);

// In component
$isSubmitting = true;  // or isSubmitting.set(true)
const value = get(isSubmitting);
```

### Forms & Validation
- [FORM] Custom `validator` action for field validation
- [FORM] Regex patterns for email, postal code, SIREN
- [FORM] `triggerValidation` store for form-wide validation
- [FORM] Error messages inline: `<small class="error">`
- [FORM] Use `process.nextTick()` for async validation

### Event Bus
- [EVT] Use custom event bus for cross-component communication
- [EVT] Prefix events to avoid collisions: `klubr:formComplete`
- [EVT] Clean up subscriptions in `onDestroy`

### Special Elements
- [ELEM] `<svelte:component>` for dynamic components
- [ELEM] `<svelte:element>` for dynamic HTML elements
- [ELEM] `<svelte:window>` for window events
- [ELEM] `<svelte:head>` for meta tags
- [ELEM] Listeners auto-cleanup on destroy

### Styling
- [STYLE] Use `<style lang="scss">`
- [STYLE] Styles scoped by default, use `:global()` for global
- [STYLE] Use CSS variables for theming
- [STYLE] Component-specific styles in same file

### TypeScript
- [TS] Always `lang="ts"` in script tags
- [TS] Type props explicitly in `$props()`
- [TS] Avoid `any`, use `Record<string, unknown>`
- [TS] Export types from `.svelte.ts` files

### Performance
- [PERF] Use `{#key}` for keyed each blocks
- [PERF] Flatten state structure (avoid deep reactivity)
- [PERF] Debounce expensive operations in `$effect`
- [PERF] Lazy load with dynamic imports

## Anti-Patterns
| ❌ Don't | ✅ Do | Why |
|----------|-------|-----|
| `let x = 0` (non-reactive) | `let x = $state(0)` | Reactivity |
| Manual dependencies | `$derived()` | Auto-tracking |
| Runes in conditionals | Declare at top level | Svelte limitation |
| `$state.set()` | Direct reassignment | Simpler API |
| Uppercase in tag name | `kebab-case` only | Custom element spec |
| Missing `composed: true` | Always set for shadow DOM | Event propagation |

## Key Files
| Path | Purpose |
|------|---------|
| `vite.config.ts` | Build config with customElement |
| `src/components/sponsorshipForm/index.svelte` | Main widget |
| `src/components/sponsorshipForm/logic/api.ts` | API calls |
| `src/components/sponsorshipForm/logic/stripe.ts` | Payment logic |
| `src/utils/fetch.ts` | HTTP utility |
| `src/utils/eventBus.ts` | Cross-component events |

## Reference Files
_No additional reference files for this module._

## Skills
Detailed patterns in `@aidd/skills/saas/`:
- `runes.md` - $state, $derived, $effect
- `custom-elements.md` - Web component setup
- `stores.md` - Svelte stores patterns
