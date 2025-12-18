---
name: "strapi-services"
description: "Create Strapi services with factory pattern for reusable business logic"
triggers: ["service", "strapi service", "business logic", "helper functions", "cross-entity"]
tags: ["strapi", "backend", "service", "typescript"]
priority: high
scope: module
output: code
---

# Skill: Strapi Services

## When to use
When implementing business logic that should be reusable across controllers, lifecycles, or other services.

## Key Concepts
Services contain pure business logic. They should NOT handle HTTP requests/responses or authentication—that belongs in controllers/middlewares.

## Recommended Patterns

### Factory Pattern (Required)
```typescript
// src/api/klubr/services/klubr.ts
import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::klubr.klubr', ({ strapi }) => ({
  // Extend core service
  async findWithStats(documentId: string) {
    const klubr = await strapi.documents('api::klubr.klubr').findOne({
      documentId,
      populate: ['membres', 'projets', 'dons'],
    });

    if (!klubr) return null;

    return {
      ...klubr,
      stats: {
        membresCount: klubr.membres?.length || 0,
        projetsCount: klubr.projets?.length || 0,
        totalDons: klubr.dons?.reduce((sum, d) => sum + d.montant, 0) || 0,
      },
    };
  },

  async updateStatus(documentId: string, status: string) {
    return strapi.documents('api::klubr.klubr').update({
      documentId,
      data: { status },
    });
  },
}));
```
**Why**: Factory provides access to strapi instance and maintains consistency with core methods.

### Helper Functions (Module Level)
```typescript
// src/api/klubr/services/klubr.ts

// Helper at module level - NOT inside factory
function calculateCommission(amount: number, rate: number): number {
  return Math.round(amount * rate * 100) / 100;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default factories.createCoreService('api::klubr.klubr', ({ strapi }) => ({
  async createWithSlug(data: any) {
    const slug = generateSlug(data.name);
    return strapi.documents('api::klubr.klubr').create({
      data: { ...data, slug },
    });
  },
}));
```
**Why**: Pure functions are easier to test and can be extracted to shared helpers.

### Cross-Entity Operations
```typescript
// src/api/klubr/services/klubr.ts
export default factories.createCoreService('api::klubr.klubr', ({ strapi }) => ({
  async transferMember(memberDocId: string, fromKlubrDocId: string, toKlubrDocId: string) {
    // Update member
    await strapi.documents('api::klubr-membre.klubr-membre').update({
      documentId: memberDocId,
      data: { klubr: toKlubrDocId },
    });

    // Update counts on both clubs
    await this.updateMemberCount(fromKlubrDocId);
    await this.updateMemberCount(toKlubrDocId);

    return { success: true };
  },

  async updateMemberCount(klubrDocId: string) {
    const count = await strapi.documents('api::klubr-membre.klubr-membre').count({
      filters: { klubr: { documentId: klubrDocId } },
    });

    return strapi.documents('api::klubr.klubr').update({
      documentId: klubrDocId,
      data: { membresCount: count },
    });
  },
}));
```
**Why**: Services can orchestrate operations across multiple entities while keeping logic centralized.

### Calling Service from Controller
```typescript
// In controller
async findWithStats(ctx) {
  const { documentId } = ctx.params;

  const result = await strapi.service('api::klubr.klubr').findWithStats(documentId);

  if (!result) {
    return ctx.notFound('Club not found');
  }

  return this.sanitizeOutput(result, ctx);
}
```

## Detailed Anti-patterns

### ❌ HTTP Handling in Services
```typescript
// Wrong
async findKlubr(ctx) {  // Receiving ctx in service
  const { slug } = ctx.params;
  const klubr = await strapi.documents('api::klubr.klubr').findFirst({ filters: { slug } });
  if (!klubr) {
    return ctx.notFound();  // HTTP response in service
  }
  return klubr;
}
```
**Problem**: Couples service to HTTP layer, can't reuse in cron jobs or other services.
**Solution**: Return null/throw error, let controller handle HTTP response.

### ❌ Auth Checks in Services
```typescript
// Wrong
async updateKlubr(documentId, data, user) {
  const klubr = await strapi.documents('api::klubr.klubr').findOne({ documentId });
  if (klubr.owner !== user.id) {
    throw new Error('Unauthorized');  // Auth in service
  }
  // ...
}
```
**Problem**: Auth logic scattered, hard to maintain.
**Solution**: Use middlewares for auth, services assume caller is authorized.

## Checklist
- [ ] Using `factories.createCoreService()`
- [ ] No ctx/HTTP handling in services
- [ ] No auth checks (done in controller/middleware)
- [ ] Helper functions at module level
- [ ] Returns data or throws, never HTTP responses
