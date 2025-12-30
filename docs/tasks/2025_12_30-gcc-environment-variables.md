# Instruction: Add Missing GCC Environment Variables to CI/CD

## Feature

- **Summary**: Add 3 missing Google Cloud Console environment variables to deploy workflows for API runtime use
- **Stack**: `GitHub Actions`, `Docker Compose`, `Strapi 5`
- **Branch name**: `fix/gcc-environment-variables`

## Existing files

- @.github/workflows/deploy-staging.yml
- @.github/workflows/deploy-production.yml
- @.github/templates/env.staging.template
- @.github/templates/env.production.template
- @docs/memory-bank/ENVIRONMENT-VARIABLES.md

### New file to create

- None

## Implementation phases

### Phase 1: Update Environment Templates

> Add GCC variables to .env templates

1. Update `.github/templates/env.staging.template`
   - [ ] 1.1. Add `GOOGLE_PROJECT_NUMBER=${GOOGLE_PROJECT_NUMBER}` after line 43 (Google Services section)
   - [ ] 1.2. Add `GOOGLE_API_KEY_ID=${GOOGLE_API_KEY_ID}`
   - [ ] 1.3. Add `GOOGLE_PROJECT_ID=${GOOGLE_PROJECT_ID}`

2. Update `.github/templates/env.production.template`
   - [ ] 2.1. Add same 3 variables in Google Services section

### Phase 2: Update Deploy Workflows

> Export variables for envsubst and inline HEREDOC

1. Update `deploy-staging.yml` - HEREDOC .env generation (line 305-372)
   - [ ] 1.1. Add 3 GCC variables after `GOOGLE_GA_TRACKING_ID` line (~line 348)

2. Update `deploy-production.yml` - staging deploy section (line 198-239)
   - [ ] 2.1. Add `export GOOGLE_PROJECT_NUMBER="${{ vars.GOOGLE_PROJECT_NUMBER }}"` after line 226
   - [ ] 2.2. Add `export GOOGLE_API_KEY_ID="${{ vars.GOOGLE_API_KEY_ID }}"`
   - [ ] 2.3. Add `export GOOGLE_PROJECT_ID="${{ vars.GOOGLE_PROJECT_ID }}"`

3. Update `deploy-production.yml` - production deploy section (line 428-470)
   - [ ] 3.1. Add same 3 export statements after line 457

### Phase 3: Update Documentation

> Document new runtime variables

1. Update `docs/memory-bank/ENVIRONMENT-VARIABLES.md`
   - [ ] 1.1. Add 3 variables to "API (Strapi)" runtime section (after line 105)
   - [ ] 1.2. Mark all 3 as "No" for Secret? column

## Reviewed implementation

- [ ] Phase 1: Environment templates updated
- [ ] Phase 2: Deploy workflows updated
- [ ] Phase 3: Documentation updated

## Validation flow

1. Create PR with changes
2. Configure GitHub repository variables:
   - `staging` environment: `GOOGLE_PROJECT_NUMBER`, `GOOGLE_API_KEY_ID`, `GOOGLE_PROJECT_ID`
   - `production` environment: Same 3 variables with production values
3. Trigger deploy-staging workflow
4. SSH to staging server, verify `.env` contains the 3 new variables
5. Test klubr-subscription creation → verify `updateAuthorizedHosts()` succeeds

## Estimations

- **Confidence**: 10/10
  - ✅ All affected files identified and analyzed
  - ✅ Pattern clear from existing variables
  - ✅ No code changes, only configuration
  - ✅ Runtime-only, no rebuild required
- **Time to implement**: 15-20 minutes
