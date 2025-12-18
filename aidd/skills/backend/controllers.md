---
name: "strapi-controllers"
description: "Create Strapi controllers with factory pattern, sanitization, and custom routes"
triggers: ["controller", "strapi controller", "custom endpoint", "override crud", "route handler"]
tags: ["strapi", "backend", "controller", "api", "typescript"]
priority: high
scope: module
output: code
---

# Skill: Strapi Controllers

## When to use
When creating or extending Strapi REST API controllers for custom endpoints or overriding default CRUD behavior.

## Key Concepts
Controllers handle HTTP requests, validate/sanitize data, and return responses. They should be thin—delegate business logic to services.

## Recommended Patterns

### Factory Pattern (Required)
```typescript
// src/api/klubr/controllers/klubr.ts
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::klubr.klubr', ({ strapi }) => ({
  // Override default actions
  async find(ctx) {
    await this.validateQuery(ctx);
    const sanitizedQuery = await this.sanitizeQuery(ctx);

    const entities = await strapi.documents('api::klubr.klubr').findMany(sanitizedQuery);

    return this.sanitizeOutput(entities, ctx);
  },

  // Custom action
  async findBySlug(ctx) {
    const { slug } = ctx.params;

    if (!slug) {
      return ctx.badRequest('Slug is required');
    }

    const entity = await strapi.documents('api::klubr.klubr').findFirst({
      filters: { slug },
      populate: ['logo', 'membres'],
    });

    if (!entity) {
      return ctx.notFound('Club not found');
    }

    return this.sanitizeOutput(entity, ctx);
  },
}));
```
**Why**: Factory pattern provides type safety, built-in sanitization helpers, and consistent API structure.

### Sanitization Order (Critical)
```typescript
async create(ctx) {
  // 1. Validate query params
  await this.validateQuery(ctx);

  // 2. Sanitize query
  const sanitizedQuery = await this.sanitizeQuery(ctx);

  // 3. Sanitize input body
  const sanitizedBody = await this.sanitizeInput(ctx.request.body, ctx);

  // 4. Process request
  const entity = await strapi.documents('api::klubr.klubr').create({
    data: sanitizedBody.data,
    ...sanitizedQuery,
  });

  // 5. Sanitize output
  return this.sanitizeOutput(entity, ctx);
}
```
**Why**: Prevents injection attacks and ensures only allowed fields are processed/returned.

### Custom Route Registration
```typescript
// src/api/klubr/routes/klubr-custom.ts
export default {
  routes: [
    {
      method: 'GET',
      path: '/klubrs/by-slug/:slug',
      handler: 'klubr.findBySlug',
      config: {
        auth: false, // Public endpoint
        middlewares: ['api::klubr.remove-unauthorized-fields'],
      },
    },
    {
      method: 'POST',
      path: '/klubrs/:uuid/documents',
      handler: 'klubr.uploadDocuments',
      config: {
        middlewares: ['api::klubr.owner-or-admin'],
      },
    },
  ],
};
```
**Why**: Separates custom routes from default CRUD, allows middleware configuration per route.

## Detailed Anti-patterns

### ❌ Business Logic in Controllers
```typescript
// Wrong
async create(ctx) {
  const { data } = ctx.request.body;
  // Business logic here - BAD
  data.slug = data.name.toLowerCase().replace(/\s+/g, '-');
  data.status = 'pending';
  if (data.type === 'federation') {
    data.permissions = ['create_clubs'];
  }
  // ...
}
```
**Problem**: Controllers become bloated, logic can't be reused.
**Solution**: Move to service layer, call from controller.

### ❌ Skipping Sanitization
```typescript
// Wrong - Security vulnerability
async find(ctx) {
  const entities = await strapi.documents('api::klubr.klubr').findMany(ctx.query);
  return entities; // Raw output
}
```
**Problem**: Exposes internal fields, allows query injection.
**Solution**: Always use validateQuery → sanitizeQuery → sanitizeOutput.

### ❌ Generic Errors
```typescript
// Wrong
if (!entity) {
  throw new Error('Not found');
}
```
**Problem**: Returns 500 instead of proper HTTP status.
**Solution**: Use `ctx.notFound()`, `ctx.badRequest()`, etc.

## Checklist
- [ ] Using `factories.createCoreController()`
- [ ] Sanitizing query AND output
- [ ] Using proper error methods (ctx.badRequest, ctx.notFound, etc.)
- [ ] Business logic delegated to services
- [ ] Custom routes in separate file with middlewares
