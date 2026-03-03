---
name: skill:svelte-saas-patterns
description: Svelte 5 patterns for embeddable widgets. Use when creating web components or reactive state in donaction-saas.
model: claude-sonnet-4-5
---

# Svelte SaaS Skills

## Available Patterns

| Pattern | File | Use When |
|---------|------|----------|
| Runes | [runes.md](runes.md) | Reactive state ($state, $derived) |
| Custom Elements | [custom-elements.md](custom-elements.md) | Web components |
| Stores | [stores.md](stores.md) | Cross-component state |

## Core Principles

- **Runes-first**: `$state()`, `$derived()`, `$effect()`
- **Web Components**: Custom elements for embedding
- **Event-driven**: CustomEvents with shadow DOM
- **Scoped styles**: Component-scoped SCSS

## Reactivity Decision

```
Need reactive state?
├─ Local → $state()
├─ Computed → $derived()
├─ Side effect → $effect()
├─ Props → $props()
└─ Shared → stores
```
