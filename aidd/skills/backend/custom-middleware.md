---
name: "strapi-custom-middleware"
description: "Create custom Strapi permission middlewares with role checks and entity ownership validation"
triggers: ["middleware", "strapi middleware", "permission", "authorization", "access control", "owner check"]
tags: ["strapi", "middleware", "backend", "authorization", "security"]
priority: high
scope: module
output: code
---

# Implementing Custom Strapi Middlewares

## Instructions

- Use naming format: `scope::entity.middleware-name` (e.g., `api::klubr.owner-or-admin`)
- Export default function with `config` and `{ strapi }` parameters
- Return async function with `ctx, next` parameters
- Check user permissions using `ctx.state.user`
- Use helpers from `@/src/helpers/permissions.ts` for role checks
- Call `await next()` to pass to next middleware
- Return `ctx.unauthorized()` or `ctx.forbidden()` for failures
- Place in `src/api/<entity>/middlewares/<name>.ts`

## Example

**Input:** "Create owner-or-admin middleware for klubr"

**Output:** Permission middleware checking club ownership or admin role

```typescript
// donaction-api/src/api/klubr/middlewares/owner-or-admin.ts
import { isUserAdmin, isUserKlubrOwner } from '@/src/helpers/permissions';

export default (config, { strapi }) => {
  return async (ctx, next) => {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Non authentifié');
    }

    const { uuid } = ctx.params;

    // Get klubr
    const klubr = await strapi.db.query('api::klubr.klubr').findOne({
      where: { uuid },
      populate: ['klubr_membres']
    });

    if (!klubr) {
      return ctx.notFound('Club non trouvé');
    }

    // Check if user is admin
    const isAdmin = await isUserAdmin(user);
    if (isAdmin) {
      return await next();
    }

    // Check if user is owner
    const isOwner = await isUserKlubrOwner(user, klubr);
    if (isOwner) {
      return await next();
    }

    return ctx.forbidden('Accès interdit');
  };
};
```

```typescript
// donaction-api/src/api/klubr-membre/middlewares/can-update.ts
export default (config, { strapi }) => {
  return async (ctx, next) => {
    const user = ctx.state.user;
    const { uuid } = ctx.params;

    if (!user) {
      return ctx.unauthorized('Non authentifié');
    }

    const member = await strapi.db.query('api::klubr-membre.klubr-membre').findOne({
      where: { uuid },
      populate: ['klubr', 'user']
    });

    if (!member) {
      return ctx.notFound('Membre non trouvé');
    }

    // Can update if: own profile, klubr owner, or admin
    const isOwnProfile = member.user?.id === user.id;
    const isKlubrOwner = await isUserKlubrOwner(user, member.klubr);
    const isAdmin = await isUserAdmin(user);

    if (isOwnProfile || isKlubrOwner || isAdmin) {
      return await next();
    }

    return ctx.forbidden('Vous ne pouvez pas modifier ce profil');
  };
};
```

```typescript
// Register in routes config
// donaction-api/src/api/klubr/routes/klubr-custom.ts
export default {
  routes: [
    {
      method: 'PUT',
      path: '/klubrs/:uuid',
      handler: 'klubr.update',
      config: {
        middlewares: ['api::klubr.owner-or-admin']
      }
    }
  ]
};
```
