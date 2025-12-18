# Backend Skills Maintenance

## Overview

These skills are derived from the comprehensive Strapi v5 rules in:
- `/docs/rules/backend/strapi-v5/strapi-v5-coding-rules.md`
- `/docs/rules/backend/strapi-v5/quick-reference.md`

## Skills List

| Skill | Description |
|-------|-------------|
| `controllers.md` | Factory pattern, sanitization, custom routes |
| `services.md` | Business logic, helper functions |
| `document-service-api.md` | CRUD with documentId, filters |
| `lifecycles.md` | Database hooks (limited use in v5) |
| `custom-middleware.md` | Permission checks, authorization |
| `jwt-token.md` | Authentication, token management |
| `stripe-payment.md` | Payment intents, webhooks |

## When Updating Strapi Rules

1. Update comprehensive rules first in `/docs/rules/backend/strapi-v5/`
2. Review affected skills for consistency
3. Update skill examples if patterns changed
4. Use `/ide:01_onboard:generate_skill` to regenerate if needed

## Source of Truth

- **Comprehensive rules**: `/docs/rules/backend/strapi-v5/strapi-v5-coding-rules.md`
- **Quick lookup**: `/docs/rules/backend/strapi-v5/quick-reference.md`
- **Skills**: Copy-paste patterns extracted from rules
