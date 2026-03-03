---
name: skill:managing-jwt-tokens
description: Manages JWT tokens with Strapi users-permissions plugin for authentication. Use when implementing auth flows in donaction-api.
model: claude-sonnet-4-5
---

# JWT Token Management

## Instructions

- Use Strapi users-permissions plugin for JWT generation
- Access authenticated user via `ctx.state.user` in controllers
- Store token in client-side state or HTTP-only cookies
- Validate token automatically via Strapi middleware
- Check user roles from `ctx.state.user.role`
- Return token on successful login from `/api/auth/local`
- Refresh token logic optional (not built-in to Strapi)
- Invalidate by removing from client storage (stateless JWT)

## Example

**Input:** "Implement JWT authentication flow"

**Output:** Login endpoint, token validation, protected route

```typescript
// donaction-api/src/extensions/users-permissions/controllers/auth.ts
export default (plugin) => {
  plugin.controllers.auth.login = async (ctx) => {
    const { identifier, password } = ctx.request.body;

    if (!identifier || !password) {
      return ctx.badRequest('Identifiants manquants');
    }

    try {
      // Strapi handles validation
      const { user, jwt } = await strapi
        .plugin('users-permissions')
        .service('user')
        .fetch(identifier, { password });

      return {
        jwt,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role
        }
      };
    } catch (error) {
      return ctx.badRequest('Identifiants invalides');
    }
  };

  return plugin;
};
```

```typescript
// Protected controller using ctx.state.user
// donaction-api/src/api/klubr/controllers/klubr.ts
export default factories.createCoreController(
  'api::klubr.klubr',
  ({ strapi }) => ({
    async update(ctx) {
      // Token validated by Strapi middleware
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('Token invalide ou expiré');
      }

      const { uuid } = ctx.params;
      const { data } = ctx.request.body;

      // Check permissions based on user
      const hasPermission = await checkUserPermission(user, uuid);
      if (!hasPermission) {
        return ctx.forbidden('Permission refusée');
      }

      const updated = await strapi.documents('api::klubr.klubr').update({
        documentId: uuid,
        data
      });

      return this.sanitizeOutput(updated, ctx);
    },

    async me(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('Non authentifié');
      }

      // Fetch user with relations
      const fullUser = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { id: user.id },
        populate: ['role', 'klubr_membres', 'klubr_membres.klubr']
      });

      return fullUser;
    }
  })
);
```

```typescript
// Frontend token storage (example)
// Store JWT in localStorage or cookie
localStorage.setItem('jwt', response.jwt);

// Include in API requests
fetch('/api/klubrs/123', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
  }
});

// Clear on logout
localStorage.removeItem('jwt');
```
