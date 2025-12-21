# Instruction: US-002: Workflow CI (Lint + Types)

## Feature

- **Summary**: Implement GitHub Actions CI workflow to automatically verify code quality (lint and type-check) on every push and pull request, with intelligent change detection to run checks only for modified apps in the monorepo
- **Stack**: `GitHub Actions`, `Node.js 18/20/22`, `dorny/paths-filter@v3`, `actions/setup-node@v4`, `actions/cache@v4`
- **Branch name**: `feat/issue-22`

## Existing files

None - this is a new workflow file creation

### New file to create

- `.github/workflows/ci.yml`

## Implementation phases

### Phase 1: Workflow Foundation

> Create workflow file with proper triggers and permissions

1. Create `.github/workflows/ci.yml` file
   - [x] 1.1. Define workflow name: "CI - Lint & Type Check"
   - [x] 1.2. Configure triggers:
         - Push to `develop` and `feature/*` branches
         - Pull requests targeting `develop` branch
   - [x] 1.3. Set concurrency group to cancel in-progress runs for same branch
   - [x] 1.4. Define permissions: `contents: read`, `pull-requests: read`

### Phase 2: Change Detection Job

> Detect which apps were modified using path filters

1. Implement `detect-changes` job
   - [x] 2.1. Use `ubuntu-latest` runner
   - [x] 2.2. Checkout repository with `actions/checkout@v4`
   - [x] 2.3. Configure `dorny/paths-filter@v3` action with filters:
         - `admin`: `donaction-admin/**`
         - `frontend`: `donaction-frontend/**`
         - `api`: `donaction-api/**`
         - `saas`: `donaction-saas/**`
   - [x] 2.4. Output boolean results for each app (admin, frontend, api, saas)

### Phase 3: Verification Matrix Job

> Run lint/build checks for modified apps only

1. Create `verify` job with matrix strategy
   - [x] 3.1. Set job dependency: `needs: detect-changes`
   - [x] 3.2. Configure conditional execution: run if at least one app changed
   - [x] 3.3. Define matrix with app configurations:
         - admin: node 20, command "npm run build" (changed from lint - script not available)
         - frontend: node 18, command "npm run lint"
         - api: node 22, command "npm run build"
         - saas: node 20, command "npm run build"
   - [x] 3.4. Add matrix conditional: only run if specific app changed

2. Set up Node.js environment
   - [x] 3.5. Setup Node.js using `actions/setup-node@v4` with matrix version
   - [x] 3.6. Configure npm cache using `actions/setup-node@v4` cache parameter:
         - Cache key based on `package-lock.json` hash
         - Cache type: 'npm'

3. Install dependencies and run checks
   - [x] 3.7. Run `npm ci` to install dependencies
   - [x] 3.8. Execute matrix-specific command (lint or build)
   - [x] 3.9. Ensure non-zero exit codes fail the workflow

### Phase 4: Workflow Status Configuration

> Ensure proper failure propagation and PR status reporting

1. Configure job failure handling
   - [x] 4.1. Verify `verify` job properly fails workflow on error (default GitHub Actions behavior)
   - [x] 4.2. Ensure PR checks show individual job statuses (matrix strategy provides this)
   - [x] 4.3. Test that workflow appears in PR "Checks" tab (automatic)

## Reviewed implementation

- [x] Phase 1
- [x] Phase 2
- [x] Phase 3
- [x] Phase 4

## Validation flow

1. Create test branch matching `feature/*` pattern
2. Modify file in `donaction-admin/` directory
3. Push to trigger workflow
4. Verify in GitHub Actions:
   - Workflow runs automatically
   - `detect-changes` job detects only admin app changed
   - `verify` job runs only for admin with Node 20 and `npm run lint`
   - Other apps skipped
5. Modify file in `donaction-frontend/`
6. Push again
7. Verify frontend verification runs with Node 18 and `npm run lint`
8. Create PR targeting `develop`
9. Verify workflow runs on PR and results appear in PR checks
10. Introduce lint error in one app
11. Verify workflow fails and PR check shows failure

## Estimations

- **Confidence**: 9/10
  - ✅ GitHub Actions is well-documented and battle-tested
  - ✅ `dorny/paths-filter` is widely used for monorepo change detection
  - ✅ Matrix strategy is standard for multi-app verification
  - ✅ Node.js setup and caching are straightforward
  - ⚠️ Admin app may not have `npm run lint` script configured (needs verification)
  - ✅ All other commands confirmed in package.json files
- **Time to implement**: 30-45 minutes
