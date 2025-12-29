# Instruction: SaaS Registry-Based Build Architecture

## Feature

- **Summary**: Modify CI/CD so Frontend consumes SaaS assets from GHCR registry instead of building internally, enabling versioned SaaS distribution for future multi-app consumption
- **Stack**: `GitHub Actions`, `Docker`, `GHCR`
- **Branch name**: `demo/test-build-workflow` (current)

## Existing files

- @.github/workflows/build.yml
- @donaction-frontend/docker/production/Dockerfile

### New file to create

- None

## Implementation phases

### Phase 1: Restructure Workflow

> Extract SaaS and Frontend from matrix into separate jobs with dependency

1. Create dedicated `build-saas` job
   - [ ] 1.1. Copy SaaS build step from matrix
   - [ ] 1.2. Add `needs: [detect-changes]`
   - [ ] 1.3. Add `if: needs.detect-changes.outputs.saas == 'true'`
   - [ ] 1.4. Output `saas_tag` for Frontend to consume

2. Create dedicated `build-frontend` job
   - [ ] 2.1. Copy Frontend build step from matrix
   - [ ] 2.2. Add `needs: [detect-changes, build-saas]`
   - [ ] 2.3. Add `if: always() && needs.detect-changes.outputs.frontend == 'true'`
   - [ ] 2.4. Add `SAAS_VERSION` build-arg (use `dev` tag)

3. Update matrix to exclude SaaS and Frontend
   - [ ] 3.1. Remove SaaS and Frontend from matrix includes
   - [ ] 3.2. Update job-level `if` condition

### Phase 2: Update Frontend Dockerfile

> Remove internal SaaS build, pull from registry instead

1. Add SaaS registry stage
   - [ ] 1.1. Add `ARG SAAS_VERSION=dev`
   - [ ] 1.2. Add `FROM ghcr.io/karimzg/donaction-saas:${SAAS_VERSION} AS saas`

2. Remove SaaS build steps
   - [ ] 2.1. Remove VITE_* ARG declarations (lines 7-16)
   - [ ] 2.2. Remove SaaS WORKDIR, COPY, npm install, .env generation, npm build (lines 34-54)

3. Update SaaS asset copy
   - [ ] 3.1. Replace `cp -R ../app-saas/build/...` with `COPY --from=saas /usr/share/nginx/html/saas/donaction-web-components ./public/donaction-web-components`

### Phase 3: Cleanup Workflow

> Remove unnecessary build args from Frontend step

1. Remove VITE_* build-args from Frontend
   - [ ] 1.1. Remove all VITE_* lines from Frontend build-args
   - [ ] 1.2. Remove comment about VITE_* duplication

2. Add SAAS_VERSION build-arg
   - [ ] 2.1. Add `SAAS_VERSION=dev` to Frontend build-args

## Reviewed implementation

- [x] Phase 1: Restructure Workflow
- [x] Phase 2: Update Frontend Dockerfile
- [x] Phase 3: Cleanup Workflow

## Validation flow

1. Push changes to `demo/test-build-workflow` branch
2. Verify GitHub Actions workflow triggers
3. Check SaaS job runs first (when SaaS changes detected)
4. Check Frontend job waits for SaaS, then pulls from registry
5. Verify both images pushed to GHCR with correct tags
6. Test scenario: only Frontend changes - SaaS should skip, Frontend uses existing `dev` image

## Estimations

- **Confidence**: 9/10
  - ✅ Clear requirements, straightforward Docker/GHA changes
  - ✅ `COPY --from` pattern is well-documented
  - ✅ Existing workflow structure supports refactoring
  - ⚠️ Minor risk: First build needs existing SaaS image in registry (already exists)

- **Time to implement**: 30-45 minutes
