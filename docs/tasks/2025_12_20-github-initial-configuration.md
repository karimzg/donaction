# Instruction: US-001: Configuration initiale GitHub

## Feature

- **Summary**: Configure GitHub repository with environments (staging/production), secrets management, branch protection rules, and CODEOWNERS file to enable secure automated deployments
- **Stack**: `GitHub Environments`, `GitHub Secrets`, `GitHub Branch Protection`, `GitHub Actions`
- **Branch name**: `feat/issue-21`

## Existing files

None - This is pure infrastructure configuration via GitHub UI/API

### New files to create

- CODEOWNERS

## Implementation phases

### Phase 1: Repository Setup & Verification

> Verify repository exists and is ready for configuration

1. Confirm repository accessibility
   - Verify repository exists at karimzg/donaction
   - Confirm write access to repository settings
2. Document current state
   - Check existing environments
   - Check existing secrets
   - Check existing branch protection rules

### Phase 2: Environment Configuration

> Create staging and production environments with appropriate protection levels

1. Create staging environment
   - Navigate to Settings > Environments
   - Create environment named "staging"
   - Set no deployment protection rules
   - Document environment URL/ID
2. Create production environment
   - Navigate to Settings > Environments
   - Create environment named "production"
   - Configure required reviewers (minimum 1 approval)
   - Document environment URL/ID and reviewers list

### Phase 3: Secrets Management

> Configure all required secrets for repository and environments

1. Configure repository-level secrets
   - Add SSH_PRIVATE_KEY
   - Add SLACK_WEBHOOK_URL
   - Add DISCORD_WEBHOOK_URL
2. Configure staging environment secrets
   - SSH: SSH_HOST, SSH_USER
   - Database: DATABASE_PASSWORD, DATABASE_NAME, DATABASE_USERNAME
   - Strapi: JWT_SECRET, ADMIN_JWT_SECRET, APP_KEYS, API_TOKEN_SALT, TRANSFER_TOKEN_SALT
   - Stripe: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_WEBHOOK_SECRET_CONNECT
   - ImageKit: IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT
   - Email: BREVO_API_KEY, MAIL_PROVIDER_SMTP_PASSWORD
   - Google: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_MAPS_API_KEY, GOOGLE_RECAPTCHA_SITE_KEY
   - Auth: NEXTAUTH_SECRET, STRAPI_API_TOKEN
3. Configure production environment secrets
   - Copy all staging secrets with production values
   - Add STRIPE_PUBLISHABLE_KEY (production only)

### Phase 4: Branch Protection Rules

> Configure branch protection to ensure code quality and review process

1. Configure main branch protection
   - Navigate to Settings > Branches > Add rule
   - Branch name pattern: main
   - Enable "Require a pull request before merging"
   - Set "Require approvals" to 1
   - Enable "Dismiss stale pull request approvals when new commits are pushed"
   - Enable "Require status checks to pass before merging"
   - Add status check: CI
   - Enable "Include administrators"
   - Save changes
2. Configure develop branch protection
   - Navigate to Settings > Branches > Add rule
   - Branch name pattern: develop
   - Enable "Require a pull request before merging"
   - Enable "Require status checks to pass before merging"
   - Add status check: CI
   - Save changes

### Phase 5: CODEOWNERS Configuration

> Create CODEOWNERS file to enforce mandatory reviewers

1. Create CODEOWNERS file
   - Create file at root: CODEOWNERS
   - Add global owner pattern: * @reviewer1 @reviewer2
   - Add specific patterns if needed for different directories
   - Commit to repository
2. Verify CODEOWNERS integration
   - Confirm file is recognized by GitHub
   - Test with a draft PR to verify reviewers are auto-assigned

## Reviewed implementation

- [ ] Phase 1: Repository Setup & Verification
- [ ] Phase 2: Environment Configuration
- [ ] Phase 3: Secrets Management
- [ ] Phase 4: Branch Protection Rules
- [ ] Phase 5: CODEOWNERS Configuration

## Validation flow

1. Verify environments exist in Settings > Environments
2. Confirm staging has no protection rules
3. Confirm production requires reviewer approval
4. Test secret accessibility in GitHub Actions workflow
5. Attempt to push directly to main (should fail)
6. Create test PR to main (should require 1 approval + CI pass)
7. Create test PR to develop (should require CI pass only)
8. Verify CODEOWNERS auto-assigns reviewers on new PRs

## Estimations

- Confidence: 9/10
  - ✅ GitHub UI/API is well-documented and stable
  - ✅ Configuration tasks are straightforward
  - ✅ All requirements are clear and specific
  - ❌ Risk: Secret values must be obtained from existing infrastructure/team
  - ❌ Risk: Reviewer usernames must be confirmed with team

- Time to implement: 45-60 minutes
  - 5 min: Repository verification
  - 10 min: Environment setup
  - 25 min: Secrets configuration (most time-consuming)
  - 10 min: Branch protection setup
  - 5 min: CODEOWNERS creation
  - 5 min: Validation and testing
