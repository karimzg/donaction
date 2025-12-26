# Instruction: US-003: Workflow Build Docker

## Feature

- **Summary**: Automated Docker image builds for all 4 apps (admin, api, frontend, saas) on deployment branches with intelligent change detection, GHCR registry push, environment-based tagging, and notifications
- **Stack**: `GitHub Actions`, `Docker Buildx`, `GHCR (GitHub Container Registry)`, `dorny/paths-filter@v3`, `Slack/Discord webhooks`
- **Branch name**: `feat/issue-23`

## Existing files

- `.github/workflows/ci.yml` - Reference for change detection pattern
- `donaction-admin/Dockerfile` - Admin production Dockerfile
- `donaction-admin/docker/production/Dockerfile` - Alternative admin Dockerfile
- `donaction-api/docker/development/Dockerfile` - API Dockerfile (need production version)
- `donaction-frontend/docker/development/Dockerfile` - Frontend Dockerfile (need production version)

## New files to create

- `.github/workflows/build.yml` - Main Docker build workflow

## Implementation phases

### Phase 1: Workflow Foundation

> Setup workflow triggers, permissions, and GHCR authentication

1. Create `.github/workflows/build.yml`
   - 1.1. Define workflow name and triggers (push to `demo/*`, `release/*`, `hotfix/*`)
   - 1.2. Set permissions (contents: read, packages: write, id-token: write)
   - 1.3. Configure concurrency group to cancel in-progress builds

2. Setup GHCR authentication
   - 2.1. Add Docker login step with GHCR registry
   - 2.2. Use `GITHUB_TOKEN` for authentication
   - 2.3. Set registry URL: `ghcr.io`

### Phase 2: Intelligent Change Detection

> Detect which apps changed to build only necessary images

1. Create `detect-changes` job
   - 1.1. Use `dorny/paths-filter@v3` action (same as ci.yml)
   - 1.2. Define filters for admin, frontend, api, saas paths
   - 1.3. Output boolean flags for each app

2. Configure filter patterns
   - 2.1. `admin: donaction-admin/**`
   - 2.2. `frontend: donaction-frontend/**`
   - 2.3. `api: donaction-api/**`
   - 2.4. `saas: donaction-saas/**`

### Phase 3: Docker Build Matrix

> Build and push Docker images for changed apps with proper tagging

1. Create `build` job with matrix strategy
   - 1.1. Set dependency on `detect-changes` job
   - 1.2. Define matrix with 4 apps (admin, api, frontend, saas)
   - 1.3. Skip unchanged apps using conditional step

2. Setup Docker Buildx with cache
   - 2.1. Install Docker Buildx action
   - 2.2. Configure cache backend (GitHub Actions cache)
   - 2.3. Enable multi-platform support if needed

3. Determine image tags dynamically
   - 3.1. Set `dev` tag for `demo/*` branches
   - 3.2. Set `prod` tag for `release/*` and `hotfix/*` branches
   - 3.3. Add SHA-based tag: `sha-${{ github.sha }}`
   - 3.4. Format: `ghcr.io/karimzg/donaction-{app}:{tag}`

4. Build and push images
   - 4.1. Use `docker/build-push-action@v5`
   - 4.2. Set context path per app (e.g., `./donaction-admin`)
   - 4.3. Set Dockerfile path (use production Dockerfiles)
   - 4.4. Push to GHCR with multiple tags
   - 4.5. Enable cache layers (mode=max)

### Phase 4: Notifications

> Notify team on Slack and Discord after builds complete

1. Create `notify` job
   - 1.1. Set dependency on `build` job
   - 1.2. Run only if build job completes (success or failure)
   - 1.3. Collect build results from previous job

2. Send Slack notification
   - 2.1. Use webhook URL from secrets (`SLACK_WEBHOOK_URL`)
   - 2.2. Include: build status, branch name, apps built, image tags
   - 2.3. Format message with color coding (green=success, red=failure)

3. Send Discord notification
   - 3.1. Use webhook URL from secrets (`DISCORD_WEBHOOK_URL`)
   - 3.2. Include same information as Slack
   - 3.3. Format as Discord embed with proper styling

## Reviewed implementation

- [x] Phase 1: Workflow Foundation
- [x] Phase 2: Intelligent Change Detection
- [x] Phase 3: Docker Build Matrix
- [x] Phase 4: Notifications

## Validation flow

1. Push code change to `donaction-admin` on `demo/test-build` branch
2. Verify workflow triggers automatically
3. Confirm change detection identifies only admin app
4. Check Docker build succeeds with buildx cache
5. Verify image pushed to `ghcr.io/karimzg/donaction-admin:dev` and `ghcr.io/karimzg/donaction-admin:sha-<commit>`
6. Confirm Slack notification received with build details
7. Confirm Discord notification received with build details
8. Test with `release/v1.0.0` branch to verify `:prod` tag
9. Test with multiple apps changed to verify parallel builds
10. Verify unchanged apps are skipped

## Estimations

- **Confidence**: 9/10
  - ✅ CI workflow pattern already exists (ci.yml reference)
  - ✅ Dockerfiles exist for most apps
  - ✅ GHCR authentication straightforward with GITHUB_TOKEN
  - ✅ Change detection proven with dorny/paths-filter
  - ❌ Need to verify production Dockerfiles exist/work for api, frontend, saas
  - ❌ Slack/Discord webhook secrets must be configured in repo settings

- **Time to implement**: 1-2 hours (workflow creation, testing with different branches)
