# GitHub Repository Configuration Guide

> **Related Issue**: #21 - US-001: Configuration initiale GitHub
> **Date**: 2025-12-20
> **Status**: Implementation guide for manual GitHub configuration

## Overview

This guide provides step-by-step instructions for configuring the donaction repository with environments, secrets, branch protection rules, and code ownership.

## Current State (Verified 2025-12-20)

- ✅ Repository: `karimzg/donaction` (public)
- ✅ Default branch: `main`
- ⚠️ Main branch has basic protection (needs enhancement)
- ❌ No environments configured
- ❌ Develop branch does not exist
- ❌ CODEOWNERS file missing

---

## Phase 2: Environment Configuration

### 2.1 Create Staging Environment

**GitHub UI Steps:**
1. Navigate to: https://github.com/karimzg/donaction/settings/environments
2. Click "New environment"
3. Environment name: `staging`
4. Leave protection rules empty (no required reviewers)
5. Click "Configure environment"

**GitHub CLI Alternative:**
```bash
gh api -X PUT repos/karimzg/donaction/environments/staging
```

**Verification:**
```bash
gh api repos/karimzg/donaction/environments/staging
```

### 2.2 Create Production Environment

**GitHub UI Steps:**
1. Navigate to: https://github.com/karimzg/donaction/settings/environments
2. Click "New environment"
3. Environment name: `production`
4. Under "Deployment protection rules":
   - Enable "Required reviewers"
   - Add reviewer(s): `@karimzg` (adjust as needed)
5. Click "Save protection rules"

**GitHub CLI Alternative:**
```bash
# Create environment
gh api -X PUT repos/karimzg/donaction/environments/production

# Add required reviewers (replace USER_ID with actual GitHub user IDs)
gh api -X PUT repos/karimzg/donaction/environments/production \
  -f reviewers='[{"type":"User","id":USER_ID}]'
```

**Verification:**
```bash
gh api repos/karimzg/donaction/environments/production \
  --jq '.protection_rules'
```

---

## Phase 3: Secrets Management

### 3.1 Repository Secrets (Shared Across Environments)

**GitHub UI Steps:**
1. Navigate to: https://github.com/karimzg/donaction/settings/secrets/actions
2. Click "New repository secret" for each:

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `SSH_PRIVATE_KEY` | SSH key for deployment | `-----BEGIN...` |
| `SLACK_WEBHOOK_URL` | Slack notifications | `https://hooks.slack.com/...` |
| `DISCORD_WEBHOOK_URL` | Discord notifications | `https://discord.com/api/webhooks/...` |

**GitHub CLI Alternative:**
```bash
# SSH_PRIVATE_KEY
gh secret set SSH_PRIVATE_KEY --body "$(cat ~/.ssh/deploy_key)"

# SLACK_WEBHOOK_URL
gh secret set SLACK_WEBHOOK_URL --body "https://hooks.slack.com/..."

# DISCORD_WEBHOOK_URL
gh secret set DISCORD_WEBHOOK_URL --body "https://discord.com/api/webhooks/..."
```

### 3.2 Staging Environment Secrets

**GitHub UI Steps:**
1. Navigate to: https://github.com/karimzg/donaction/settings/environments
2. Click "staging"
3. Under "Environment secrets", click "Add secret" for each:

| Category | Secret Name | Description |
|----------|------------|-------------|
| **SSH** | `SSH_HOST` | Staging server hostname |
| | `SSH_USER` | SSH username |
| **Database** | `DATABASE_PASSWORD` | PostgreSQL password |
| | `DATABASE_NAME` | Database name |
| | `DATABASE_USERNAME` | Database username |
| **Strapi** | `JWT_SECRET` | Strapi JWT secret |
| | `ADMIN_JWT_SECRET` | Admin JWT secret |
| | `APP_KEYS` | 4 keys comma-separated |
| | `API_TOKEN_SALT` | API token salt |
| | `TRANSFER_TOKEN_SALT` | Transfer token salt |
| **Stripe** | `STRIPE_SECRET_KEY` | Stripe secret key |
| | `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |
| | `STRIPE_WEBHOOK_SECRET_CONNECT` | Stripe connected accounts webhook secret |
| **ImageKit** | `IMAGEKIT_PUBLIC_KEY` | ImageKit public key |
| | `IMAGEKIT_PRIVATE_KEY` | ImageKit private key |
| | `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint |
| **Email** | `BREVO_API_KEY` | Brevo API key |
| | `MAIL_PROVIDER_SMTP_PASSWORD` | SMTP password |
| **Google** | `GOOGLE_CLIENT_ID` | OAuth client ID |
| | `GOOGLE_CLIENT_SECRET` | OAuth client secret |
| | `GOOGLE_MAPS_API_KEY` | Maps API key |
| | `GOOGLE_RECAPTCHA_SITE_KEY` | reCAPTCHA site key |
| **Auth** | `NEXTAUTH_SECRET` | NextAuth secret |
| | `STRAPI_API_TOKEN` | Strapi API token |

**GitHub CLI Alternative:**
```bash
# Template for adding environment secrets
gh secret set SECRET_NAME --env staging --body "secret_value"

# Example:
gh secret set SSH_HOST --env staging --body "staging.donaction.fr"
gh secret set DATABASE_PASSWORD --env staging --body "your_password"
# ... repeat for all secrets
```

### 3.3 Production Environment Secrets

**GitHub UI Steps:**
Same as staging, but:
1. Click "production" environment
2. Add all secrets with production values
3. **Additional secret for production:**
   - `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key

**GitHub CLI Alternative:**
```bash
# Copy all staging secrets with production values
gh secret set SSH_HOST --env production --body "donaction.fr"
gh secret set DATABASE_PASSWORD --env production --body "prod_password"
# ... repeat for all secrets

# Production-only secret
gh secret set STRIPE_PUBLISHABLE_KEY --env production --body "pk_live_..."
```

**Verification:**
```bash
# List all repository secrets
gh secret list

# List environment secrets (requires additional API calls)
gh api repos/karimzg/donaction/environments/staging/secrets
gh api repos/karimzg/donaction/environments/production/secrets
```

### 3.4 Secret Rotation

**When to rotate secrets:**
- Scheduled: Every 90 days for sensitive secrets (JWT, API tokens)
- Incident: Immediately if secret exposure suspected
- Personnel: When team members with access leave

**Rotation procedure (zero-downtime):**

1. **Generate new secret value** (do NOT invalidate old one yet)

2. **Update GitHub secret:**
```bash
gh secret set SECRET_NAME --env production --body "new_value"
```

3. **Trigger rebuild of affected apps:**
```bash
# Push empty commit to trigger workflow
git commit --allow-empty -m "chore: rotate SECRET_NAME"
git push origin release/current
```

4. **Verify new deployment works:**
- Check app health endpoints
- Test critical flows (login, payments)
- Monitor error logs for 15 minutes

5. **Invalidate old secret** in source system (Stripe dashboard, database, etc.)

**Rollback if rotation fails:**
```bash
# Restore previous secret value
gh secret set SECRET_NAME --env production --body "old_value"

# Trigger rebuild
git revert HEAD
git push origin release/current
```

**Emergency rotation (secret compromised):**
1. Immediately invalidate old secret in source system
2. Generate and set new secret in GitHub
3. Trigger emergency rebuild
4. Audit access logs for unauthorized usage

### 3.5 Adding New Secrets to Apps

When adding a new secret to an application, follow the pattern for that app:

**API, Frontend, SaaS (Node.js apps):**
1. Add `ARG SECRET_NAME` to Dockerfile
2. Add `echo "SECRET_NAME=${SECRET_NAME}" >> .env` in the .env generation block
3. Add `SECRET_NAME=${{ secrets.SECRET_NAME }}` to workflow build-args
4. Add GitHub secret to both staging and production environments

**Admin (Angular app):**
1. Add placeholder in environment files:
   ```typescript
   // environment.prod.ts & environment.re7.ts
   mySecret: '__MY_SECRET__',  // Double underscore pattern
   ```
2. Add `ARG MY_SECRET` to Dockerfile
3. Add sed replacement in Dockerfile:
   ```dockerfile
   sed -i "s|__MY_SECRET__|${MY_SECRET}|g" src/environments/environment.${ENVIRONMENT}.ts
   ```
4. Add `MY_SECRET=${{ secrets.MY_SECRET }}` to workflow build-args (Admin section)
5. Add GitHub secret to both staging and production environments

**Validation:** All Dockerfiles validate critical secrets at build time. Add validation for required secrets:
```dockerfile
RUN if [ -z "$MY_SECRET" ]; then echo "ERROR: MY_SECRET is required" && exit 1; fi
```

---

## Phase 4: Branch Protection Rules

> **Note**: CI status checks configuration will be completed in US-002 when GitHub Actions workflows are implemented. Branch protection rules below should be updated at that time to add the CI workflow name to required status checks.

### 4.1 Main Branch Protection

**GitHub UI Steps:**
1. Navigate to: https://github.com/karimzg/donaction/settings/branches
2. Click "Add branch protection rule"
3. Branch name pattern: `main`
4. Configure rules:
   - ✅ **Require a pull request before merging**
     - ✅ Require approvals: `1`
     - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ⚠️ **Require status checks to pass before merging** (TODO: US-002)
     - ✅ Require branches to be up to date before merging
     - Search and add: `CI` (workflow name from US-002)
   - ✅ **Do not allow bypassing the above settings**
     - ✅ Include administrators
5. Click "Create"

**GitHub CLI Alternative:**
```bash
gh api -X PUT repos/karimzg/donaction/branches/main/protection \
  --input - <<EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["CI"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismissal_restrictions": {},
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1,
    "require_last_push_approval": false
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_linear_history": false,
  "required_conversation_resolution": false
}
EOF
```

**Verification:**
```bash
gh api repos/karimzg/donaction/branches/main/protection \
  --jq '{required_reviews: .required_pull_request_reviews.required_approving_review_count, dismiss_stale: .required_pull_request_reviews.dismiss_stale_reviews, enforce_admins: .enforce_admins.enabled, status_checks: .required_status_checks.contexts}'
```

### 4.2 Develop Branch Protection

**Prerequisites:**
Develop branch must exist. Create if needed:
```bash
git checkout -b develop
git push -u origin develop
```

**GitHub UI Steps:**
1. Navigate to: https://github.com/karimzg/donaction/settings/branches
2. Click "Add branch protection rule"
3. Branch name pattern: `develop`
4. Configure rules:
   - ✅ **Require a pull request before merging**
   - ⚠️ **Require status checks to pass before merging** (TODO: US-002)
     - Search and add: `CI` (workflow name from US-002)
5. Click "Create"

**GitHub CLI Alternative:**
```bash
gh api -X PUT repos/karimzg/donaction/branches/develop/protection \
  --input - <<EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["CI"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF
```

**Verification:**
```bash
gh api repos/karimzg/donaction/branches/develop/protection \
  --jq '{status_checks: .required_status_checks.contexts, pr_required: .required_pull_request_reviews}'
```

---

## Phase 5: CODEOWNERS Configuration

**File:** `/CODEOWNERS` (created in repository root)

See `CODEOWNERS` file in repository.

**Verification:**
1. Create a test PR
2. Verify auto-assignment of reviewers
3. Check PR details show required reviewers

---

## Validation Checklist

- [ ] **Environments**
  - [ ] Staging environment exists
  - [ ] Staging has no protection rules
  - [ ] Production environment exists
  - [ ] Production requires reviewer approval
- [ ] **Secrets**
  - [ ] 3 repository secrets configured
  - [ ] 23 staging secrets configured
  - [ ] 24 production secrets configured
- [ ] **Branch Protection**
  - [ ] Main branch: PR + 1 approval + CI required
  - [ ] Main branch: Administrators included
  - [ ] Main branch: Stale reviews dismissed
  - [ ] Develop branch exists
  - [ ] Develop branch: PR + CI required
- [ ] **CODEOWNERS**
  - [ ] File exists at repository root
  - [ ] Reviewers auto-assigned on new PRs

---

## Testing Steps

1. **Test main branch protection:**
   ```bash
   git checkout main
   echo "test" >> README.md
   git add README.md
   git commit -m "test: direct push to main"
   git push origin main  # Should fail
   ```

2. **Test PR workflow:**
   ```bash
   git checkout -b test/pr-workflow
   echo "test" >> README.md
   git add README.md
   git commit -m "test: PR workflow"
   git push -u origin test/pr-workflow
   gh pr create --fill
   # Verify: requires 1 approval + CI pass
   ```

3. **Test CODEOWNERS:**
   - Create PR
   - Check "Reviewers" section
   - Verify auto-assignment

4. **Test secrets accessibility:**
   - Trigger GitHub Actions workflow
   - Verify secrets are accessible in workflow logs (masked)

---

## Troubleshooting

### Issue: Cannot create environments via CLI
**Solution:** Use GitHub UI - environment creation via API requires GitHub Enterprise

### Issue: Status check "CI" not found
**Solution:**
1. Verify GitHub Actions workflow exists (`.github/workflows/*.yml`)
2. Workflow must have run at least once
3. Check workflow job names match status check name

### Issue: Secrets not accessible in workflow
**Solution:**
1. Verify secret names match exactly (case-sensitive)
2. Check environment name in workflow matches configured environment
3. For environment secrets, workflow must reference environment:
   ```yaml
   jobs:
     deploy:
       environment: staging
       steps:
         - run: echo ${{ secrets.SSH_HOST }}
   ```

### Issue: CODEOWNERS not working
**Solution:**
1. File must be at repository root or in `.github/` directory
2. File must be named exactly `CODEOWNERS` (no extension)
3. Enable "Require review from Code Owners" in branch protection settings

---

## Maintenance

### Adding New Secrets
```bash
# Repository secret
gh secret set NEW_SECRET --body "value"

# Environment secret
gh secret set NEW_SECRET --env staging --body "value"
gh secret set NEW_SECRET --env production --body "value"
```

### Updating Secrets
```bash
# Same command as adding (overwrites)
gh secret set EXISTING_SECRET --body "new_value"
```

### Removing Secrets
```bash
gh secret delete SECRET_NAME
gh secret delete SECRET_NAME --env staging
```

### Updating Branch Protection
```bash
# Update main branch protection
gh api -X PATCH repos/karimzg/donaction/branches/main/protection \
  --input updated_rules.json
```

---

## References

- [GitHub Environments Documentation](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [CODEOWNERS Documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)

---

**Last Updated**: 2025-12-20
**Maintained By**: DevOps Team
