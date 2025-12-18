# App Context Detection Helper

## Purpose

Automatically detect which apps are affected by an issue/requirement and build the appropriate context list for planning and implementation.

## Detection Rules

### Keywords → App Mapping

| App | Keywords |
|-----|----------|
| **admin** | admin, dashboard, Angular, backoffice, management interface |
| **backend** | API, backend, Strapi, database, schema, endpoint, service, controller |
| **frontend** | frontend, website, Next.js, public site, landing page, SSR |
| **saas** | widget, SaaS, embeddable, Svelte, embed code, iframe |

### Multi-App Keywords

| Keywords | Apps |
|----------|------|
| donation form, sponsorship form | frontend + saas |
| authentication, login, user management | backend + frontend + admin |
| payment, Stripe, checkout | backend + frontend + saas |
| klubr management, association | backend + admin |

## Context Files by App

### Always Load
- `CLAUDE.md` - Global project rules

### Admin
- `docs/memory-bank/admin/AGENTS.md` - Angular patterns
- `docs/rules/admin/naming-conventions.md` - Naming rules

### Backend
- `docs/memory-bank/backend/AGENTS.md` - Strapi patterns
- `docs/rules/backend/naming-conventions.md` - Naming rules
- `docs/rules/backend/strapi-v5/README.md` - Strapi v5 overview
- `docs/rules/backend/strapi-v5/strapi-v5-coding-rules.md` - Comprehensive rules
- `docs/rules/backend/strapi-v5/quick-reference.md` - Quick lookup

### Frontend
- `docs/memory-bank/frontend/AGENTS.md` - Next.js patterns
- `docs/rules/frontend/naming-conventions.md` - Naming rules

### SaaS
- `docs/memory-bank/saas/AGENTS.md` - Svelte patterns
- `docs/rules/saas/naming-conventions.md` - Naming rules

### Skills (Optional)
- `aidd/skills/{app}/` - Code pattern examples (reference only)

## Detection Algorithm

```markdown
1. Parse issue title + body
2. Extract keywords (case-insensitive)
3. Match against keyword tables
4. If single app detected → auto-select
5. If multiple apps detected → auto-select all
6. If ambiguous (e.g., "donation form") → ask user to clarify
7. If no keywords match → ask user to select manually
```

## User Approval Format

```markdown
📋 **Context Detection Results**

**Detected Apps:** backend, frontend

**Context to Load:**
- ✅ CLAUDE.md (global rules)
- ✅ docs/memory-bank/backend/AGENTS.md
- ✅ docs/rules/backend/naming-conventions.md
- ✅ docs/rules/backend/strapi-v5/strapi-v5-coding-rules.md
- ✅ docs/rules/backend/strapi-v5/quick-reference.md
- ✅ docs/memory-bank/frontend/AGENTS.md
- ✅ docs/rules/frontend/naming-conventions.md

**Ambiguous?** No

Proceed with this context? [Y/n]
```

## Ambiguity Handling

When multiple interpretations exist:

```markdown
⚠️ **Ambiguous App Detection**

Issue keywords: "donation form", "payment"

**Possible interpretations:**
1. Frontend form (donaction-frontend)
2. Widget form (donaction-saas)
3. Both frontend + saas

Which apps should I load context for?
- [ ] Frontend only
- [ ] SaaS only
- [ ] Both frontend + saas (recommended)
- [ ] Let me specify manually
```

## Manual Override

User can always override auto-detection:

```markdown
Override detected apps? [Y/n]

Available apps:
- [ ] admin (Angular 19 - Admin dashboard)
- [ ] backend (Strapi 5 - Backend API)
- [ ] frontend (Next.js 14 - Public website)
- [ ] saas (Svelte 5 - Embeddable widgets)
```

## Integration with Workflows

### In /plan
- Run detection before Step 1
- Load context files into memory
- Reference context in technical analysis

### In /implement
- Verify context matches plan
- Re-load if needed
- Enforce rules from loaded contexts

### In /auto_implement
- Run once per issue
- Cache for all subsequent steps
- Clear when moving to next issue
