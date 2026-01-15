# Instruction: Add SMTP Email Environment Variables to CI/CD

## Feature

- **Summary**: Add missing SMTP email configuration variables to GitHub CI/CD pipelines for staging and production deployments, enabling Strapi email plugin with nodemailer provider
- **Stack**: `GitHub Actions`, `Strapi 5`, `TypeScript`
- **Branch name**: `fix/smtp-email-cicd-vars`

## Existing files

- @.github/workflows/deploy-staging.yml
- @.github/workflows/deploy-production.yml
- @.github/templates/env.staging.template
- @.github/templates/env.production.template
- @donaction-api/src/helpers/emails/emailService.ts

### New file to create

- None

## Implementation phases

### Phase 1: GitHub Configuration (Manual)

> Add secrets to GitHub repository settings

1. Add GitHub Secrets (Settings > Secrets and variables > Actions > Secrets)
   - [ ] 1.1. Add `EMAIL_SMTP_USER` = `dev@nakaa.fr`
   - [ ] 1.2. Add `EMAIL_SMTP_PASS` = (SMTP password)
   - [ ] 1.3. Add `ADMIN_EMAIL_BCC` = `k.zgoulli@gmail.com`

### Phase 2: Update .env Templates

> Add SMTP configuration variables to env templates

1. Update `.github/templates/env.staging.template`
   - [ ] 1.1. Add SMTP section after existing Email section with:
     - `EMAIL_PROVIDER=nodemailer`
     - `EMAIL_SMTP_HOST=smtp-relay.brevo.com`
     - `EMAIL_SMTP_PORT=587`
     - `EMAIL_SMTP_USER=${EMAIL_SMTP_USER}`
     - `EMAIL_SMTP_PASS=${EMAIL_SMTP_PASS}`
     - `EMAIL_ADDRESS_FROM=dons@donaction.fr`
     - `EMAIL_ADDRESS_REPLY=dons@donaction.fr`
     - `EMAIL_BREVO_ENV=staging`
     - `ADMIN_EMAIL_PRIMARY=hello@donaction.fr`
     - `ADMIN_EMAIL_BCC=${ADMIN_EMAIL_BCC}`

2. Update `.github/templates/env.production.template`
   - [ ] 2.1. Add same SMTP section with `EMAIL_BREVO_ENV=prod`

### Phase 3: Update Workflows

> Export secrets in workflow env generation step

1. Update `.github/workflows/deploy-staging.yml`
   - [ ] 1.1. In "Generate and copy .env file" step, add exports:
     - `export EMAIL_SMTP_USER="${{ secrets.EMAIL_SMTP_USER }}"`
     - `export EMAIL_SMTP_PASS="${{ secrets.EMAIL_SMTP_PASS }}"`
     - `export ADMIN_EMAIL_BCC="${{ secrets.ADMIN_EMAIL_BCC }}"`
   - [ ] 1.2. Add to `validate-secrets` action inputs

2. Update `.github/workflows/deploy-production.yml`
   - [ ] 2.1. Same changes in both staging deploy job and production deploy job

### Phase 4: Code Change

> Prefix email subject with environment tag when not in production

1. Modify `donaction-api/src/helpers/emails/emailService.ts`
   - [ ] 1.1. In `sendEmailViaStrapiProvider()`, before line 55 (`emailService.send`):
     - Get env: `const brevoEnv = process.env.EMAIL_BREVO_ENV || 'dev';`
     - If `brevoEnv !== 'prod'`, prefix subject: `subject = \`[\${brevoEnv.toUpperCase()}] - \${subject}\``

## Reviewed implementation

- [ ] Phase 1: GitHub Configuration
- [ ] Phase 2: Update .env Templates
- [ ] Phase 3: Update Workflows
- [ ] Phase 4: Code Change

## Validation flow

1. Deploy to staging environment
2. Trigger an action that sends email via `sendEmailViaStrapiProvider()` (e.g., member invitation)
3. Verify email is received with `[STAGING] -` prefix in subject
4. Check Strapi logs for successful SMTP connection
5. Deploy to production and verify emails have no prefix

## Estimations

- **Confidence**: 9/10
  - ✅ Clear template pattern already exists in codebase
  - ✅ Same SMTP credentials for all envs (simpler)
  - ✅ Minimal code change required
  - ❌ Risk: SMTP credentials must be manually added to GitHub
- **Time to implement**: 15-20 minutes (excluding manual GitHub config)
