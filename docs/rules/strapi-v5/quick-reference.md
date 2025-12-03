# Strapi v5 Quick Reference Checklist

> Quick reference for common Strapi v5 patterns. See [full rules](./strapi-v5-coding-rules.md) for details.

---

## Controllers Checklist

### ✅ Every Controller Action Must:

```typescript
async actionName() {
  const ctx = strapi.requestContext.get();

  // 1. Validate query
  await this.validateQuery(ctx);

  // 2. Sanitize query
  const sanitizedQuery = await this.sanitizeQuery(ctx);

  // 3. Process request
  const result = await strapi.service('api::entity.entity').method(sanitizedQuery);

  // 4. Sanitize output
  const sanitized = await this.sanitizeOutput(result, ctx);

  // 5. Remove internal fields
  return removeId(sanitized);
}
```

### Controller Template

```typescript
import { Core, factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::entity.entity',
  ({ strapi }: { strapi: Core.Strapi }) => ({
    // Custom actions here
  })
);
```

---

## Services Checklist

### Service Template

```typescript
import { Core, factories } from '@strapi/strapi';

export default factories.createCoreService(
  'api::entity.entity',
  ({ strapi }: { strapi: Core.Strapi }) => ({
    async customMethod(param1, param2) {
      // Business logic only
      return result;
    },
  })
);

// Helper functions at module level
const helperFunction = (data) => {
  return transformedData;
};
```

---

## Document Service API

### Quick Reference

```typescript
// Find many
await strapi.documents('api::entity.entity').findMany({
  filters: { field: { $eq: value } },
  populate: ['relation'],
  status: 'published', // or 'draft'
});

// Find one by documentId
await strapi.documents('api::entity.entity').findOne({
  documentId: 'abc123',
  populate: ['relation'],
});

// Create
await strapi.documents('api::entity.entity').create({
  data: { field: value },
});

// Update (use documentId, not id!)
await strapi.documents('api::entity.entity').update({
  documentId: entity.documentId,
  data: { field: newValue },
});

// Delete
await strapi.documents('api::entity.entity').delete({
  documentId: entity.documentId,
});

// Count
await strapi.documents('api::entity.entity').count({
  filters: { field: { $eq: value } },
});
```

**⚠️ Use `documentId`, not `id`!**

---

## Database Query Engine

### When to Use

- Complex filters with `$and`/`$or`
- `findWithCount` operations
- Direct database access
- Middlewares and lifecycles

### Quick Reference

```typescript
// Find one
await strapi.db.query('api::entity.entity').findOne({
  where: { uuid: value },
  populate: { relation: true },
});

// Find many
await strapi.db.query('api::entity.entity').findMany({
  where: {
    status: { $eq: 'published' },
    field: { $contains: 'text' },
  },
  populate: ['relation'],
  orderBy: [{ createdAt: 'desc' }],
});

// Find with count
const [results, total] = await strapi.db
  .query('api::entity.entity')
  .findWithCount({
    where: { status: 'published' },
  });

// Update
await strapi.db.query('api::entity.entity').update({
  where: { id: entityId },
  data: { field: newValue },
});

// Count
await strapi.db.query('api::entity.entity').count({
  where: { status: 'published' },
});
```

---

## Routes & Middlewares

### Custom Route Template

```typescript
// routes/entity-custom.ts
export default {
  routes: [
    {
      method: 'GET',
      path: '/entities/:uuid',
      handler: 'entity.findOne',
      config: {
        middlewares: ['api::entity.owner-or-admin'],
      },
    },
  ],
};
```

### Middleware Template

```typescript
// middlewares/custom.ts
import { Core } from '@strapi/strapi';
import { Context } from 'koa';

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx: Context, next: () => Promise<void>) => {
    // Permission check
    if (!hasPermission(ctx.state.user, ctx.params.uuid)) {
      return ctx.unauthorized('Access denied');
    }

    await next();
  };
};
```

---

## Lifecycle Hooks

### ⚠️ Lifecycle Hooks vs Middlewares

**Use Lifecycle Hooks for**:
- Database-level operations
- `users-permissions` plugin
- File upload events

**Use Middlewares for**:
- Business logic
- Request validation
- Permission checks

### Lifecycle Template

```typescript
// content-types/entity/lifecycles.ts
import { LifecycleEvent, EntityType } from '../../../../_types';

export default {
  async beforeCreate(event: LifecycleEvent<EntityType>) {
    // Modify event.params.data
    event.params.data.field = transformedValue;
  },

  async afterCreate(event: LifecycleEvent<EntityType>) {
    // Access event.result
    const created = event.result;
  },
};
```

---

## Error Responses

```typescript
// Bad request (400)
ctx.badRequest('Missing required field');

// Unauthorized (401)
ctx.unauthorized('Authentication required');

// Forbidden (403)
ctx.forbidden('Access denied');

// Not found (404)
ctx.notFound('Entity not found');

// Internal error (500)
ctx.internalServerError('Server error');
```

---

## Common Filters

```typescript
// Exact match
{ field: { $eq: value } }

// Not equal
{ field: { $ne: value } }

// Greater than
{ field: { $gt: value } }
{ field: { $gte: value } }

// Less than
{ field: { $lt: value } }
{ field: { $lte: value } }

// In array
{ field: { $in: [val1, val2] } }
{ field: { $notIn: [val1, val2] } }

// String contains
{ field: { $contains: 'text' } }
{ field: { $notContains: 'text' } }

// Null checks
{ field: { $null: true } }
{ field: { $notNull: true } }

// AND
{
  $and: [
    { field1: { $eq: value1 } },
    { field2: { $eq: value2 } },
  ]
}

// OR
{
  $or: [
    { field1: { $eq: value1 } },
    { field2: { $eq: value2 } },
  ]
}
```

---

## TypeScript Types

```typescript
// Import from @strapi/strapi
import { Core, factories } from '@strapi/strapi';
import { Context } from 'koa';

// Define entity types in src/_types.ts
import { Data } from '@strapi/strapi';

export type EntityType = Data.ContentType<'api::entity.entity', 'fields'> & {
  id?: number;
  documentId?: string;
  uuid?: string;
  // Computed fields
  customField?: any;
};

// Lifecycle event type
export type LifecycleEvent<T> = {
  action: string;
  model: { uid: string };
  params: {
    data?: Partial<T>;
    where?: Record<string, any>;
  };
  result?: T;
};
```

---

## Security Checklist

### ✅ Before Every Response:

1. **Sanitize output**: `await this.sanitizeOutput(entity, ctx)`
2. **Remove internal IDs**: `removeId(entity)`
3. **Remove sensitive fields**: `removeCodes(entity)`
4. **Check permissions**: Use middlewares or helpers

### Permission Helper Pattern

```typescript
// helpers/permissions.ts
export const profileIsOwner = (profile: ProfileEntity, resourceUuid: string) =>
  profile?.role === 'Admin' && profile.resource?.uuid === resourceUuid;

// Use in middleware
if (!profileIsOwner(profile, ctx.params.uuid)) {
  return ctx.unauthorized('Access denied');
}
```

---

## Common Pitfalls

### ❌ DON'T

```typescript
// Don't use id for updates
await strapi.documents('api::entity.entity').update({
  id: entity.id, // ❌ WRONG
  data: {},
});

// Don't skip sanitization
const result = await service.find(ctx.query); // ❌ WRONG
return result;

// Don't use lifecycle hooks for business logic
async afterCreate(event) {
  // ❌ WRONG - use middleware instead
  await sendEmail(event.result);
}
```

### ✅ DO

```typescript
// Use documentId for updates
await strapi.documents('api::entity.entity').update({
  documentId: entity.documentId, // ✅ CORRECT
  data: {},
});

// Always sanitize
const sanitized = await this.sanitizeQuery(ctx); // ✅ CORRECT
const result = await service.find(sanitized);
return await this.sanitizeOutput(result, ctx);

// Use services/middlewares for business logic
async create() {
  const entity = await super.create(ctx); // ✅ CORRECT
  await strapi.service('api::email.email').sendNotification(entity);
  return entity;
}
```

---

## Performance Tips

1. **Use `fields` parameter** to select only needed fields
2. **Limit populate depth** to avoid over-fetching
3. **Use pagination** for large datasets
4. **Add database indexes** on frequently queried fields
5. **Cache expensive operations** in services

---

## Debugging Checklist

When something goes wrong:

1. ✅ Check console logs for errors
2. ✅ Verify `documentId` vs `id` usage
3. ✅ Confirm authentication state: `ctx.state.user`
4. ✅ Validate query parameters: `ctx.query`
5. ✅ Check middleware execution order
6. ✅ Verify populate paths are correct
7. ✅ Test with Strapi admin panel first
8. ✅ Check database directly if needed

---

## Resources

- 📖 [Full Coding Rules](./strapi-v5-coding-rules.md)
- 🌐 [Official Strapi v5 Docs](https://docs.strapi.io/)
- 🔧 [Document Service API](https://docs.strapi.io/cms/api/document-service)
- 🎯 [Controllers](https://docs.strapi.io/cms/backend-customization/controllers)
- ⚙️ [Services](https://docs.strapi.io/cms/backend-customization/services)

---

**Version**: Strapi 5.13.0
**Last Updated**: 2025-12-03
