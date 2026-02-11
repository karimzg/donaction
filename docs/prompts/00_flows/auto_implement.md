---
name: auto_implement
description: Automate all steps of the AI-driven development flow.
version: 1.1.0
last_updated: 2026-02-11
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
- Browser validation available via `claude-in-chrome` for visual/behavioral checks when needed

## Steps

### 0. Initial Setup

**0.1. Isolation Strategy**

Ask user (checkboxes - single choice):
- [ ] Create new branch from current branch (recommended)
- [ ] Use git worktrees (for parallel work)
- [ ] Work on current branch (simpler, sequential only)

Note: branches are created per issue in step 2 (name generated from issue title, editable by user).

**0.2. PR Target Branch**

Display base branch info:
```
Current base branch: `!git branch --show-current`

Available epic branches:
`!git branch -a | grep "epic/" | sed 's/remotes\/origin\///' | sort -u`
```

This is the branch your PRs will merge into.

Ask user (single choice):
- [ ] Use current branch as base: `<current-branch>` (default)
- [ ] Select different branch (epic/* recommended)

Store selected branch as `prTargetBranch` for Create PR step.

**0.3. Model Selection for Planning**

Ask user (single choice):
- [ ] Opus 4.6 (recommended - best for complex planning)
- [ ] Sonnet 4.5 (faster, good for simple tasks)

Note: All other tasks (implement, commit, review, PR) use Sonnet by default.

### 1. Preparation

1. Parse issue URLs/numbers from arguments
2. Create todo list with all issues to process

### 2. For EACH Issue (Sequential Processing)

**Setup Phase:**

1. Fetch issue details: `gh issue view <number> --json body,title,url`
2. Generate branch name from issue title:
   - Slugify: lowercase, replace spaces/special chars with `-`, trim to 60 chars max
   - Propose: `feature/issue-<number>-<title-slugified>`
   - Display proposed name and let user edit before confirming
   - Store as `branchName`
3. **Classify issue type with confidence:**
   - Scan title + body for UI/UX indicators:
     - UI keywords: `design`, `layout`, `component`, `style`, `CSS`, `responsive`, `animation`, `visual`, `UI`, `interface`, `button`, `form`, `modal`
     - UX keywords: `UX`, `user experience`, `flow`, `navigation`, `usability`, `interaction`, `accessibility`
   - Calculate confidence:
     - HIGH: 3+ keyword matches OR explicit "UI/UX" mention
     - LOW: 1-2 keyword matches
     - NONE: 0 matches
   - Display classification and ASK USER TO CONFIRM:
     ```
     🎨 UI/UX issue detected (HIGH confidence)
     or
     🎨 UI/UX issue detected (LOW confidence - please confirm)
     or
     ⚙️ Technical issue detected

     Please confirm issue type:
     - [ ] UI/UX issue
     - [ ] Technical issue
     ```
   - Set `isUIUX` based on user confirmation
4. **Validation Mode** (based on confirmed issue type):
   - IF `isUIUX = true`, ask user (single choice):
     - [ ] Automatic (no validation)
     - [ ] Validate plan + design only
     - [ ] Validate all (plan + design + implementation)
   - ELSE (Technical), ask user (single choice):
     - [ ] Automatic (no validation)
     - [ ] Validate plan only
     - [ ] Validate implementation only
     - [ ] Validate plan + implementation
5. Branch setup:
   - IF "Create new branch": `git checkout -b <branchName>`
   - IF worktree: `git worktree add worktrees/<branch> -b <branch>`
   - IF current branch: stay on current branch
6. Update todo: mark issue as "in_progress"

**Implementation Phase:**

All commands execute in:
- IF worktree: `cwd: worktrees/<branch>`
- ELSE: current directory

0. **Dev server setup** (only if `isUIUX = true` OR plan indicates UI changes):
   - Detect port from app context:
     - Frontend (Next.js): 3000
     - Admin (Angular): 4200
     - SaaS (Vite): 5173
     - API (Strapi): 1337
   - Check if dev server running: `lsof -i :<port>` or `curl localhost:<port>`
   - IF not running: start with `npm run dev` (background)
   - IF failed to start: warn user, continue without browser validation
   - Check `claude-in-chrome` availability: `tabs_context_mcp`
   - IF unavailable: warn user, skip browser validation steps
   - Note dev URL for browser validation steps

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
3. **Generate plan:** Use `/plan <issue-url>` with loaded context and model from step 0.3
   - IF `isUIUX = true`: Plan must separate technical points into:
     - **Prerequisites** (before UI/UX work): component type (client/server), file structure, data fetching setup, props interface...
     - **Post UI/UX work** (after design): helper functions, service calls, state management, API integration...
   - IF validate plan: wait for user approval before continuing
5. **Implement changes:**
   - IF `isUIUX = true`:
     a. **Pre-UI/UX implementation** (if prerequisites identified in plan):
        - Use `/implement` for technical prerequisites only
        - Skip if plan has no prerequisites
     b. **UI/UX design phase:**
        - Use `/custom:00_ux_ui:elite-webdesigner`
        - **Browser validation (via claude-in-chrome):**
          - Navigate to affected route
          - Take screenshots at breakpoints: mobile (375px), tablet (768px), desktop (1440px)
          - Check console for errors
          - Verify visual hierarchy and spacing
        - IF validate design: include screenshots in approval request, wait for user approval
     c. **Post-UI/UX implementation** (if post-work identified in plan):
        - Use `/implement` for remaining technical work
        - Skip if plan has no post-UI/UX work
        - **Browser validation (via claude-in-chrome):**
          - Test key interactions (clicks, forms, navigation)
          - Verify state changes and data flow
          - Check console for runtime errors
   - ELSE (Technical issue):
     - Use `/implement` directly
   - IF validate implementation: wait for user approval before continuing
6. **Run tests:**
   - IF `isUIUX = true`:
     - Component tests (render, props, interactions)
     - **Browser validation (via claude-in-chrome):**
       - Final responsive check at all breakpoints
       - Accessibility audit: tab navigation, focus states, ARIA attributes
       - Full user flow walkthrough
   - ELSE (Technical):
     - Execute standard test suite
     - **Browser validation** (if feature has UI impact):
       - Navigate to affected route
       - Verify expected behavior
       - Check console for errors
7. Commit changes: Use `/commit`
8. Code review: Use `/review_code`
9. Create PR: Use `/create_github_pull_request` with base branch `prTargetBranch`

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

## Browser Validation (claude-in-chrome)

**When to use:**
- UI/UX issues: mandatory at design and test phases
- Technical issues: when feature has visible UI impact

**Setup:**
- Dev server must be running before validation
- Use `tabs_context_mcp` → `tabs_create_mcp` → `navigate` to target route

**Validation Depth** (ask user at setup if browser validation is needed):
- [ ] Basic: screenshots + console errors
- [ ] Standard: + responsive check at all breakpoints (default)
- [ ] Comprehensive: + accessibility audit (tab nav, focus states, ARIA)

**Checks by depth:**
| Check | Tools | Depth |
|-------|-------|-------|
| Screenshots | `computer` action=screenshot | Basic |
| Console errors | `read_console_messages` | Basic |
| Responsive | `resize_window` (375/768/1440px) + screenshot | Standard |
| Interactions | `computer` action=left_click, `read_page` | Standard |
| Accessibility | `read_page` (a11y tree), keyboard nav | Comprehensive |

**Breakpoints:**
- Mobile: 375px width
- Tablet: 768px width
- Desktop: 1440px width
