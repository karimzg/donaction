---
name: skill:using-document-service
description: Uses Strapi Document Service API for CRUD operations with documentId and draft/publish. Use when querying or modifying data in donaction-api.
model: claude-sonnet-4-5
---

# Skill: Strapi Document Service API

## When to use
When performing CRUD operations on Strapi content types. This is the primary API for all document operations in Strapi 5.

## Key Concepts

**Critical**: In Strapi 5, use `documentId` (24-char alphanumeric string), NOT `id` (integer).

Document Service handles:
- Draft/publish lifecycle
- Multi-locale content
- Automatic timestamps
- Relation management

## Recommended Patterns

### Basic CRUD Operations
```typescript
// Access document service
const docs = strapi.documents('api::klubr.klubr');

// Find many with filters
const klubrs = await docs.findMany({
  filters: {
    status: 'active',
    createdAt: { $gt: '2024-01-01' },
  },
  populate: ['logo', 'membres.avatar'],
  sort: ['createdAt:desc'],
  pagination: { page: 1, pageSize: 25 },
  status: 'published', // or 'draft'
});

// Find one by documentId
const klubr = await docs.findOne({
  documentId: 'abc123def456ghi789jkl012',
  populate: ['logo', 'membres'],
});

// Find first matching filter
const klubr = await docs.findFirst({
  filters: { slug: 'mon-club' },
  populate: '*',
});

// Count documents
const count = await docs.count({
  filters: { status: 'active' },
});
```
**Why**: Consistent API across all content types with built-in draft/publish support.

### Create Document
```typescript
const newKlubr = await strapi.documents('api::klubr.klubr').create({
  data: {
    name: 'Mon Club',
    slug: 'mon-club',
    status: 'pending',
    // Relation by documentId
    federation: 'fed-document-id-here',
  },
  // Optional: set status
  status: 'draft', // or 'published'
});

// newKlubr.documentId is the identifier for future operations
```
**Why**: Create returns the full document with documentId for subsequent operations.

### Update Document
```typescript
// ALWAYS use documentId, never id
const updated = await strapi.documents('api::klubr.klubr').update({
  documentId: 'abc123def456ghi789jkl012', // Required
  data: {
    name: 'Nouveau Nom',
    status: 'active',
  },
  // Optional: specify status to update
  status: 'draft',
});
```
**Why**: documentId is the stable identifier across draft/published versions.

### Delete Document
```typescript
// Delete by documentId
await strapi.documents('api::klubr.klubr').delete({
  documentId: 'abc123def456ghi789jkl012',
});

// Delete specific status
await strapi.documents('api::klubr.klubr').delete({
  documentId: 'abc123def456ghi789jkl012',
  status: 'draft', // Only delete draft version
});
```

### Publish/Unpublish Operations
```typescript
// Publish draft to published
await strapi.documents('api::klubr.klubr').publish({
  documentId: 'abc123def456ghi789jkl012',
});

// Unpublish (move published to draft)
await strapi.documents('api::klubr.klubr').unpublish({
  documentId: 'abc123def456ghi789jkl012',
});

// Discard draft changes (revert to published)
await strapi.documents('api::klubr.klubr').discardDraft({
  documentId: 'abc123def456ghi789jkl012',
});
```
**Why**: Published versions are immutable; changes go to draft first.

### Complex Filters
```typescript
const results = await strapi.documents('api::klubr.klubr').findMany({
  filters: {
    $and: [
      { status: 'active' },
      {
        $or: [
          { type: 'association' },
          { type: 'federation' },
        ],
      },
    ],
    membres: {
      role: { $in: ['admin', 'editor'] },
    },
    createdAt: {
      $gte: '2024-01-01',
      $lt: '2024-12-31',
    },
  },
});
```

### Filter Operators
| Operator | Description | Example |
|----------|-------------|---------|
| `$eq` | Equal | `{ status: { $eq: 'active' } }` |
| `$ne` | Not equal | `{ status: { $ne: 'deleted' } }` |
| `$in` | In array | `{ type: { $in: ['a', 'b'] } }` |
| `$notIn` | Not in array | `{ type: { $notIn: ['x'] } }` |
| `$lt` / `$lte` | Less than | `{ amount: { $lt: 100 } }` |
| `$gt` / `$gte` | Greater than | `{ amount: { $gte: 50 } }` |
| `$contains` | String contains | `{ name: { $contains: 'club' } }` |
| `$null` | Is null | `{ deletedAt: { $null: true } }` |
| `$and` / `$or` | Logical | `{ $or: [...] }` |

## Detailed Anti-patterns

### ❌ Using id Instead of documentId
```typescript
// Wrong - Will fail in Strapi 5
const klubr = await strapi.documents('api::klubr.klubr').findOne({
  id: 123,  // Integer id - WRONG
});

await strapi.documents('api::klubr.klubr').update({
  id: 123,  // WRONG
  data: { name: 'Test' },
});
```
**Problem**: Strapi 5 uses documentId (string) not id (integer).
**Solution**: Always use `documentId` parameter.

### ❌ Forgetting Status Parameter
```typescript
// Wrong - Gets draft by default
const klubr = await strapi.documents('api::klubr.klubr').findOne({
  documentId: 'abc123',
  // Missing status: 'published'
});
```
**Problem**: May return draft version instead of published.
**Solution**: Explicitly set `status: 'published'` for public-facing queries.

### ❌ Direct Relation Assignment
```typescript
// Wrong - Using object instead of documentId
await strapi.documents('api::klubr.klubr').update({
  documentId: 'abc123',
  data: {
    federation: { id: 5 },  // Wrong
  },
});
```
**Problem**: Relations should be documentId strings.
**Solution**: `federation: 'federation-document-id'`

## Checklist
- [ ] Using documentId (string), not id (integer)
- [ ] Specifying status for queries ('published' or 'draft')
- [ ] Using proper filter operators
- [ ] Relations as documentId strings
- [ ] Handling null results gracefully
