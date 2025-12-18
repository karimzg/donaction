---
name: coding-assertions
description: Code quality verification checklist
argument-hint: N/A
---

# Coding Guidelines

> **These rules must be minimal - checked after EVERY CODE GENERATION.**

## Feature Completion Requirements

**A feature is ONLY complete when ALL checks pass.**

## Quality Verification

Use the **backend-quality-verification** skill to run automated checks:

1. ✅ Check for code duplication
2. ✅ Ensure code is reused (no duplicate logic)
3. ✅ Run `npm run gen:types` (generate TypeScript types)
4. ✅ Verify TypeScript compilation (no type errors)
5. ✅ Run `npm run build` (Strapi builds successfully)

**Trigger**: Ask Claude to "verify backend quality" or "run backend quality checks"

## Coding Patterns

**All detailed coding rules are in**: @docs/rules/strapi-v5/strapi-v5-coding-rules.md

**Quick Reference**:
- Use `factories.createCoreController()` and `factories.createCoreService()`
- Always validate & sanitize: `validateQuery()`, `sanitizeQuery()`, `sanitizeOutput()`
- Use `strapi.documents()` for CRUD, `strapi.db.query()` for complex queries
- Extract business logic to services, keep controllers thin
- Security: check permissions, sanitize inputs/outputs, remove sensitive fields
