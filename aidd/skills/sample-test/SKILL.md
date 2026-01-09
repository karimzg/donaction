---
name: skill:generating-uuid
description: Generates UUID fields for Strapi entities. Use when creating new content types that need unique public identifiers instead of exposing internal database IDs.
model: claude-haiku-4-5
---

# Generating UUID for Strapi Entities

## When to Use

- Creating new Strapi content type that needs public identifier
- Adding UUID to existing entity without one
- Replacing exposed internal IDs with UUIDs

## Pattern

```typescript
// In lifecycle: src/api/[entity]/content-types/[entity]/lifecycles.ts
import { v4 as uuidv4 } from 'uuid';

export default {
  async beforeCreate(event) {
    if (!event.params.data.uuid) {
      event.params.data.uuid = uuidv4();
    }
  },
};
```

## Schema Addition

```json
{
  "uuid": {
    "type": "string",
    "unique": true,
    "configurable": false
  }
}
```

## Checklist

- [ ] Add `uuid` field to schema.json
- [ ] Create lifecycle hook with beforeCreate
- [ ] Use `uuid` in API responses instead of `id`
- [ ] Add to sanitization helpers if needed
