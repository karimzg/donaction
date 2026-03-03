---
name: skill:quality-automation
description: Automated quality verification workflows. Use when completing features and need to verify code quality, run builds, or check for issues.
model: claude-opus-4-5
---

# Automation Skills

## Available Workflows

| Workflow | File | Use When |
|----------|------|----------|
| Backend Quality | [backend-quality-verification.md](backend-quality-verification.md) | Completing backend features |

## Backend Verification Steps

1. **Duplication Check**: No duplicate code
2. **Reuse Validation**: Helpers properly extracted
3. **Type Generation**: `npm run gen:types`
4. **Build**: `npm run build`

## When to Run

- After completing any backend feature
- Before creating PR
- After refactoring
