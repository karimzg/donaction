---
name: auto_implement
description: Automate all steps of the AI-driven development flow.
---

# Goal

Implement features end-to-end, automatically, using AI-driven development.

Issues to process:

```text
$ARGUMENTS
```

## IMPORTANT RULES

- NEVER ASK QUESTIONS after initial setup - work autonomously
- EACH step must be 100% successful before proceeding to next
- Use TodoWrite to track progress for each issue

## Steps

### 0. Initial Setup

**0.1. Isolation Strategy**

Ask user (checkboxes - single choice):
- [ ] Use git worktrees (recommended for parallel work)
- [ ] Work on current branch (simpler, sequential only)

**0.2. Validation Mode**

Ask user (checkboxes - single choice):
- [ ] Automatic (no validation)
- [ ] Validate plan only
- [ ] Validate implementation only
- [ ] Validate plan + implementation

### 1. Preparation

1. Parse issue URLs/numbers from arguments
2. Create todo list with all issues to process

### 2. For EACH Issue (Sequential Processing)

**Setup Phase:**

1. Extract issue number and create branch name: `feat/issue-<number>`
2. Fetch issue details: `gh issue view <number> --json body,title,url`
3. Branch setup:
   - IF worktree: `git worktree add worktrees/<branch> -b <branch>`
   - ELSE: `git checkout -b <branch>`
4. Update todo: mark issue as "in_progress"

**Implementation Phase:**

All commands execute in:
- IF worktree: `cwd: worktrees/<branch>`
- ELSE: current directory

1. Detect and load context:
   - Parse issue to detect affected apps (see @aidd/prompts/ide/helpers/detect-app-context.md)
   - Build context file list based on detected apps
   - Present detection results to user with file list
   - If ambiguous: ask user to clarify apps
   - Wait for user approval to proceed with context
   - Load approved context files into memory
2. **Context Validation:**
   - Display loaded context with format:
     ```
     📋 **Context Loaded for Issue #<number>**

     **Detected Apps:** <app1>, <app2>

     **Loaded Files:**
     - ✅ CLAUDE.md
     - ✅ docs/memory-bank/<app>/AGENTS.md
     - ✅ docs/rules/<app>/naming-conventions.md
     - ✅ [additional files...]

     Would you like to:
     - [ ] Proceed with this context
     - [ ] Add more files (specify paths)
     ```
   - Wait for user confirmation or additional file requests
   - If additional files requested: load them and re-display context
3. **Model Selection for Planning:**
   - Ask user (checkboxes - single choice):
     - [ ] Opus 4.5 (recommended - best for complex planning)
     - [ ] Sonnet 4.5 (faster, good for simple tasks)
   - Note: All other tasks (implement, commit, review, PR) use Sonnet by default
4. Generate technical plan: Use `/plan <issue-url>` with loaded context and selected model
   - IF validate plan OR validate both: wait for user approval before continuing
5. Implement changes: Use `/implement`
   - IF validate implementation OR validate both: wait for user approval before continuing
6. Run tests: Execute test suite if applicable
7. Commit changes: Use `/commit`
8. Code review: Use `/review_code`
9. Create PR: Use `/create_github_pull_request`

**Completion Phase:**

1. Record PR URL and status
2. Update todo: mark issue as "completed"
3. Branch handling:
   - IF worktree: Keep worktree (needed for PR updates)
   - ELSE: Stay on feature branch

### 3. Final Report

1. List all issues processed
2. Show PR URLs created
3. Summary of successes/failures

## Notes

- IF worktree mode:
  - Worktrees remain in `worktrees/` folder (gitignored)
  - Manual cleanup: `git worktree remove worktrees/<branch>` after PR merge
- IF direct mode:
  - User stays on last feature branch
  - Manual switch: `git checkout main` when done
- If error occurs: log it, mark todo as failed, continue to next issue
