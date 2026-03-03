---
name: skill:strapi-backend-patterns
description: Strapi v5 patterns for backend API. Use when creating controllers, services, middlewares, or database operations in donaction-api.
model: claude-sonnet-4-5
---

# Strapi Backend Skills

## Available Patterns

| Pattern | File | Use When |
|---------|------|----------|
| Controllers | [controllers.md](controllers.md) | REST endpoints, CRUD override |
| Services | [services.md](services.md) | Business logic |
| Document Service | [document-service-api.md](document-service-api.md) | CRUD with documentId |
| Lifecycles | [lifecycles.md](lifecycles.md) | Database hooks |
| Middleware | [custom-middleware.md](custom-middleware.md) | Permission checks |
| JWT Token | [jwt-token.md](jwt-token.md) | Authentication |
| Stripe Payment | [stripe-payment.md](stripe-payment.md) | Payment processing |

## Core Principles

- **Factory pattern**: `factories.createCoreController/Service`
- **Sanitization**: Always validate → sanitize → process → sanitize output
- **documentId**: Use instead of `id` for all operations
- **Thin controllers**: Business logic in services only

## Reference

Full rules: `/docs/rules/backend/strapi-v5/strapi-v5-coding-rules.md`
