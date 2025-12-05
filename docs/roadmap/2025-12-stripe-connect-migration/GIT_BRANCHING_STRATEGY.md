# Git Branching Strategy - Epic #4: Stripe Connect Migration

## 🌳 Overview

This epic uses a dedicated epic branch to isolate all development work until the entire feature is complete and tested.

## 📋 Branch Structure

```
main
  └── epic/4-stripe-connect-migration (epic branch - all PRs target here)
        ├── feature/4-phase-1-database-foundation
        ├── feature/4-phase-2-stripe-integration
        ├── feature/4-phase-3-payment-migration
        ├── feature/4-phase-4-angular-dashboard
        ├── feature/4-phase-5-tax-receipts-audit
        ├── feature/4-phase-6-refund-workflow
        ├── feature/4-phase-7-email-integration
        └── feature/4-phase-8-testing-migration
```

## 🚀 Workflow

### 1. Create Epic Branch (Done once)

```bash
git checkout main
git pull origin main
git checkout -b epic/4-stripe-connect-migration
git push origin epic/4-stripe-connect-migration
```

### 2. Developer Workflow for Each Phase

#### Start a Phase

```bash
# Always start from the latest epic branch
git checkout epic/4-stripe-connect-migration
git pull origin epic/4-stripe-connect-migration

# Create your phase branch
git checkout -b feature/4-phase-X-description

# Work on your tasks...
git add .
git commit -m "feat(phase-X): describe your changes"
```

#### Create Pull Request

```bash
# Push your branch
git push origin feature/4-phase-X-description

# Create PR via GitHub CLI or web interface
gh pr create \
  --base epic/4-stripe-connect-migration \
  --head feature/4-phase-X-description \
  --title "Phase X: Description" \
  --body "Closes #X"
```

**⚠️ IMPORTANT:** Always target `epic/4-stripe-connect-migration` as base branch, NOT `main`

#### After PR is Merged

```bash
# Delete your local branch
git checkout epic/4-stripe-connect-migration
git branch -D feature/4-phase-X-description

# Pull latest changes
git pull origin epic/4-stripe-connect-migration
```

### 3. Final Merge to Main (After Phase 8)

```bash
# After all phases are complete, tested, and deployed to staging
git checkout main
git pull origin main
git merge epic/4-stripe-connect-migration
git push origin main

# Or create a final PR
gh pr create \
  --base main \
  --head epic/4-stripe-connect-migration \
  --title "Epic #4: Stripe Connect Migration - Final Merge" \
  --body "Closes #4"
```

## 📝 Phase Dependencies

Each phase depends on the previous one being merged:

| Phase | Branch | Depends On | Merge Into |
|-------|--------|------------|------------|
| 1 | `feature/4-phase-1-database-foundation` | - | `epic/4-stripe-connect-migration` |
| 2 | `feature/4-phase-2-stripe-integration` | Phase 1 | `epic/4-stripe-connect-migration` |
| 3 | `feature/4-phase-3-payment-migration` | Phase 2 | `epic/4-stripe-connect-migration` |
| 4 | `feature/4-phase-4-angular-dashboard` | Phase 2 | `epic/4-stripe-connect-migration` |
| 5 | `feature/4-phase-5-tax-receipts-audit` | Phase 3 | `epic/4-stripe-connect-migration` |
| 6 | `feature/4-phase-6-refund-workflow` | Phase 5 | `epic/4-stripe-connect-migration` |
| 7 | `feature/4-phase-7-email-integration` | Phase 6 | `epic/4-stripe-connect-migration` |
| 8 | `feature/4-phase-8-testing-migration` | Phase 7 | `epic/4-stripe-connect-migration` |
| Epic | `epic/4-stripe-connect-migration` | Phase 8 | `main` |

## 🔄 Handling Conflicts

If the epic branch gets out of sync with main (e.g., hotfixes merged to main):

```bash
git checkout epic/4-stripe-connect-migration
git pull origin epic/4-stripe-connect-migration
git merge main
# Resolve conflicts if any
git push origin epic/4-stripe-connect-migration
```

Then inform all developers to rebase their feature branches:

```bash
git checkout feature/4-phase-X-description
git fetch origin
git rebase origin/epic/4-stripe-connect-migration
# Resolve conflicts if any
git push origin feature/4-phase-X-description --force-with-lease
```

## ✅ Pull Request Checklist

Before creating a PR, ensure:

- [ ] Base branch is `epic/4-stripe-connect-migration` (NOT main)
- [ ] All commits follow conventional commit format
- [ ] Tests are written and passing
- [ ] Code is linted and formatted
- [ ] PR title references the issue number (e.g., "Phase 1: Database Foundation #5")
- [ ] PR description includes "Closes #X"
- [ ] Dependencies on other phases are documented

## 🎯 Benefits of This Strategy

1. **Isolation**: Epic development doesn't affect main branch until complete
2. **Testing**: Can deploy epic branch to staging for full integration testing
3. **Rollback**: Easy to abandon entire epic if needed
4. **Collaboration**: Multiple developers can work on different phases simultaneously
5. **Review**: Can review entire epic as one unit before merging to main
6. **Clean History**: Main branch stays clean with one epic merge

## 📚 References

- Epic Issue: [#4](https://github.com/karimzg/donaction/issues/4)
- Implementation Plan: `docs/tasks/2025_12_04-stripe-connect-migration.md`
- Phase Issues: #5, #6, #7, #8, #9, #10, #11, #12

---

## 🔴 Phase 0: Angular 21 Migration (Added)

**Critical Update:** A Phase 0 has been added as a PREREQUISITE for all other phases.

### Why Phase 0?

Migrating to Angular 21 enables:
- **Signal Forms**: Type-safe reactive forms with better performance
- **Enhanced Signals API**: `linkedSignal()`, `resource()`, improved effects
- **Modern Patterns**: Latest Angular best practices for all new features

### Updated Dependencies

| Phase | Branch | Depends On | Priority |
|-------|--------|------------|----------|
| **0** | `feature/4-phase-0-angular-21-migration` | - | **CRITICAL - DO FIRST** |
| 1 | `feature/4-phase-1-database-foundation` | Phase 0 | High |
| 2 | `feature/4-phase-2-stripe-integration` | Phase 0, Phase 1 | High |
| ... | ... | ... | ... |

### Workflow Update

```bash
# Step 1: Complete Phase 0 FIRST
git checkout epic/4-stripe-connect-migration
git checkout -b feature/4-phase-0-angular-21-migration
# ... complete Angular 21 migration ...
# Create PR to epic/4-stripe-connect-migration
# WAIT for Phase 0 merge before starting other phases

# Step 2: Once Phase 0 is merged, proceed with other phases
git checkout epic/4-stripe-connect-migration
git pull origin epic/4-stripe-connect-migration
git checkout -b feature/4-phase-1-database-foundation
```

**Issue:** [#13](https://github.com/karimzg/donaction/issues/13)
