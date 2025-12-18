# Strapi v5 Documentation for Klubr API

> Comprehensive programming guidelines and best practices for Strapi v5 development

---

## 📚 Documentation Structure

### 1. [Strapi v5 Coding Rules](strapi-v5-coding-rules.md) (Main Reference)

**Complete guide covering**:
- Core architecture patterns
- Controllers with factory functions
- Services layer organization
- Document Service API
- Lifecycle hooks vs middlewares
- Database access patterns
- TypeScript patterns
- Error handling
- Security & permissions
- Configuration

**When to use**: Comprehensive reference when implementing new features or refactoring code.

---

### 2. [Quick Reference Checklist](quick-reference.md)

**Fast lookup for**:
- Controller action templates
- Service templates
- Document Service API methods
- Database query patterns
- Route & middleware templates
- Common filters
- Error responses
- Security checklist
- Common pitfalls

**When to use**: Daily development for quick pattern lookup and validation.

---

## 🎯 Getting Started

### For New Developers

1. **Read** [Strapi v5 Coding Rules](strapi-v5-coding-rules.md) from start to finish
2. **Bookmark** [Quick Reference](quick-reference.md) for daily use
3. **Review** existing `donaction-api` code to see patterns in action
4. **Consult** official [Strapi v5 Documentation](https://docs.strapi.io/) for deep dives

### For Experienced Developers

1. **Skim** [Strapi v5 Coding Rules](strapi-v5-coding-rules.md) focusing on "Breaking Changes" sections
2. **Use** [Quick Reference](quick-reference.md) as your daily companion
3. **Pay attention** to Document Service API vs Query Engine differences

---

## 🔑 Key Concepts

### Critical Breaking Changes from Strapi v4

1. **`documentId` replaces `id`** - Use `documentId` for all document operations
2. **Document Service API is primary** - Preferred for CRUD in controllers/services
3. **Lifecycle hooks changed behavior** - Now trigger multiple times for draft/publish
4. **Document Service Middleware recommended** - Replaces most lifecycle hook use cases
5. **Draft & Publish rearchitected** - Published versions are immutable

### Architecture Decision Tree

```
Need to perform operation?
│
├─ In Controller/Service?
│  ├─ CRUD with draft/publish? → Document Service API ✅
│  └─ Complex filters/aggregations? → Query Engine ✅
│
├─ In Middleware/Lifecycle?
│  └─ Always use Query Engine ✅
│
└─ Business logic?
   ├─ Request handling → Controller
   ├─ Reusable logic → Service
   ├─ Permission checks → Middleware
   └─ Database hooks → Lifecycle
```

---

## 📋 Code Review Checklist

Before submitting code, verify:

### Controllers
- ✅ Uses `factories.createCoreController`
- ✅ Gets context via `strapi.requestContext.get()`
- ✅ Calls `validateQuery()` and `sanitizeQuery()`
- ✅ Sanitizes output via `sanitizeOutput()`
- ✅ Removes internal fields (`removeId()`)
- ✅ Returns consistent error responses

### Services
- ✅ Uses `factories.createCoreService`
- ✅ Contains only business logic
- ✅ Uses Document Service API for CRUD
- ✅ Helper functions extracted to module level

### Routes
- ✅ Custom routes in `*-custom.ts` files
- ✅ Middlewares properly configured
- ✅ Handler references correct controller method

### Middlewares
- ✅ Returns async function with `ctx` and `next`
- ✅ Calls `await next()` when passing through
- ✅ Uses permission helpers from `helpers/permissions.ts`
- ✅ Returns appropriate error response

### Security
- ✅ All queries sanitized
- ✅ All outputs sanitized
- ✅ Internal IDs removed
- ✅ Sensitive fields removed
- ✅ Permissions verified

### TypeScript
- ✅ Entity types defined in `_types.ts`
- ✅ Proper type imports
- ✅ `@ts-ignore` used only when necessary with comments

---

## 🚫 Common Mistakes

### ❌ Using `id` instead of `documentId`

```typescript
// ❌ WRONG
await strapi.documents('api::entity.entity').update({
  id: entity.id,
  data: {},
});

// ✅ CORRECT
await strapi.documents('api::entity.entity').update({
  documentId: entity.documentId,
  data: {},
});
```

### ❌ Skipping Sanitization

```typescript
// ❌ WRONG
async find() {
  const ctx = strapi.requestContext.get();
  return await strapi.service('api::entity.entity').find(ctx.query);
}

// ✅ CORRECT
async find() {
  const ctx = strapi.requestContext.get();
  await this.validateQuery(ctx);
  const sanitized = await this.sanitizeQuery(ctx);
  const result = await strapi.service('api::entity.entity').find(sanitized);
  return await this.sanitizeOutput(result, ctx);
}
```

### ❌ Business Logic in Lifecycle Hooks

```typescript
// ❌ WRONG
export default {
  async afterCreate(event) {
    await sendEmail(event.result);
  },
};

// ✅ CORRECT - Use service in controller
async create() {
  const entity = await super.create(ctx);
  await strapi.service('api::email.email').send(entity);
  return entity;
}
```

---

## 🔍 Debugging Guide

### Issue: "Cannot find entity"

1. Check if using `documentId` instead of `id`
2. Verify `status: 'published'` vs `'draft'`
3. Confirm populate paths are correct
4. Check filters are properly structured

### Issue: "Permission denied"

1. Verify `ctx.state.user` exists
2. Check middleware execution order
3. Validate permission helper logic
4. Review role configuration

### Issue: "Data not sanitized"

1. Ensure `validateQuery()` called
2. Confirm `sanitizeQuery()` used
3. Verify `sanitizeOutput()` applied
4. Check `removeId()` helper called

---

## 📖 Additional Resources

### Official Strapi Documentation

- [Strapi v5 Home](https://docs.strapi.io/)
- [Controllers](https://docs.strapi.io/cms/backend-customization/controllers)
- [Services](https://docs.strapi.io/cms/backend-customization/services)
- [Document Service API](https://docs.strapi.io/cms/api/document-service)
- [Middlewares](https://docs.strapi.io/cms/backend-customization/middlewares)
- [Routes](https://docs.strapi.io/cms/backend-customization/routes)
- [Migration Guide v4→v5](https://docs.strapi.io/cms/migration/v4-to-v5/introduction-and-faq)

### Strapi Blog Posts

- [Document Service Middleware vs Lifecycle Hooks](https://strapi.io/blog/what-are-document-service-middleware-and-what-happened-to-lifecycle-hooks-1)
- [When to Use Lifecycle Hooks](https://strapi.io/blog/when-to-use-lifecycle-hooks-in-strapi)
- [API Design 101](https://strapi.io/blog/api-design-101)

### Internal Klubr Documentation

- [API Documentation](../../memory-bank/api-docs.md)
- [Architecture](../../memory-bank/architecture.md)
- [Database](../../memory-bank/database.md)

---

## 🤝 Contributing

### Updating These Rules

When Strapi is updated or new patterns are discovered:

1. Update [strapi-v5-coding-rules.md](strapi-v5-coding-rules.md)
2. Update [quick-reference.md](quick-reference.md) if applicable
3. Update version number and "Last Updated" date
4. Document breaking changes clearly
5. Add examples from donaction-api codebase

### Suggesting Improvements

- File an issue with proposed changes
- Include code examples
- Reference official documentation
- Explain rationale

---

## 📊 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-03 | Initial comprehensive documentation for Strapi 5.13.0 |

---

## 📞 Support

- **Internal**: Ask team members familiar with Strapi v5
- **Official**: [Strapi Community Forum](https://forum.strapi.io/)
- **Issues**: [Strapi GitHub Issues](https://github.com/strapi/strapi/issues)
- **Discord**: [Strapi Discord Server](https://discord.strapi.io/)

---

**Maintained by**: Klubr API Development Team
**Last Updated**: 2025-12-03
**Strapi Version**: 5.13.0
