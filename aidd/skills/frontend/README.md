# Frontend Skills

## Overview

Skills for Next.js 14 App Router development. These patterns leverage React Server Components, modern data fetching, and efficient client-side interactivity.

## Skills List

| Skill | Description |
|-------|-------------|
| `server-components.md` | Async data fetching, direct API calls |
| `client-components.md` | Interactive components with hooks |
| `data-fetching.md` | HttpService, cache tags, revalidation |
| `redux-slice.md` | Redux Toolkit state management |

## Architecture

All frontend skills follow Next.js 14 App Router best practices:

- **Server-first**: Default to Server Components, use `'use client'` sparingly
- **Composition**: Pass Server Components as children to Client Components
- **Data fetching**: Server Components fetch data, Client Components handle interactivity
- **Cache management**: Revalidation tags for fine-grained cache control
- **Type safety**: Strict TypeScript with proper API response typing

## Common Patterns

### Component Decision Tree
```
Need interactivity (useState, useEffect, events)?
├─ YES → Client Component ('use client' at top)
└─ NO → Server Component (default, can be async)
```

### Data Flow
```
Server Component (async) → Fetch data → Pass to Client Component
                                              ↓
                                        User Interaction
                                              ↓
                                        Redux Store (global state)
```

### When to Use Each Skill

- **Fetching data on server** → `server-components.md`
- **User interactions** → `client-components.md`
- **API calls with caching** → `data-fetching.md`
- **Global state management** → `redux-slice.md`

## Reference Documentation

See `/docs/memory-bank/frontend/AGENTS.md` for:
- Server vs Client Component rules
- API route patterns
- Authentication with NextAuth
- Stripe integration
- Anti-patterns to avoid

## Naming Conventions

See `/docs/rules/frontend/naming-conventions.md` for:
- File naming: mixed (pages: kebab-case, components: camelCase)
- Components: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_CASE`

## Maintenance

### Keeping Skills Current

1. **Monitor Next.js updates**: Track App Router evolution and React Server Components changes
2. **Validate examples**: Ensure code examples work with current Next.js version
3. **Sync with AGENTS.md**: Keep skills aligned with `/docs/memory-bank/frontend/AGENTS.md` rules
4. **Add new patterns**: Use `/ide:01_onboard:generate_skill` to create skills for emerging patterns
