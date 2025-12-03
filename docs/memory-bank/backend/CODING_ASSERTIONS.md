---
name: coding-assertions
description: Code quality verification checklist
argument-hint: N/A
---

# Coding Guidelines

> Those rules must be minimal because the MUST be checked after EVERY CODE GENERATION.

## Requirements to complete a feature

**A feature is really completed if ALL of the above are satisfied: if not, iterate to fix all until all are green.**

## Steps to follow

1. Check their is no duplication
2. Ensure code is re-used
3. Run all those commands, in order to ensure code is perfect:

```markdown
| Order | Command               | Description                  |
|-------|-----------------------|------------------------------|
| 1     | `npm run gen:types`   | Generate TypeScript types    |
| 2     | TypeScript check      | Verify no type errors        |
| 3     | `npm run build`       | Build Strapi application     |
```

## Backend-Specific Coding Patterns

### Framework & Architecture

- Strapi v5 headless CMS using `@strapi/strapi`
- TypeScript with `strict: false` but `noImplicitThis: true`
- Node.js runtime with CommonJS modules
- PostgreSQL database (production), SQLite (dev)

### Core Dependencies

- `@strapi/strapi` v5
- `stripe` for payments
- `sib-api-v3-sdk` for Brevo email service
- `pdf-lib` for PDF generation
- `pg` v8 for PostgreSQL
- `imagekit` for media handling

### TypeScript Usage

- Use Strapi generated types from `@strapi/strapi`
- Entity types defined in `@/src/_types.ts` using `Data.ContentType<>`
- Use `Core.Strapi` type for strapi instance
- Context type from `koa`
- `@ts-ignore` used sparingly for Strapi API limitations
- Use generic types with `factories.createCoreController()` and `factories.createCoreService()`

### Controllers Pattern

- Use `factories.createCoreController()` from `@strapi/strapi`
- Access context via `strapi.requestContext.get()`
- Return sanitized data using `this.sanitizeOutput()`
- Use helper `removeId()` to remove internal ids from responses
- Use `ctx.badRequest()`, `ctx.notFound()`, `ctx.unauthorized()`, `ctx.forbidden()` for errors
- Always validate query params with `await this.validateQuery(ctx)`
- Always sanitize query params with `await this.sanitizeQuery(ctx)`

### Services Pattern

- Use `factories.createCoreService()` from `@strapi/strapi`
- Business logic separated from controllers
- Pure functions for data transformations
- Helper functions like `countEmptyFields()`, `countDocs()` as private module functions

### Database Access

- Use `strapi.db.query()` for direct database queries with populate
- Use `strapi.documents()` for CRUD operations on content types
- Use `strapi.service()` to access services
- Always specify populate when needed
- Use `where` clauses with operators like `$eq`, `$ne`, `$in`, `$notIn`, `$and`, `$or`
- Use `findOne()`, `findMany()`, `findWithCount()`, `create()`, `update()` methods

### Middlewares Pattern

- Export default function with `config` and `{ strapi }`
- Return async function with `ctx, next` parameters
- Check permissions using helpers from `@/src/helpers/permissions.ts`
- Always call `await next()` when passing to next middleware
- Use `ctx.unauthorized()` or `ctx.forbidden()` for auth failures

### Lifecycle Hooks

- Implement in `content-types/<name>/lifecycles.ts`
- Export object with lifecycle methods: `beforeCreate`, `beforeUpdate`, `afterCreate`, etc.
- Receive `LifecycleEvent<T>` with `params.data`, `params.where`, `result`
- Modify `event.params.data` to change data before save
- Use for UUID generation, data validation, side effects

### Error Handling

- Use `try/catch` blocks in controllers
- Log errors with `console.error()` or `console.log()`
- Return appropriate HTTP status via context methods
- No silent failures - always throw or return error response
- Use `ctx.internalServerError()` for unexpected errors

### Code Organization

- Controllers in `@/src/api/<entity>/controllers/`
- Services in `@/src/api/<entity>/services/`
- Routes in `@/src/api/<entity>/routes/`
- Middlewares in `@/src/api/<entity>/middlewares/`
- Helpers in `@/src/helpers/`
- Types in `@/src/_types.ts`
- Config files in `@/config/` using TypeScript

### Helper Functions

- Pure functions exported from `@/src/helpers/`
- Permission checks in `permissions.ts`
- Sanitization functions in `sanitizeHelpers.ts`
- Email sending in `emails/sendBrevoTransacEmail.ts`
- Media transformations in `medias.ts`
- Constants for roles, statuses in dedicated files

### Email Handling

- Use `sendBrevoTransacEmail()` from helpers
- Template IDs from `BREVO_TEMPLATES` enum
- Include `tags` array for categorization
- Attachments as array of `{ filename, path }`
- Dynamic params for template variables

### Configuration Files

- @config/database.ts for database config
- @config/middlewares.ts for middleware stack
- @config/api.ts for API settings
- @config/plugins.ts for plugin configuration
- All use arrow functions with `({ env })` parameter

### Naming Conventions

- Entity types: `EntityNameEntity` (e.g., `KlubrEntity`)
- Service methods: descriptive verbs (e.g., `sendInvitationEmail`)
- Private helpers: camelCase module-level functions
- Database fields: camelCase
- Constants: UPPER_SNAKE_CASE

### Security Practices

- Always check user permissions in middlewares
- Sanitize all inputs and outputs
- Remove sensitive fields (`removeId`, `removeCodes`)
- Use environment variables for secrets
- Validate all external data
- CORS configured in middlewares
- Content Security Policy configured

### Best Practices

- No code duplication - extract to helpers
- Single responsibility per function
- Explicit error messages in French for user-facing errors
- Console logs for debugging (not production-ready)
- Use destructuring for cleaner code
- Prefer `async/await` over promises
- Keep controllers thin, logic in services
- Use TypeScript for type safety despite `strict: false`
