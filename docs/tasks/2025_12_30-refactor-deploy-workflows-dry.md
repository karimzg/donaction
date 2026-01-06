# Instruction: Refactor Deploy Workflows to DRY

## Feature

- **Summary**: Extract reusable composite actions from deploy-staging.yml (1018 lines) and deploy-production.yml (1446 lines) to eliminate duplication and reduce total lines by ~75%
- **Stack**: `GitHub Actions, Docker Compose, Bash, SSH`
- **Branch name**: `chore/refactor-deploy-workflows-dry`

## Existing files

- @.github/workflows/deploy-staging.yml
- @.github/workflows/deploy-production.yml
- @.github/actions/docker-build-push/action.yml
- @.github/actions/notify/action.yml

### New files to create

- .github/actions/ssh-setup/action.yml
- .github/actions/validate-secrets/action.yml
- .github/actions/deploy-containers/action.yml
- .github/actions/health-check/action.yml
- .github/actions/rollback/action.yml
- .github/actions/cleanup-images/action.yml
- .github/templates/env.staging.template
- .github/templates/env.production.template

## Implementation phases

### Phase 1: Create SSH/Validation Actions

> Foundation actions for SSH connection and secrets validation

1. Create `ssh-setup` action
   - [ ] 1.1. Inputs: ssh-private-key, ssh-host, ssh-port (default 63009), ssh-user
   - [ ] 1.2. Steps: mkdir ~/.ssh, write key, chmod 600, ssh-keyscan
   - [ ] 1.3. Cleanup step for key removal (if: always())

2. Create `validate-secrets` action
   - [ ] 2.1. Inputs: secrets (multiline KEY=value format)
   - [ ] 2.2. Loop through secrets, collect missing
   - [ ] 2.3. Error with list of missing secrets

### Phase 2: Create Deployment Actions

> Core deployment logic extraction

1. Create `deploy-containers` action
   - [ ] 1.1. Inputs: ssh-*, deploy-dir, services-list, image-tag, image-registry, run-migrations
   - [ ] 1.2. Step: Backup current deployment (images, compose, env)
   - [ ] 1.3. Step: Pull Docker images
   - [ ] 1.4. Step: Run migrations (conditional on run-migrations + api in services)
   - [ ] 1.5. Step: docker compose up with --wait
   - [ ] 1.6. Outputs: deployment-time

2. Create environment templates
   - [ ] 2.1. Extract common variables from deploy-staging.yml .env generation
   - [ ] 2.2. Create `env.staging.template` with {{PLACEHOLDER}} syntax
   - [ ] 2.3. Create `env.production.template` with {{PLACEHOLDER}} syntax
   - [ ] 2.4. Use envsubst or sed for variable substitution in workflows

### Phase 3: Create Monitoring Actions

> Health check, rollback, and cleanup

1. Create `health-check` action
   - [ ] 1.1. Inputs: ssh-*, domain, check-db (bool)
   - [ ] 1.2. Check nginx /health endpoint with retries
   - [ ] 1.3. Check API container health status
   - [ ] 1.4. Check frontend/admin/saas container status
   - [ ] 1.5. Check DB connection via API _health endpoint
   - [ ] 1.6. Outputs: service-status (comma-separated), status (success/failure)

2. Create `rollback` action
   - [ ] 2.1. Inputs: ssh-*, deploy-dir
   - [ ] 2.2. Find latest backup files
   - [ ] 2.3. Restore compose + env from backup
   - [ ] 2.4. Pull previous images, docker compose down/up
   - [ ] 2.5. Verify rollback with basic health check

3. Create `cleanup-images` action
   - [ ] 3.1. Inputs: ssh-*, image-registry, retention-hours (default 48)
   - [ ] 3.2. Get running container images
   - [ ] 3.3. Remove old images not in use

### Phase 4: Extend Notify Action

> Add deployment and rollback notification modes

1. Extend existing `notify` action
   - [ ] 1.1. Add input: mode (build | deploy | rollback)
   - [ ] 1.2. Add inputs: domain, version, environment-name, deployment-time
   - [ ] 1.3. Conditional message templates based on mode
   - [ ] 1.4. Rollback mode: warning color, rollback-specific fields
   - [ ] 1.5. Deploy mode: success/failure, service status, URLs

### Phase 5: Refactor Staging Workflow

> Apply actions to deploy-staging.yml

1. Refactor deploy-staging.yml
   - [ ] 1.1. Keep validate job as-is (apps determination, branch validation)
   - [ ] 1.2. Replace SSH setup steps with ssh-setup action
   - [ ] 1.3. Replace secrets validation with validate-secrets action
   - [ ] 1.4. Keep inline: port check, SSL check, create dirs, copy files (simple, env-specific)
   - [ ] 1.5. Replace .env generation with template + envsubst
   - [ ] 1.6. Replace backup/pull/migrate/deploy with deploy-containers action
   - [ ] 1.7. Replace health check logic with health-check action
   - [ ] 1.8. Replace rollback logic with rollback action
   - [ ] 1.9. Replace cleanup with cleanup-images action
   - [ ] 1.10. Update notify job to use extended notify action

### Phase 6: Refactor Production Workflow

> Apply actions to deploy-production.yml

1. Refactor deploy-production.yml
   - [ ] 1.1. Keep validate job (version tag validation unique to prod)
   - [ ] 1.2. Keep deploy-staging job structure (unique to prod)
   - [ ] 1.3. Keep validate-staging job (unique to prod)
   - [ ] 1.4. Apply same action replacements as staging for deploy-production job
   - [ ] 1.5. Keep post-deploy job as-is (merge to main, create tag - unique to prod)
   - [ ] 1.6. Update notify job with deploy mode

## Reviewed implementation

- [ ] Phase 1: SSH/Validation Actions
- [ ] Phase 2: Deployment Actions
- [ ] Phase 3: Monitoring Actions
- [ ] Phase 4: Extend Notify Action
- [ ] Phase 5: Refactor Staging Workflow
- [ ] Phase 6: Refactor Production Workflow

## Validation flow

1. Push to demo/* branch to trigger build workflow (verify no regression)
2. Manually trigger deploy-staging workflow, verify successful deployment
3. Intentionally break deployment to verify rollback works
4. Verify Slack/Discord notifications for deploy and rollback modes
5. Verify health checks report correct service status
6. Manually trigger deploy-production from release/* branch
7. Verify staging pre-deploy, production deploy, and post-deploy (tag creation)

## Estimations

- **Confidence**: 9/10
  - ✅ All logic already exists, just extracting to actions
  - ✅ Composite actions are well-documented pattern
  - ✅ No new functionality, pure refactoring
  - ❌ Risk: SSH context passing between action steps may need testing
- **Time to implement**: 3-4 hours
