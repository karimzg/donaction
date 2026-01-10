---
name: skill:nextjs-frontend-patterns
description: Next.js 14 App Router patterns for frontend. Use when creating pages, components, or data fetching in donaction-frontend.
model: claude-sonnet-4-5
---

# Next.js Frontend Skills

## Available Patterns

| Pattern | File | Use When |
|---------|------|----------|
| Server Components | [server-components.md](server-components.md) | Data fetching, SSR |
| Client Components | [client-components.md](client-components.md) | Interactivity, hooks |
| Data Fetching | [data-fetching.md](data-fetching.md) | API calls, caching |
| Redux Slice | [redux-slice.md](redux-slice.md) | Global state |

## Core Principles

- **Server-first**: Default to Server Components
- **Composition**: Pass Server as children to Client
- **Parallel fetching**: `Promise.all()` not sequential awaits
- **Cache tags**: Revalidation for fine-grained control

## Decision Tree

```
Need interactivity (useState, events)?
├─ YES → Client Component ('use client')
└─ NO → Server Component (default, async)
```
