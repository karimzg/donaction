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

## Maintenance Workflow

### When Updating Strapi Rules

**IMPORTANT**: Always maintain sync between comprehensive rules and skills.

1. **Update comprehensive rules first** in `/docs/rules/backend/strapi-v5/`
2. **Review affected skills** for consistency
3. **Update skill examples** if patterns changed
4. **Test examples** to ensure they still work
5. **Use `/ide:01_onboard:generate_skill`** to regenerate if needed

### Sync Checklist

When modifying Strapi rules, check these skills:
- ✅ `controllers.md` - If factory pattern, sanitization, or error handling changed
- ✅ `services.md` - If business logic patterns changed
- ✅ `document-service-api.md` - If CRUD methods or documentId handling changed
- ✅ `lifecycles.md` - If hook behavior or recommendations changed
- ✅ `custom-middleware.md` - If permission patterns changed
- ✅ `jwt-token.md` - If auth flow changed
- ✅ `stripe-payment.md` - If payment integration changed

## Source of Truth

- **Comprehensive rules**: `/docs/rules/backend/strapi-v5/strapi-v5-coding-rules.md`
- **Quick lookup**: `/docs/rules/backend/strapi-v5/quick-reference.md`
- **Skills**: Copy-paste patterns extracted from rules
