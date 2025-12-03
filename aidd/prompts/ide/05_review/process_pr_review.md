---
name: process_pr_review
description: Process GitHub PR review comments with interactive fix workflow
argument-hint: PR number (optional - defaults to last PR)
---

# Process PR Review Prompt

## Goal

Transform PR review feedback into actionable fixes with user-controlled priority selection.

## Rules

- Use `gh` CLI exclusively
- Categorize by severity (Critical, Important, Suggestions)
- Interactive fix selection
- Propose automated fixes for top priorities

## Steps

1. Fetch last PR review: `!gh pr list --state all --limit 1 --json number` → get PR number
2. Get review comments: `!gh pr view {pr_number} --json reviews,comments`
3. Parse and categorize issues:
   - Critical (🔴): Security, blockers, breaking changes
   - Important (⚠️): Best practices, performance, missing features
   - Suggestions (💡): Nice-to-have, optimizations, documentation
4. Present categorized list to user
5. Ask user via interactive selection:
   - Which Critical issues to fix now?
   - Which Important issues to address?
   - Which Suggestions to implement?
6. Ask commit strategy (checkboxes - single choice):
   - [ ] Separate commits per issue + user validation each
   - [ ] 1 commit all issues + user validation
   - [ ] Auto commit no validation
7. For each selected issue, propose fix approach from review
8. Generate action plan with priority order
9. Implement fixes following project rules and chosen strategy:
   - If separate commits: fix → validate → commit → next issue
   - If single commit: fix all → validate → commit once
   - If auto: fix all → commit without validation
10. Output summary with commit(s) created and remaining manual tasks

## Validation

- [ ] All review comments captured
- [ ] Categorization accurate
- [ ] User approves fix selection
- [ ] Action plan clear and prioritized
