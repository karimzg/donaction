# Skill: Strapi Lifecycle Hooks

## When to use
**Limited use in Strapi 5**. Prefer Document Service Middlewares for business logic.

Use lifecycles ONLY for:
- Database-level operations (auto-generate fields)
- users-permissions plugin actions
- File upload events
- Simple field transformations

## Key Concepts
- Lifecycle hooks trigger at database layer
- In Strapi 5, they may trigger **multiple times** (draft + published)
- NOT recommended for complex business logic
- Use middlewares instead for request-level logic

## Recommended Patterns

### Simple Field Transformation
```typescript
// src/api/klubr/content-types/klubr/lifecycles.ts
import slugify from 'slugify';

export default {
  beforeCreate(event) {
    const { data } = event.params;

    // Auto-generate slug from name
    if (data.name && !data.slug) {
      data.slug = slugify(data.name, { lower: true, strict: true });
    }

    // Set default status
    if (!data.status) {
      data.status = 'pending';
    }
  },

  beforeUpdate(event) {
    const { data } = event.params;

    // Regenerate slug if name changed
    if (data.name) {
      data.slug = slugify(data.name, { lower: true, strict: true });
    }
  },
};
```
**Why**: Simple transformations that don't need request context work well in lifecycles.

### After Hooks (Logging, Cache)
```typescript
export default {
  afterCreate(event) {
    const { result } = event;

    // Log creation
    strapi.log.info(`Klubr created: ${result.documentId}`);
  },

  afterUpdate(event) {
    const { result } = event;

    // Invalidate cache
    strapi.log.info(`Klubr updated: ${result.documentId}`);
  },

  afterDelete(event) {
    const { result } = event;

    // Cleanup related data
    strapi.log.info(`Klubr deleted: ${result.documentId}`);
  },
};
```
**Why**: Side effects that don't need to block the response.

### Global Lifecycle (All Content Types)
```typescript
// src/index.ts
export default {
  async bootstrap({ strapi }) {
    // Subscribe to all content types
    strapi.db.lifecycles.subscribe({
      models: ['api::klubr.klubr', 'api::klub-projet.klub-projet'],

      beforeCreate(event) {
        // Add createdBy if user available
        const ctx = strapi.requestContext.get();
        if (ctx?.state?.user) {
          event.params.data.createdBy = ctx.state.user.id;
        }
      },
    });
  },
};
```
**Why**: Apply same logic across multiple content types.

## When to Use Middleware Instead

### ❌ Lifecycle: Complex Business Logic
```typescript
// Wrong in lifecycle
beforeCreate(event) {
  const { data } = event.params;
  // Send email - BAD
  await sendWelcomeEmail(data.email);
  // Call external API - BAD
  await validateWithExternalService(data);
  // Create related entities - BAD
  await strapi.documents('api::related.related').create({...});
}
```

### ✅ Middleware: Same Logic
```typescript
// src/api/klubr/middlewares/create-klubr.ts
export default (config, { strapi }) => {
  return async (ctx, next) => {
    // Before: validation, external calls
    const isValid = await validateWithExternalService(ctx.request.body.data);
    if (!isValid) {
      return ctx.badRequest('Validation failed');
    }

    await next(); // Execute controller

    // After: side effects
    if (ctx.response.status === 200) {
      await sendWelcomeEmail(ctx.response.body.data.email);
    }
  };
};
```

## Available Lifecycle Events

| Event | Timing | Access |
|-------|--------|--------|
| `beforeCreate` | Before insert | `event.params.data` |
| `afterCreate` | After insert | `event.result` |
| `beforeUpdate` | Before update | `event.params.data`, `event.params.where` |
| `afterUpdate` | After update | `event.result` |
| `beforeDelete` | Before delete | `event.params.where` |
| `afterDelete` | After delete | `event.result` |
| `beforeFindOne` | Before find | `event.params` |
| `afterFindOne` | After find | `event.result` |
| `beforeFindMany` | Before find | `event.params` |
| `afterFindMany` | After find | `event.result` |

## Detailed Anti-patterns

### ❌ Async External Calls in Lifecycles
```typescript
// Wrong
async beforeCreate(event) {
  // External API call blocks database operation
  const result = await fetch('https://api.external.com/validate');
  if (!result.ok) {
    throw new Error('Validation failed'); // Generic error
  }
}
```
**Problem**: Blocks DB operation, can't return proper HTTP status.
**Solution**: Use middleware with `ctx.badRequest()`.

### ❌ Relying on Single Trigger in Strapi 5
```typescript
// Wrong assumption
afterCreate(event) {
  // May trigger twice: once for draft, once for published
  await sendNotification(event.result);
}
```
**Problem**: Draft/publish triggers multiple lifecycle calls.
**Solution**: Check status or use middleware.

## Checklist
- [ ] Only simple field transformations in lifecycles
- [ ] No external API calls
- [ ] No email sending
- [ ] No complex entity creation
- [ ] Consider middleware for business logic
- [ ] Handle multiple triggers in Strapi 5
