# Instruction: Add Vitest Tests to CI for donaction-saas

## Feature

- **Summary**: Integrate donaction-saas Vitest unit tests into GitHub Actions CI pipeline with coverage reporting
- **Stack**: `GitHub Actions`, `Vitest 2`, `Node.js 20`
- **Branch name**: `feature/saas-vitest-ci`

## Existing files

- @.github/workflows/ci.yml
- @donaction-saas/vitest.config.ts
- @donaction-saas/package.json

### New file to create

- None

## Implementation phases

### Phase 1: Add Test Step to CI

> Add test command to saas matrix entry before build

1. Modify saas matrix entry in ci.yml
   - [ ] 1.1. Add `test-command: npm test -- --coverage` to saas matrix include
   - [ ] 1.2. Add test step before build step (conditional on matrix.changed)
   - [ ] 1.3. Ensure test failure blocks the workflow

### Phase 2: Add Coverage Artifact Upload

> Upload coverage report as GitHub artifact

1. Add artifact upload step
   - [ ] 1.1. Add `actions/upload-artifact@v4` step after test
   - [ ] 1.2. Configure path: `donaction-saas/coverage`
   - [ ] 1.3. Set artifact name: `saas-coverage-report`
   - [ ] 1.4. Conditional upload only when saas changed and tests ran

## Reviewed implementation

- [ ] Phase 1: Add Test Step to CI
- [ ] Phase 2: Add Coverage Artifact Upload

## Validation flow

1. Create PR with changes to `donaction-saas/` folder
2. Verify CI workflow triggers
3. Verify tests run before build
4. Verify coverage artifact is uploaded
5. Verify PR is blocked if tests fail

## Estimations

- **Confidence**: 10/10
  - ✅ Simple workflow modification
  - ✅ Existing matrix structure supports additional commands
  - ✅ Vitest coverage already configured
  - ✅ No secrets or env vars required
- **Time to implement**: 10-15 minutes
