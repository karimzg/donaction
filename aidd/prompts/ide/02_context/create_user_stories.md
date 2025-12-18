---
name: create-user-stories
description: Create user stories through iterative questioning
argument-hint: Feature description or requirements for user story generation
---

# Create perfect User Stories for a developer

## Goal

Generate well-structured user stories from feature requirements through systematic Product Owner questioning.

## Context

@docs/memory-bank/AGENTS.md

> Note: For User Stories targeting a specific app, also consult:
> - Admin: `docs/memory-bank/admin/AGENTS.md`
> - Backend: `docs/memory-bank/backend/AGENTS.md`
> - Frontend: `docs/memory-bank/frontend/AGENTS.md`
> - SaaS: `docs/memory-bank/saas/AGENTS.md`

## Rules

- No technical aspect, focus on user needs
- Requirements started from $ARGUMENTS
- Lean, concise approach
- 3 max questions per iteration
- Sort by implementation priority

## Steps

1. Ask clarifying questions to understand completeness (problem, features, criteria, scope, constraints)
2. Refine story understanding to user
3. Iterate until you are both satisfied
4. Prioritize
5. Format stories using user story template
6. Output final stories from this template: @aidd/prompts/templates/user_story.md
