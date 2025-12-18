# Backend API - Donaction

## Context
Strapi 5 headless CMS providing REST API for all frontend applications. Handles clubs, donations, members, projects, invoices, and integrations with Stripe, ImageKit, and Brevo.

## Stack
- **Framework**: Strapi 5
- **Language**: TypeScript 5
- **Database**: PostgreSQL (prod), SQLite (dev)
- **Payments**: Stripe 17
- **Media**: ImageKit
- **Email**: Brevo (Sendinblue)

## Commands
| Command | Description |
|---------|-------------|
| `npm run develop` | Dev server on port 1437 |
| `npm run build` | Production build |
| `npm run gen:types` | Generate TypeScript types |
| `npm run export-db` | Export database |
| `npm run import-db` | Import database |

## Folder Structure
```
src/
├── api/                    # Content-type modules
│   └── {entity}/
│       ├── content-types/{entity}/
│       │   ├── schema.json     # Schema definition
│       │   └── lifecycles.ts   # Lifecycle hooks
│       ├── controllers/        # Request handlers
│       ├── services/           # Business logic
│       ├── routes/             # Route definitions
│       └── middlewares/        # Route middlewares
├── components/             # Reusable Strapi components
├── helpers/                # Utilities (emails, PDF, GCC)
├── middlewares/            # Global middlewares
└── index.ts                # Bootstrap + global lifecycles
```

## Rules

### Naming Conventions
See `@docs/rules/backend/naming-conventions.md` for file, function, variable, constant, and type naming standards.

### Critical: documentId vs id
- [CRITICAL] Use `documentId` for ALL document operations, NOT `id`
- [CRITICAL] `documentId` is 24-char alphanumeric string
```typescript
// ✅ Correct
const doc = await strapi.documents('api::klubr.klubr').findOne({ documentId });
await strapi.documents('api::klubr.klubr').update({ documentId, data });

// ❌ Wrong - will fail in Strapi 5
const doc = await strapi.documents('api::klubr.klubr').findOne({ id });
```

### Controllers
- [CTRL] Use factory pattern: `factories.createCoreController()`
- [CTRL] ALWAYS validate & sanitize in this order:
```typescript
async find(ctx) {
  // 1. Validate
  await this.validateQuery(ctx);
  // 2. Sanitize query
  const sanitizedQuery = await this.sanitizeQuery(ctx);
  // 3. Process
  const entities = await strapi.documents('api::klubr.klubr').findMany(sanitizedQuery);
  // 4. Sanitize output
  return this.sanitizeOutput(entities, ctx);
}
```
- [CTRL] Core actions: `find`, `findOne`, `create`, `update`, `delete`

### Services
- [SVC] Use factory pattern: `factories.createCoreService()`
- [SVC] Pure business logic only - NO request/response handling
- [SVC] NO auth checks in services (do in controllers/middlewares)
- [SVC] Extract helpers outside factory at module level

### Document Service API
- [DOC] Primary methods: `findMany()`, `findOne()`, `create()`, `update()`, `delete()`, `count()`
- [DOC] Draft & Publish: `publish()`, `unpublish()`, `discardDraft()`
- [DOC] Default returns draft versions in default locale
- [DOC] Published versions are immutable
```typescript
// Find with filters
const docs = await strapi.documents('api::klubr.klubr').findMany({
  filters: { status: 'active' },
  populate: ['logo', 'membres'],
  sort: ['createdAt:desc'],
  pagination: { page: 1, pageSize: 25 }
});
```

### Middlewares (Preferred for Business Logic)
- [MW] Use middlewares instead of lifecycle hooks for business logic
- [MW] Pattern: return async function with `ctx` and `next`
```typescript
export default (config, { strapi }) => {
  return async (ctx, next) => {
    // Before: permission checks
    if (!ctx.state.user) {
      return ctx.unauthorized('Not authenticated');
    }
    await next();
    // After: response modification
  };
};
```

### Lifecycle Hooks (Limited Use)
- [LIFE] NOT recommended for business logic → use middlewares
- [LIFE] Use ONLY for: database-level ops, users-permissions, file uploads
- [LIFE] Warning: triggers multiple times in v5 (draft + published)
```typescript
// Only when necessary
export default {
  beforeCreate(event) {
    event.params.data.slug = slugify(event.params.data.name);
  }
};
```

### Error Handling
- [ERR] Use Koa context methods:
  - `ctx.badRequest(msg)` - 400 validation
  - `ctx.unauthorized(msg)` - 401 auth
  - `ctx.forbidden(msg)` - 403 permission
  - `ctx.notFound(msg)` - 404 missing
  - `ctx.internalServerError(msg)` - 500 server
- [ERR] Always log before returning error
- [ERR] Include descriptive messages (French)

### Security
- [SEC] Verify `ctx.state.user` in controllers
- [SEC] Create reusable permission middlewares
- [SEC] Sanitize all outputs with `sanitizeOutput()`
- [SEC] Remove internal fields: `removeId()`, `removeCodes()`

### Query Engine (Complex Queries)
- [QE] Use `strapi.db.query()` for direct database access
- [QE] Operators: `$eq`, `$ne`, `$gt`, `$lt`, `$in`, `$contains`, `$null`, `$and`, `$or`
```typescript
const results = await strapi.db.query('api::klubr.klubr').findMany({
  where: {
    $and: [
      { status: 'active' },
      { membres: { $gt: 0 } }
    ]
  }
});
```

### Typing
- [TS] Define types in `src/_types.ts`
- [TS] Use `Data.ContentType<'api::entity.entity'>`
- [TS] Use `@ts-ignore` sparingly with comments

## Anti-Patterns
| ❌ Don't | ✅ Do | Why |
|----------|-------|-----|
| Use `id` for documents | Use `documentId` | Strapi 5 breaking change |
| Skip sanitization | Always sanitize query + output | Security |
| Business logic in lifecycles | Use middlewares/services | Maintainability |
| Auth checks in services | Check in controllers/middlewares | Separation |
| Generic errors | Use `ctx.badRequest()` etc. | Proper HTTP codes |

## Key Files
| Path | Purpose |
|------|---------|
| `config/database.ts` | Database connection |
| `config/plugins.ts` | Plugin config (upload, email, uuid) |
| `config/middlewares.ts` | Global middleware config |
| `src/index.ts` | Bootstrap + global lifecycles |
| `src/_types.ts` | Global TypeScript types |
| `src/helpers/emails/` | Email sending utilities |

## Reference Files
| File | When to consult |
|------|-----------------|
| `API_DOCS.md` | Endpoint list, middlewares, rate limits |
| `DATABASE.md` | Entity relationships, schema, migrations |

## Critical Strapi v5 Documentation
| File | Purpose |
|------|---------|
| `@docs/rules/backend/strapi-v5/strapi-v5-coding-rules.md` | Comprehensive patterns, breaking changes, best practices |
| `@docs/rules/backend/strapi-v5/quick-reference.md` | Fast lookup for controllers, services, Document Service API, common filters |
| `@docs/rules/backend/strapi-v5/README.md` | Overview, decision trees, version history |

## Skills
Detailed patterns in `@aidd/skills/backend/`:
- `controllers.md` - Controller patterns
- `services.md` - Service patterns
- `custom-middleware.md` - Permission middlewares
- `document-service-api.md` - CRUD with documentId
- `jwt-token.md` - Authentication flow
- `stripe-payment.md` - Payment integration
