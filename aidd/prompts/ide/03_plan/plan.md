---
name: plan
description: Generate technical implementation plans from requirements
argument-hint: requirements (GitHub issue URL or raw text)
---

# Goal

Generate technical implementation plans from requirements, save to task file, display for review, and wait for user confirmation before proceeding.

## Rules

- LESS IS MORE, do not over-engineer
- DO NOT CODE ANYTHING
- Create plan from provided requirements
- Save plan to task file before displaying
- Wait for user confirmation after displaying plan
- Handle vocal dictation inconsistencies

## Context

Use the following requirements as input:

```text
$ARGUMENTS
```

## Resources

### Template

```markdown
@aidd/prompts/templates/plan.md
```

## Steps

### Step 0: Context Detection & Approval

1. **Analyze requirements** to detect affected apps using @aidd/prompts/ide/helpers/detect-app-context.md
2. **Extract keywords** from requirements (case-insensitive matching)
3. **Identify apps**:
   - admin: admin, dashboard, Angular, backoffice
   - backend: API, Strapi, database, schema, endpoint
   - frontend: frontend, Next.js, public site, SSR
   - saas: widget, embeddable, Svelte, embed
4. **Build context file list** based on detected apps:
   - Always: `CLAUDE.md`
   - Per app: `docs/memory-bank/{app}/AGENTS.md`, `docs/rules/{app}/naming-conventions.md`
   - Backend: Also load `docs/rules/backend/strapi-v5/strapi-v5-coding-rules.md` and `quick-reference.md`
5. **Present detection results** to user:
   ```
   📋 Context Detection Results

   Detected Apps: [list]

   Context to Load:
   - ✅ CLAUDE.md
   - ✅ [list all files]

   Ambiguous? [Yes/No - if yes, explain]

   Proceed with this context? [Y/n]
   ```
6. **Handle ambiguity**: If multiple interpretations possible, ask user to clarify which apps to include
7. **Wait for approval** before proceeding
8. **Load approved context** files into agent memory for use in all subsequent steps

### Step 1: Parse Input

1. Detect input type (GitHub URL vs raw text)
2. Extract requirements from input:
   - For GitHub issue: fetch and parse issue content
   - For raw text: clean and structure the requirements
3. Normalize text (handle vocal dictation issues)

### Step 2: Technical Analysis and Task Planning

> Define main phases, do not mention specific files, have macro-level vision.

1. **Wait for user validation** regarding main phases, YOU MUST BOTH AGREED BEFORE PROCEEDING NEXT.
2. Analyze requirements to identify main implementation phases
3. For each phase, create minimal, specific, actionable tasks
4. Ensure comprehensive coverage of all requirements

### Step 3: Generate and Save Implementation Plan

1. Use current !`date`
2. Determine feature name from requirements
3. Fill @aidd/prompts/templates/plan.md template
4. **Save to file**: `docs/tasks/<yyyy_mm_dd>-<feature_name>.md`
5. Display saved file path to user

### Step 4: Quality Assurance

1. Verify plan addresses all requirements
2. Check for potential challenges and obstacles
3. Evaluate confidence (0-10 scale):
   - ✅ Reasons for high confidence
   - ❌ Reasons for low confidence / risks
4. Ensure minimum confidence score of 9/10
5. Add confidence assessment to plan

### Step 5: Display and Confirm

1. Display the complete generated plan to user
2. Show confidence assessment
3. Highlight any risks or concerns
4. Plan is now ready for implementation, challenge it with User
5. **WAIT FOR USER APPROVAL** before implementation
