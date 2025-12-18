# Donaction Platform

> **Version**: 2.0.0 | **Last Updated**: 2025-12-18 | **Doc Restructure**: Skills System

## Project
Multi-application donation platform enabling associations (Klubrs) to receive sponsorships/donations from individuals and companies, with payment processing via Stripe, donor management, and tax receipt generation.

## Monorepo Structure
```
donaction/
├── donaction-admin/     # Angular 19 - Admin dashboard
├── donaction-api/       # Strapi 5 - Backend API
├── donaction-frontend/  # Next.js 14 - Public website
└── donaction-saas/      # Svelte 5 - Embeddable widgets
```

## Global Commands
| Command | Location | Description |
|---------|----------|-------------|
| `docker-compose up` | root | Start all services locally |
| `npm run dev` | each app | Start development server |
| `npm run build` | each app | Production build |
| `npm run lint` | frontend | ESLint check |
| `npm run gen:types` | api | Generate TypeScript types |

## Global Rules

### Git
- [GIT] Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`
- [GIT] Branch naming: `feat/`, `fix/`, `release/`, `demo/`

### Security
- [SEC] Never hardcode credentials → use `.env` files
- [SEC] Sanitize all inputs/outputs
- [SEC] Remove internal IDs before API responses

### Code Quality
- [TS] TypeScript strict mode on all apps
- [DRY] Check for duplication before completing features
- [ERR] Never silent failures → always user feedback

### Architecture
- [API] API-first: always start with Strapi schema/endpoints
- [STATE] Local state first, global only when shared across components

## Cross-App Workflow

**Adding a feature touching multiple apps:**
1. Backend: Define schema + endpoints in Strapi
2. Frontend/Admin: Consume API, add UI
3. SaaS: Update widget if needed

## Environment Files
| App | Files |
|-----|-------|
| root | `.env` |
| api | `.env.development`, `.env.prod`, `.env.re7` |
| frontend | `.env`, `.env.prod`, `.env.re7` |
| admin | `src/environments/environment.ts`, `.development.ts`, `.prod.ts`, `.re7.ts` |
| saas | `.env.prod`, `.env.re7` |

## App-Specific Rules
Each app has detailed rules in its own `AGENTS.md`:
- `docs/memory-bank/admin/AGENTS.md` → Angular patterns
- `docs/memory-bank/backend/AGENTS.md` → Strapi patterns
- `docs/memory-bank/frontend/AGENTS.md` → Next.js patterns
- `docs/memory-bank/saas/AGENTS.md` → Svelte patterns

## Skills
Detailed code patterns in `@aidd/skills/{app}/`
