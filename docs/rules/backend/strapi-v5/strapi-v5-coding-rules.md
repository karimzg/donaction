# Strapi v5 Coding Rules & Best Practices

> **Version**: Strapi 5.13.0
> **Last Updated**: 2025-12-18
> **Sources**: [Official Strapi v5 Documentation](https://docs.strapi.io/), donaction-api codebase analysis

---

## Table of Contents

1. [Core Architecture](#core-architecture)
2. [Controllers](#controllers)
3. [Services](#services)
4. [Document Service API](#document-service-api)
5. [Lifecycle Hooks](#lifecycle-hooks)
6. [Routes & Middlewares](#routes--middlewares)
7. [Database Access](#database-access)
8. [TypeScript Patterns](#typescript-patterns)
9. [Error Handling](#error-handling)
10. [Security & Permissions](#security--permissions)
11. [Email Handling](#email-handling)
12. [Configuration](#configuration)

---

## Core Architecture

### Project Structure

```
src/
├── api/
│   └── [entity-name]/
│       ├── content-types/
│       │   └── [entity-name]/
│       │       ├── schema.json          # Content type definition
│       │       └── lifecycles.ts        # Lifecycle hooks
│       ├── controllers/
│       │   └── [entity-name].ts         # Request handlers
│       ├── services/
│       │   └── [entity-name].ts         # Business logic
│       ├── routes/
│       │   ├── [entity-name].ts         # Default CRUD routes
│       │   └── [entity-name]-custom.ts  # Custom endpoints
│       └── middlewares/
│           └── [middleware-name].ts     # Route-specific middleware
├── components/                          # Reusable Strapi components
├── extensions/                          # Core extensions
├── helpers/                             # Utility functions
├── middlewares/                         # Global middlewares
├── plugins/                             # Custom plugins
├── constants.ts                         # Global constants
├── _types.ts                            # Global TypeScript types
└── index.ts                             # Bootstrap entry point
```

### Naming Conventions

- **Files**: kebab-case (`klubr-membre.ts`)
- **Types/Interfaces**: PascalCase with `Entity` suffix (`KlubrEntity`)
- **Functions**: camelCase (`findBySlug`)
- **Constants**: UPPER_SNAKE_CASE (`CLUB_STATUS`)
- **API Identifiers**: kebab-case (`api::klubr.klubr`)

---

## Controllers

### Factory Pattern (REQUIRED)

**ALWAYS use `factories.createCoreController`** for all controllers:

```typescript
import { Core, factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::klubr.klubr',
  ({ strapi }: { strapi: Core.Strapi }) => ({
    // Custom actions here
  })
);
```

### Context Access

**ALWAYS** retrieve context using `strapi.requestContext.get()`:

```typescript
async findOne() {
  const ctx = strapi.requestContext.get();
  const { uuid } = ctx.params;

  // Access context properties:
  // - ctx.params: URL parameters
  // - ctx.query: Query string parameters
  // - ctx.request.body: Request body
  // - ctx.state.user: Authenticated user
  // - ctx.request.files: Uploaded files
}
```

### Validation & Sanitization (CRITICAL)

**MANDATORY order for all controller actions**:

1. **Validate query**: `await this.validateQuery(ctx)`
2. **Sanitize query**: `await this.sanitizeQuery(ctx)`
3. **Process request**
4. **Sanitize output**: `await this.sanitizeOutput(entity, ctx)`

```typescript
async findOne() {
  const ctx = strapi.requestContext.get();

  // 1. Validate
  await this.validateQuery(ctx);

  // 2. Sanitize query
  const sanitizedQueryParams = await this.sanitizeQuery(ctx);

  // 3. Process
  const { results } = await strapi
    .service('api::klubr.klubr')
    .find(sanitizedQueryParams);

  // 4. Sanitize output
  const sanitizedResult = await this.sanitizeOutput(results[0], ctx);
  return removeId(sanitizedResult); // Custom helper
}
```

### Core Action Overrides

Override default CRUD actions by matching method names:

```typescript
export default factories.createCoreController(
  'api::klubr.klubr',
  ({ strapi }) => ({
    // Override find
    async find(ctx) {
      // Custom logic
      return await super.find(ctx); // Call parent if needed
    },

    // Override findOne
    async findOne(ctx) { /* ... */ },

    // Override create
    async create(ctx) { /* ... */ },

    // Override update
    async update(ctx) { /* ... */ },

    // Override delete
    async delete(ctx) { /* ... */ },
  })
);
```

### Custom Actions

Add custom endpoints beyond CRUD:

```typescript
export default factories.createCoreController(
  'api::klubr.klubr',
  ({ strapi }) => ({
    async findBySlug() {
      const ctx = strapi.requestContext.get();
      const { slug } = ctx.params;
      // Custom logic
    },

    async getKlubrStats() {
      const ctx = strapi.requestContext.get();
      // Custom statistics logic
    },
  })
);
```

### Response Methods

Use Koa context methods for HTTP responses:

```typescript
// Success responses
ctx.send({ data: result });
return result; // Auto-wrapped

// Error responses
ctx.badRequest('Missing UUID');
ctx.unauthorized('Authentication required');
ctx.forbidden('Access denied');
ctx.notFound('Entity not found');
ctx.internalServerError('Server error');

// File responses
ctx.response.type = 'application/pdf';
ctx.response.attachment('filename.pdf');
ctx.set('Access-Control-Expose-Headers', 'Content-Disposition');
ctx.body = fileBuffer;
```

---

## Services

### Factory Pattern (REQUIRED)

**ALWAYS use `factories.createCoreService`**:

```typescript
import { Core, factories } from '@strapi/strapi';

export default factories.createCoreService(
  'api::klubr.klubr',
  ({ strapi }: { strapi: Core.Strapi }) => ({
    // Custom service methods
    async sendInvitationEmail(email, host, club, code) {
      // Business logic here
    },
  })
);
```

### Service Access

Services are accessed globally via namespaced strings:

```typescript
// API services
const result = await strapi.service('api::klubr.klubr').find(params);

// Plugin services
const result = await strapi.service('plugin::users-permissions.user').findOne(id);
```

### Pure Business Logic

Services should contain **ONLY business logic**:

- ✅ Data transformations
- ✅ Complex calculations
- ✅ Email sending
- ✅ External API calls
- ✅ Helper functions

❌ **DO NOT** include in services:
- Request/response handling
- Authentication checks (use middlewares)
- Direct context manipulation

### Helper Functions

Extract pure functions outside the factory:

```typescript
export default factories.createCoreService(
  'api::klubr.klubr',
  ({ strapi }) => ({
    async setKlubrInfosRequiredFieldsCompletion(klubr, withoutUpdate = false) {
      const requiredFields = ['denomination', 'federationLink', /* ... */];
      const emptyFieldsCount = countEmptyFields(klubr, requiredFields);
      // ...
    },
  })
);

// Pure helper function (module-level)
const countEmptyFields = (klubr: KlubrEntity, requiredFields: Array<string>) => {
  return requiredFields.reduce((count, field) => {
    if (klubr[field] === null || klubr[field] === undefined || klubr[field] === '') {
      return count + 1;
    }
    return count;
  }, 0);
};
```

---

## Document Service API

### Core Concept: documentId

**CRITICAL**: Strapi v5 uses `documentId` (24-character alphanumeric string) instead of `id`.

- `documentId`: Persistent, version-agnostic identifier
- `id`: Internal database ID (unstable, avoid using)

### Primary Methods

All Document Service methods are accessed via `strapi.documents()`:

```typescript
// Find many documents
const results = await strapi
  .documents('api::klubr.klubr')
  .findMany({
    filters: { slug: { $eq: 'my-club' } },
    populate: ['logo', 'klubr_house'],
    sort: ['createdAt:desc'],
    pagination: { page: 1, pageSize: 10 },
  });

// Find one document by documentId
const entity = await strapi
  .documents('api::klubr.klubr')
  .findOne({
    documentId: 'abc123xyz456',
    populate: ['logo'],
  });

// Create document
const newEntity = await strapi
  .documents('api::klubr.klubr')
  .create({
    data: {
      denomination: 'My Club',
      status: 'published', // Publish immediately
    },
  });

// Update document (by documentId)
const updated = await strapi
  .documents('api::klubr.klubr')
  .update({
    documentId: entity.documentId,
    data: { denomination: 'New Name' },
  });

// Delete document
await strapi
  .documents('api::klubr.klubr')
  .delete({
    documentId: entity.documentId,
  });

// Count documents
const count = await strapi
  .documents('api::klubr.klubr')
  .count({
    filters: { status: 'published' },
  });
```

### Draft & Publish Operations

```typescript
// Publish a draft
await strapi.documents('api::klubr.klubr').publish({
  documentId: entity.documentId,
});

// Unpublish (revert to draft)
await strapi.documents('api::klubr.klubr').unpublish({
  documentId: entity.documentId,
});

// Discard draft (reset to published version)
await strapi.documents('api::klubr.klubr').discardDraft({
  documentId: entity.documentId,
});
```

### Status & Locale Handling

By default, Document Service returns **draft versions in default locale**:

```typescript
// Explicitly request published documents
const published = await strapi
  .documents('api::klubr.klubr')
  .findMany({
    status: 'published', // Override default 'draft'
    locale: 'fr',        // Override default locale
  });
```

### Best Practices

1. **Use `documentId` for updates/deletes**, not `id`
2. **Avoid updating repeatable components** via Document Service (use Entity Service)
3. **Specify status explicitly** when querying published content
4. **Published versions are immutable** - updates only affect drafts

---

## Lifecycle Hooks

### ⚠️ Critical Change in Strapi v5

**Lifecycle hooks are NO LONGER the recommended approach** for most use cases. Strapi v5 recommends **Document Service Middleware** instead.

**When to use lifecycle hooks**:
- ✅ Database-level operations
- ✅ `users-permissions` plugin actions
- ✅ File upload events
- ❌ Business logic (use middlewares instead)

### Implementation Pattern

```typescript
import { LifecycleEvent, KlubrEntity } from '../../../../_types';
import { v4 as uuidv4 } from 'uuid';

export default {
  async beforeCreate(event: LifecycleEvent<KlubrEntity>) {
    const { data } = event.params;

    // Generate UUID if not present
    if (!data.uuid) {
      data.uuid = uuidv4();
    }

    // Modify data before save
    event.params.data.code =
      'KC' + Math.random().toString(36).substring(2, 8).toUpperCase();
  },

  async beforeUpdate(event: LifecycleEvent<KlubrEntity>) {
    // Ensure code exists
    event.params.data.code =
      event.params.data.code ||
      'KC' + Math.random().toString(36).substring(2, 8).toUpperCase();
  },

  async afterCreate(event: LifecycleEvent<KlubrEntity>) {
    const { result } = event;
    // Perform side effects after creation
  },
};
```

### Available Lifecycle Events

- `beforeCreate` - Before document creation
- `afterCreate` - After document creation
- `beforeUpdate` - Before document update
- `afterUpdate` - After document update
- `beforeDelete` - Before document deletion
- `afterDelete` - After document deletion
- `beforeFindOne` - Before single document retrieval
- `afterFindOne` - After single document retrieval
- `beforeFindMany` - Before multiple documents retrieval
- `afterFindMany` - After multiple documents retrieval

### Important Limitations

1. **Bulk operations** (`createMany`, `updateMany`, `deleteMany`) **DO NOT** trigger lifecycle hooks
2. **Multiple triggers** - In v5, creating a published document triggers `beforeCreate` and `afterCreate` **twice** (once for draft, once for published)
3. **Event structure** - Access via `event.params.data` (before) and `event.result` (after)

### Global Lifecycle Subscription

Use `strapi.db.lifecycles.subscribe()` in `src/index.ts` for cross-entity hooks:

```typescript
export default {
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Subscribe to all lifecycle events
    strapi.db.lifecycles.subscribe(async (event) => {
      if (event.model.uid === 'plugin::upload.file' &&
          event.action === 'beforeCreate') {
        // Handle file upload
      }
    });

    // Subscribe to specific model
    strapi.db.lifecycles.subscribe({
      models: ['plugin::users-permissions.user'],
      async afterCreate(event) {
        // User-specific logic
      },
    });
  },
};
```

---

## Routes & Middlewares

### Custom Routes

Create custom route files in `routes/[entity-name]-custom.ts`:

```typescript
export default {
  routes: [
    {
      method: 'GET',
      path: '/klubrs/:uuid',
      handler: 'klubr.findOne',
      config: {
        // auth: false,        // Disable authentication
        policies: [],          // Apply policies
        middlewares: [
          'api::klubr.klubr',  // String reference
          {
            name: 'api::klubr.remove-unauthorized-fields',
            config: { list: false }, // Pass config
          },
        ],
      },
    },
    {
      method: 'POST',
      path: '/klubrs/:uuid/documents',
      handler: 'klubr.postFileDocuments',
      config: {
        middlewares: ['api::klubr.owner-or-admin'],
      },
    },
  ],
};
```

### Middleware Implementation

Middlewares receive `config` and `strapi`, return async function with `ctx` and `next`:

```typescript
import { Core } from '@strapi/strapi';
import { Context } from 'koa';

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx: Context, next: () => Promise<void>) => {
    const { user } = ctx.state;

    // Permission check
    if (!hasPermission(user, ctx.params.uuid)) {
      return ctx.unauthorized('Access denied');
    }

    // Continue to next middleware/controller
    await next();
  };
};
```

### Permission Middleware Pattern

Extract permission checks to helper functions:

```typescript
// helpers/permissions.ts
export const profileIsAtLeastKlubrLeader = (
  profile: KlubrMemberEntity,
  klubrUuid: string
) => memberIsAtLeastLeader(profile) && profile.klubr?.uuid === klubrUuid;

// middlewares/owner-or-admin.ts
export default (config, { strapi }) => {
  return async (ctx, next) => {
    const { user } = ctx.state;

    let profile = null;
    if (user?.last_member_profile_used) {
      profile = await strapi.db
        .query('api::klubr-membre.klubr-membre')
        .findOne({
          where: { uuid: user.last_member_profile_used },
          populate: { klubr: true },
        });
    }

    if (!profileIsAtLeastKlubrLeader(profile, ctx.params.uuid) &&
        !profileIsKlubrAdmin(profile)) {
      return ctx.unauthorized('Access denied');
    }

    await next();
  };
};
```

### Global Middlewares

Configure in `config/middlewares.ts`:

```typescript
export default [
  'global::request-logger',      // Custom global middleware
  'strapi::errors',               // Error handler
  'strapi::security',             // Security headers
  'strapi::cors',                 // CORS
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      formLimit: '20mb',
      jsonLimit: '20mb',
      textLimit: '20mb',
      formidable: {
        maxFileSize: 40 * 1024 * 1024,
      },
      multipart: true,
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

---

## Database Access

### Query Engine (Legacy)

Use `strapi.db.query()` for **direct database access**:

```typescript
// Find one with populate
const entity = await strapi.db
  .query('api::klubr.klubr')
  .findOne({
    where: { uuid },
    populate: {
      logo: true,
      klubr_house: true,
      federationLink: {
        populate: { klubr: true },
      },
    },
  });

// Find many with filters
const entities = await strapi.db
  .query('api::klubr.klubr')
  .findMany({
    where: {
      status: { $eq: 'published' },
      denomination: { $contains: 'Club' },
    },
    populate: ['logo'],
    orderBy: [{ createdAt: 'desc' }],
    limit: 10,
    offset: 0,
  });

// Count with filters
const count = await strapi.db
  .query('api::klubr.klubr')
  .count({
    where: { status: 'published' },
  });

// Find with count
const [results, total] = await strapi.db
  .query('api::klub-don.klub-don')
  .findWithCount({
    select: ['documentId', 'montant', 'id'],
    where: {
      klubr: { id: { $eq: klubId } },
      statusPaiment: { $eq: 'success' },
    },
    populate: {
      klub_projet: { fields: ['id'] },
    },
  });

// Update
await strapi.db
  .query('api::klubr-info.klubr-info')
  .update({
    where: { klubr: klubrId },
    data: { requiredFieldsCompletion: 75 },
  });
```

### Query Operators

```typescript
// Comparison
{ field: { $eq: value } }
{ field: { $ne: value } }
{ field: { $gt: value } }
{ field: { $gte: value } }
{ field: { $lt: value } }
{ field: { $lte: value } }

// Arrays
{ field: { $in: [value1, value2] } }
{ field: { $notIn: [value1, value2] } }

// Strings
{ field: { $contains: 'text' } }
{ field: { $notContains: 'text' } }

// Null checks
{ field: { $null: true } }
{ field: { $notNull: true } }

// Logic
{
  $and: [
    { field1: { $eq: value1 } },
    { field2: { $eq: value2 } },
  ]
}
{
  $or: [
    { field1: { $eq: value1 } },
    { field2: { $eq: value2 } },
  ]
}
```

### Document Service vs Query Engine

| Operation | Use Document Service | Use Query Engine |
|-----------|---------------------|------------------|
| CRUD with draft/publish | ✅ | ❌ |
| Multi-locale support | ✅ | ❌ |
| Complex filters | ❌ | ✅ |
| Direct database access | ❌ | ✅ |
| Raw SQL | ❌ | ✅ (`strapi.db.connection.raw()`) |
| `findWithCount` | ❌ | ✅ |
| Controllers (recommended) | ✅ | ❌ |
| Services (recommended) | ✅ | ❌ |
| Middlewares/Lifecycles | ❌ | ✅ |

---

## TypeScript Patterns

### Type Definitions

Define all entity types in `src/_types.ts`:

```typescript
import { Data } from '@strapi/strapi';

// Entity types using Data.ContentType
export type KlubrEntity = Data.ContentType<'api::klubr.klubr', 'fields'> & {
  id?: number;
  documentId?: string;
  uuid?: string;
  // Additional computed fields
  nbProjects?: number;
  statNbDons?: number;
};

export type UserEntity = {
  id: number;
  uuid: string;
  username: string;
  email: string;
  role: {
    id: number;
    name: string;
    type: string;
  };
  klubr_membres: KlubrMemberEntity[];
  last_member_profile_used?: string;
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
  state?: any;
};
```

### Type Usage in Controllers

```typescript
import { KlubrEntity, PaginationEntity } from '../../../_types';

export default factories.createCoreController(
  'api::klubr.klubr',
  ({ strapi }: { strapi: Core.Strapi }) => ({
    async find() {
      const ctx = strapi.requestContext.get();

      const {
        results,
        pagination,
      }: { results: Array<KlubrEntity>; pagination: PaginationEntity } =
        await strapi.service('api::klubr.klubr').find(sanitizedQueryParams);

      return { data: results, meta: { pagination } };
    },
  })
);
```

### TypeScript Configuration

Use permissive settings for Strapi compatibility:

```json
{
  "compilerOptions": {
    "strict": false,
    "noImplicitThis": true,
    "target": "ES2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true
  }
}
```

### Type Assertions

Use `@ts-ignore` sparingly for Strapi API limitations:

```typescript
// @ts-ignore - Strapi filters don't have proper types
const filters = {
  $and: [...klubrFilters, ...statusFilter],
};

const projects = await strapi
  .documents('api::klub-projet.klub-projet')
  .findMany({
    fields: ['id'],
    populate: { klubr: { fields: ['id'] } },
    // @ts-ignore
    filters,
  });
```

---

## Error Handling

### Controller Error Responses

Use Koa context methods for consistent errors:

```typescript
async findOne() {
  const ctx = strapi.requestContext.get();
  const { uuid } = ctx.params;

  // Validation errors
  if (!uuid) {
    return ctx.badRequest('Missing klub uuid.');
  }

  // Not found errors
  if (results.length === 0) {
    return ctx.notFound('Klub not found');
  }

  // Authorization errors
  if (!hasPermission(user, uuid)) {
    return ctx.unauthorized('Authentication required');
  }

  // Forbidden errors
  if (!isOwner(user, uuid)) {
    return ctx.forbidden('Access denied');
  }

  // Server errors
  try {
    // Operation
  } catch (error) {
    console.error('Error:', error);
    return ctx.internalServerError('Server error occurred');
  }
}
```

### Try-Catch Pattern

Wrap operations in try-catch with logging:

```typescript
async create() {
  const ctx = strapi.requestContext.get();
  try {
    const entity = await strapi.documents('api::klubr.klubr').create({
      data: ctx.request.body.data,
    });
    return entity;
  } catch (e) {
    console.error('Create error:', e);
    return ctx.badRequest(`Error creating entity: ${e.message}`);
  }
}
```

### Nested Error Extraction

Parse nested error structures:

```typescript
// Blob error parsing example
if (error.error && typeof error.error === 'object') {
  const nestedError = error.error.error || error.error;
  const message = nestedError.message || 'Unknown error';
  return ctx.badRequest(message);
}
```

### Console Logging

Use console logs for debugging (not production-ready):

```typescript
console.log('Processing request for UUID:', uuid);
console.error('Database query failed:', error);
console.log('Results:', JSON.stringify(results, null, 2));
```

---

## Security & Permissions

### Authentication Check

Verify user authentication in controllers:

```typescript
async findBySlug() {
  const ctx = strapi.requestContext.get();
  const { preview } = ctx.params;
  const isPreview = preview === 'preview';

  if (isPreview) {
    if (!ctx.state['user']) {
      return ctx.unauthorized(
        'Merci de vous authentifier pour prévisualiser ce club.'
      );
    }
  }
}
```

### Permission Helpers

Create reusable permission check functions:

```typescript
// helpers/permissions.ts
import { MEMBER_ROLES } from './memberRoles';

export const profileIsKlubrAdmin = (profile: KlubrMemberEntity) =>
  profile?.role === MEMBER_ROLES.Admin.name;

export const profileIsAtLeastKlubrLeader = (
  profile: KlubrMemberEntity,
  klubrUuid: string
) =>
  profile?.role &&
  MEMBER_ROLES[profile.role].weight >= MEMBER_ROLES.KlubMemberLeader.weight &&
  profile.klubr?.uuid === klubrUuid;

export const isKlubrOwner = (user: UserEntity, klubrUuid: string) =>
  user.klubr_membres.some(
    (m) => m.klubr?.uuid === klubrUuid && m.role === 'Admin'
  );
```

### Role-Based Middleware

```typescript
// middlewares/admin-only.ts
export default (config, { strapi }) => {
  return async (ctx, next) => {
    const { user } = ctx.state;

    if (!user || user.role?.name !== 'Admin') {
      return ctx.forbidden('Admin access required');
    }

    await next();
  };
};
```

### Sanitization Helpers

Remove sensitive fields before responses:

```typescript
// helpers/sanitizeHelpers.ts
export const removeId = (data: any) => {
  if (Array.isArray(data)) {
    return data.map(item => removeId(item));
  }
  if (data && typeof data === 'object') {
    const { id, ...rest } = data;
    return rest;
  }
  return data;
};

export const removeCodes = (data: any) => {
  if (data && typeof data === 'object') {
    const { code, codeLeader, invitationCode, ...rest } = data;
    return rest;
  }
  return data;
};

// Usage
const sanitizedResult = await this.sanitizeOutput(entity, ctx);
return removeId(removeCodes(sanitizedResult));
```

### CORS Configuration

Configure CORS in `config/middlewares.ts`:

```typescript
{
  name: 'strapi::cors',
  config: {
    origin: [
      'https://www.donaction.fr',
      'https://donaction.fr',
      'http://localhost:3100'
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
    keepHeaderOnError: true,
  },
}
```

### Content Security Policy

```typescript
{
  name: 'strapi::security',
  config: {
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'connect-src': ["'self'", 'https:'],
        'img-src': ["'self'", 'data:', 'blob:', 'ik.imagekit.io'],
        'media-src': ["'self'", 'data:', 'blob:', 'ik.imagekit.io'],
        'script-src': ["'self'", "'unsafe-inline'", 'maps.googleapis.com'],
        upgradeInsecureRequests: null,
      },
    },
  },
}
```

---

## Email Handling

### Brevo Email Service

Use `sendBrevoTransacEmail()` helper for all transactional emails:

```typescript
// helpers/emails/sendBrevoTransacEmail.ts
import { BREVO_TEMPLATES } from '../constants';

await sendBrevoTransacEmail({
  to: [{ email: 'user@example.com', name: 'User Name' }],
  templateId: BREVO_TEMPLATES.MEMBER_INVITATION,
  params: {
    CLUB_NAME: 'My Club',
    INVITATION_CODE: code,
    INVITATION_LINK: `${host}/invitation/${code}`,
  },
  tags: ['invitation', 'member'],
  attachment: [
    { filename: 'document.pdf', path: '/path/to/file.pdf' },
  ],
});
```

### Email Best Practices

- **Template IDs**: Use `BREVO_TEMPLATES` enum constants
- **Tags**: Include array for categorization and analytics
- **Attachments**: Array of `{ filename, path }` objects
- **Dynamic Params**: Template variables for personalization
- **Error Handling**: Wrap in try-catch, log failures
- **Testing**: Use test email addresses in development

### Common Email Templates

```typescript
// constants.ts
export const BREVO_TEMPLATES = {
  MEMBER_INVITATION: 1,
  PASSWORD_RESET: 2,
  DONATION_CONFIRMATION: 3,
  TAX_RECEIPT: 4,
  NEWSLETTER: 5,
};
```

---

## Configuration

### Database Configuration

```typescript
// config/database.ts
export default ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');

  const connections = {
    postgres: {
      connection: {
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: env.bool('DATABASE_SSL', false),
        schema: env('DATABASE_SCHEMA', 'public'),
      },
      pool: {
        min: env.int('DATABASE_POOL_MIN', 2),
        max: env.int('DATABASE_POOL_MAX', 10)
      },
    },
    sqlite: {
      connection: {
        filename: path.join(__dirname, '..', '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      useNullAsDefault: true,
    },
  };

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};
```

### Bootstrap Lifecycle

```typescript
// src/index.ts
import type { Core } from '@strapi/strapi';

export default {
  async register({ strapi }: { strapi: Core.Strapi }) {
    // Extend code before app initialization
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Subscribe to global lifecycles
    strapi.db.lifecycles.subscribe(async (event) => {
      // Global lifecycle logic
    });
  },
};
```

### Environment Variables

Access via `process.env`:

```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const apiToken = process.env.STRAPI_API_TOKEN;
const nodeEnv = process.env.NODE_ENV;
```

---

## Best Practices Summary

### ✅ DO

1. **Use factory functions** for controllers and services
2. **Sanitize and validate** all inputs and outputs
3. **Use Document Service API** for CRUD operations in controllers/services
4. **Use Query Engine** for complex filters and direct database access
5. **Use `documentId`** instead of `id` for entity references
6. **Extract business logic** to services
7. **Extract permissions** to helper functions
8. **Use TypeScript** for type safety
9. **Log errors** with descriptive messages
10. **Return consistent error responses** via Koa context methods

### ❌ DON'T

1. **Don't skip sanitization** - always sanitize queries and outputs
2. **Don't use lifecycle hooks** for business logic (use middlewares)
3. **Don't access `id` directly** - use `documentId` in Strapi v5
4. **Don't mix Document Service and Query Engine** without understanding the difference
5. **Don't expose internal IDs** - use `removeId()` helper
6. **Don't expose sensitive fields** - use `removeCodes()` and similar helpers
7. **Don't update repeatable components** via Document Service
8. **Don't use bulk operations** with lifecycle hooks (they don't trigger)
9. **Don't forget `await`** on async operations
10. **Don't use `any` type** when entity types are available

---

## References

- [Strapi v5 Documentation](https://docs.strapi.io/)
- [Controllers](https://docs.strapi.io/cms/backend-customization/controllers)
- [Services](https://docs.strapi.io/cms/backend-customization/services)
- [Document Service API](https://docs.strapi.io/cms/api/document-service)
- [Lifecycle Hooks vs Document Service Middleware](https://strapi.io/blog/what-are-document-service-middleware-and-what-happened-to-lifecycle-hooks-1)
- [Migration Guide v4 to v5](https://docs.strapi.io/cms/migration/v4-to-v5/introduction-and-faq)
- [Release Notes](https://docs.strapi.io/release-notes)

---

**Last Updated**: 2025-12-03
**Strapi Version**: 5.13.0
**Maintained by**: donaction-api development team
