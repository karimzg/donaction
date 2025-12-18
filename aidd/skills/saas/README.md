# SaaS Skills

## Overview

Skills for Svelte 5 web components development. These patterns use the new runes API and custom elements for embeddable widgets.

## Skills List

| Skill | Description |
|-------|-------------|
| `runes.md` | $state, $derived, $effect, $props reactivity |
| `custom-elements.md` | Web component setup and event emission |
| `stores.md` | Svelte stores for cross-component state |

## Architecture

All SaaS skills follow Svelte 5 best practices:

- **Runes-first**: Use `$state()`, `$derived()`, `$effect()` for reactivity
- **Web Components**: Custom elements for third-party embedding
- **Event-driven**: CustomEvents with proper shadow DOM propagation
- **Type safety**: TypeScript in `<script lang="ts">`
- **Scoped styles**: Component-scoped SCSS with `:global()` for overrides

## Common Patterns

### Reactivity Decision Tree
```
Need reactive state?
├─ Local to component → $state()
├─ Computed from state → $derived()
├─ Side effect → $effect()
├─ Component props → $props()
└─ Shared across components → stores (writable/readable)
```

### Web Component Flow
```
<svelte:options customElement={{ tag: 'kebab-name' }} />
                          ↓
             Component initialization
                          ↓
    User interaction → Local state ($state)
                          ↓
         Business logic → API calls
                          ↓
    dispatchEvent(CustomEvent) → Host page
```

### When to Use Each Skill

- **Reactive local state** → `runes.md`
- **Embeddable widgets** → `custom-elements.md`
- **Shared cross-component state** → `stores.md`

## Reference Documentation

See `/docs/memory-bank/saas/AGENTS.md` for:
- Runes and reactivity rules
- Web component patterns
- Form validation
- Event bus patterns
- Anti-patterns to avoid

## Naming Conventions

See `/docs/rules/saas/naming-conventions.md` for:
- Directories: `kebab-case/`
- Svelte components: `PascalCase.svelte`
- Functions: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
