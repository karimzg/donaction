---
name: bulk_issues_from_stories
description: Create multiple GitHub issues from Epic or user story documents
argument-hint: "Path to user story markdown file (e.g., docs/user-stories/phase2-backend-core.md)"
allowed-tools: Bash, gh, Read
---

# Bulk Issue Creator from User Stories

## Goal

Parse user story document and batch-create GitHub issues with proper Epic linking, labels, and Gherkin acceptance criteria.

## Context

### Issue Template

```markdown
@aidd/prompts/templates/.github/issue_template.md
```

### Input File

```markdown
$ARGUMENTS
```

## Rules

- Parse Epic title from markdown H1 or frontmatter
- Each H2 section = one GitHub issue
- Convert "Acceptance Criteria" bullets to Gherkin format
- Extract story structure: "As a X I want Y So that Z"
- Apply labels: `user-story`, `epic:<epic-name>`, auto-detect phase/module
- Create milestone from Epic name if not exists
- Link related stories in same Epic
- Skip malformed stories, log warnings
- Dry-run preview before batch creation
- **WAIT FOR USER APPROVAL** before creating issues

## Process Steps

1. Read user story file from $ARGUMENTS
2. Extract Epic metadata:
   - Title (H1 or filename)
   - Phase/module from path or frontmatter
   - Story count
3. Parse individual stories (H2 sections):
   - Story title
   - "As a/I want/So that" structure
   - Acceptance criteria bullets
4. Transform each story to GitHub issue format:
   - Title: Story H2 heading
   - Summary: "As a..." sentence
   - Objective: "So that..." outcome
   - Acceptance Criteria: Convert to Gherkin
5. Detect labels from content:
   - Epic name (slugified)
   - Module keywords (auth, verification, payment, etc.)
   - Phase number (phase-1, phase-2, etc.)
6. Preview all issues in table format:
   - Title | Labels | Milestone | Acceptance Count
7. **ASK USER CONFIRMATION** to proceed
8. Create milestone if missing:
   - `gh api repos/:owner/:repo/milestones -f title="Epic: <name>"`
9. Batch create issues via gh CLI:
   - `gh issue create --title "<title>" --body "<body>" --label "<labels>" --milestone "<milestone>"`
10. Link related issues in Epic description
11. Output created issue URLs with summary

## Validation Checklist

- [ ] All stories have "As a/I want/So that" structure
- [ ] Acceptance criteria formatted as Gherkin
- [ ] Labels include epic and module/phase
- [ ] Milestone created or exists
- [ ] User approved batch creation
- [ ] All issues created successfully
- [ ] Issue URLs returned to user
