# Implementation Plan: Dockerfile ENV Secrets Refactor

> **Created**: 2025-12-22
> **Related PR**: #36
> **Issue**: Critical - Dockerfiles copy gitignored .env files that don't exist in build context

---

## Problem Statement

Current Dockerfiles attempt to copy environment files that are gitignored:

```dockerfile
# donaction-api/docker/production/Dockerfile:22
COPY ./donaction-api/.env.${ENV} ./.env

# donaction-frontend/docker/production/Dockerfile:10,15
RUN cp .env.${ENV} .env
```

**Impact**: Docker builds will fail with "file not found" errors because:
- `.env.prod`, `.env.dev`, `.env.re7` are gitignored (security best practice)
- GitHub Actions doesn't have access to these files
- `COPY`/`cp` commands will fail

---

## Solution: GitHub Secrets + Build Args

Replace file copying with build-time argument injection from GitHub secrets.

### Architecture

```
GitHub Secrets (encrypted)
    ↓
GitHub Actions Workflow
    ↓ (pass as build-args)
Docker Build
    ↓ (ARG declarations)
Dockerfile
    ↓ (create .env at build time)
Container Image
```

---

## Affected Files

### Dockerfiles to Modify (3)
1. `donaction-api/docker/production/Dockerfile` (Line 22)
2. `donaction-frontend/docker/production/Dockerfile` (Lines 10, 15)
3. `donaction-saas/docker/production/Dockerfile` (Line 10)

### Workflow to Modify (1)
4. `.github/workflows/build.yml` (Build step ~line 121-128)

---

## Required Secrets (23 per environment)

Based on `docs/github-configuration-guide.md`:

### Database (3)
- `DATABASE_PASSWORD`
- `DATABASE_NAME`
- `DATABASE_USERNAME`

### Strapi Backend (5)
- `JWT_SECRET`
- `ADMIN_JWT_SECRET`
- `APP_KEYS` (4 keys comma-separated)
- `API_TOKEN_SALT`
- `TRANSFER_TOKEN_SALT`

### Stripe (3)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_WEBHOOK_SECRET_CONNECT`

### ImageKit (3)
- `IMAGEKIT_PUBLIC_KEY`
- `IMAGEKIT_PRIVATE_KEY`
- `IMAGEKIT_URL_ENDPOINT`

### Email (2)
- `BREVO_API_KEY`
- `MAIL_PROVIDER_SMTP_PASSWORD`

### Google Services (4)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_MAPS_API_KEY`
- `GOOGLE_RECAPTCHA_SITE_KEY`

### Auth (2)
- `NEXTAUTH_SECRET`
- `STRAPI_API_TOKEN`

### Additional (1)
- `NODE_ENV` (production/development)

**Total**: 23 secrets × 2 environments (staging + production) = **46 secrets to configure**

---

## Implementation Steps

### Phase 1: Dockerfile Refactor (API)

**File**: `donaction-api/docker/production/Dockerfile`

**Current (Lines 4-24)**:
```dockerfile
ARG ENV=prod
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
# ...
COPY ./donaction-api/.env.${ENV} ./.env  # ← LINE 22 TO REMOVE
RUN npm run build
```

**New**:
```dockerfile
# Declare all build args at top
ARG NODE_ENV=production
ARG DATABASE_PASSWORD
ARG DATABASE_NAME
ARG DATABASE_USERNAME
ARG JWT_SECRET
ARG ADMIN_JWT_SECRET
ARG APP_KEYS
ARG API_TOKEN_SALT
ARG TRANSFER_TOKEN_SALT
ARG STRIPE_SECRET_KEY
ARG STRIPE_WEBHOOK_SECRET
ARG STRIPE_WEBHOOK_SECRET_CONNECT
ARG IMAGEKIT_PUBLIC_KEY
ARG IMAGEKIT_PRIVATE_KEY
ARG IMAGEKIT_URL_ENDPOINT
ARG BREVO_API_KEY
ARG MAIL_PROVIDER_SMTP_PASSWORD

ENV NODE_ENV=${NODE_ENV}

# ... existing FROM, RUN, COPY commands ...

# Replace line 22 with dynamic .env generation
RUN echo "NODE_ENV=${NODE_ENV}" > .env && \
    echo "DATABASE_PASSWORD=${DATABASE_PASSWORD}" >> .env && \
    echo "DATABASE_NAME=${DATABASE_NAME}" >> .env && \
    echo "DATABASE_USERNAME=${DATABASE_USERNAME}" >> .env && \
    echo "JWT_SECRET=${JWT_SECRET}" >> .env && \
    echo "ADMIN_JWT_SECRET=${ADMIN_JWT_SECRET}" >> .env && \
    echo "APP_KEYS=${APP_KEYS}" >> .env && \
    echo "API_TOKEN_SALT=${API_TOKEN_SALT}" >> .env && \
    echo "TRANSFER_TOKEN_SALT=${TRANSFER_TOKEN_SALT}" >> .env && \
    echo "STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}" >> .env && \
    echo "STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}" >> .env && \
    echo "STRIPE_WEBHOOK_SECRET_CONNECT=${STRIPE_WEBHOOK_SECRET_CONNECT}" >> .env && \
    echo "IMAGEKIT_PUBLIC_KEY=${IMAGEKIT_PUBLIC_KEY}" >> .env && \
    echo "IMAGEKIT_PRIVATE_KEY=${IMAGEKIT_PRIVATE_KEY}" >> .env && \
    echo "IMAGEKIT_URL_ENDPOINT=${IMAGEKIT_URL_ENDPOINT}" >> .env && \
    echo "BREVO_API_KEY=${BREVO_API_KEY}" >> .env && \
    echo "MAIL_PROVIDER_SMTP_PASSWORD=${MAIL_PROVIDER_SMTP_PASSWORD}" >> .env

RUN npm run build
```

**Pros**: Clear, explicit, one line per variable
**Cons**: Verbose (17 lines)

**Alternative (Compact)**:
```dockerfile
ARG DATABASE_PASSWORD
ARG DATABASE_NAME
# ... all other ARGs ...

RUN printf "NODE_ENV=${NODE_ENV}\n\
DATABASE_PASSWORD=${DATABASE_PASSWORD}\n\
DATABASE_NAME=${DATABASE_NAME}\n\
# ... all other variables ...\n" > .env

RUN npm run build
```

**Recommendation**: Use explicit version for clarity and maintainability.

---

### Phase 2: Dockerfile Refactor (Frontend + SaaS)

**File**: `donaction-frontend/docker/production/Dockerfile`

**Current (Lines 5-15)**:
```dockerfile
ARG ENV=prod

WORKDIR /app-saas
COPY ./donaction-saas ./
RUN npm install
RUN cp .env.${ENV} .env  # ← LINE 10 TO REMOVE
RUN npm run build

WORKDIR /app-build
COPY ./donaction-frontend ./
RUN cp .env.${ENV} .env && yarn install && yarn run build  # ← LINE 15 TO REMOVE
```

**New**:
```dockerfile
# Declare frontend-specific args
ARG NEXTAUTH_SECRET
ARG STRAPI_API_TOKEN
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG GOOGLE_MAPS_API_KEY
ARG GOOGLE_RECAPTCHA_SITE_KEY
ARG NODE_ENV=production

# SaaS build
WORKDIR /app-saas
COPY ./donaction-saas ./
RUN npm install
RUN echo "GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}" > .env && \
    echo "GOOGLE_RECAPTCHA_SITE_KEY=${GOOGLE_RECAPTCHA_SITE_KEY}" >> .env
RUN npm run build

# Frontend build
WORKDIR /app-build
COPY ./donaction-frontend ./
RUN echo "NEXTAUTH_SECRET=${NEXTAUTH_SECRET}" > .env && \
    echo "STRAPI_API_TOKEN=${STRAPI_API_TOKEN}" >> .env && \
    echo "GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}" >> .env && \
    echo "GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}" >> .env && \
    echo "NODE_ENV=${NODE_ENV}" >> .env
RUN npm install && npm run build
```

**Note**: Also fixes package manager inconsistency (yarn → npm)

---

### Phase 3: Workflow Modification

**File**: `.github/workflows/build.yml`

**Current (Lines 121-128)**:
```yaml
- name: Build and push Docker image
  if: matrix.changed == 'true'
  uses: docker/build-push-action@v5
  with:
    context: ${{ matrix.context }}
    file: ${{ matrix.dockerfile }}
    push: true
    tags: ${{ steps.tags.outputs.tags }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
    platforms: linux/amd64
```

**New**:
```yaml
- name: Build and push Docker image
  if: matrix.changed == 'true'
  uses: docker/build-push-action@v5
  with:
    context: ${{ matrix.context }}
    file: ${{ matrix.dockerfile }}
    push: true
    tags: ${{ steps.tags.outputs.tags }}
    build-args: |
      NODE_ENV=production
      DATABASE_PASSWORD=${{ secrets.DATABASE_PASSWORD }}
      DATABASE_NAME=${{ secrets.DATABASE_NAME }}
      DATABASE_USERNAME=${{ secrets.DATABASE_USERNAME }}
      JWT_SECRET=${{ secrets.JWT_SECRET }}
      ADMIN_JWT_SECRET=${{ secrets.ADMIN_JWT_SECRET }}
      APP_KEYS=${{ secrets.APP_KEYS }}
      API_TOKEN_SALT=${{ secrets.API_TOKEN_SALT }}
      TRANSFER_TOKEN_SALT=${{ secrets.TRANSFER_TOKEN_SALT }}
      STRIPE_SECRET_KEY=${{ secrets.STRIPE_SECRET_KEY }}
      STRIPE_WEBHOOK_SECRET=${{ secrets.STRIPE_WEBHOOK_SECRET }}
      STRIPE_WEBHOOK_SECRET_CONNECT=${{ secrets.STRIPE_WEBHOOK_SECRET_CONNECT }}
      IMAGEKIT_PUBLIC_KEY=${{ secrets.IMAGEKIT_PUBLIC_KEY }}
      IMAGEKIT_PRIVATE_KEY=${{ secrets.IMAGEKIT_PRIVATE_KEY }}
      IMAGEKIT_URL_ENDPOINT=${{ secrets.IMAGEKIT_URL_ENDPOINT }}
      BREVO_API_KEY=${{ secrets.BREVO_API_KEY }}
      MAIL_PROVIDER_SMTP_PASSWORD=${{ secrets.MAIL_PROVIDER_SMTP_PASSWORD }}
      NEXTAUTH_SECRET=${{ secrets.NEXTAUTH_SECRET }}
      STRAPI_API_TOKEN=${{ secrets.STRAPI_API_TOKEN }}
      GOOGLE_CLIENT_ID=${{ secrets.GOOGLE_CLIENT_ID }}
      GOOGLE_CLIENT_SECRET=${{ secrets.GOOGLE_CLIENT_SECRET }}
      GOOGLE_MAPS_API_KEY=${{ secrets.GOOGLE_MAPS_API_KEY }}
      GOOGLE_RECAPTCHA_SITE_KEY=${{ secrets.GOOGLE_RECAPTCHA_SITE_KEY }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
    platforms: linux/amd64
```

**Challenge**: Secrets are environment-specific (staging vs production).

**Solution**: Use environment matrix or conditional secrets:

```yaml
- name: Determine environment
  id: env
  run: |
    if [[ "${{ github.ref }}" == refs/heads/demo/* ]]; then
      echo "environment=staging" >> $GITHUB_OUTPUT
    else
      echo "environment=production" >> $GITHUB_OUTPUT
    fi

- name: Build and push Docker image
  if: matrix.changed == 'true'
  environment: ${{ steps.env.outputs.environment }}
  uses: docker/build-push-action@v5
  with:
    # ... same as above, secrets auto-scoped to environment
```

**Benefit**: GitHub automatically uses environment-scoped secrets based on `environment:` key.

---

### Phase 4: GitHub Secrets Configuration

**Manual steps** (cannot be automated):

1. Navigate to: https://github.com/karimzg/donaction/settings/environments
2. For each environment (staging, production):
   - Click environment name
   - Click "Add secret" 23 times
   - Copy values from existing `.env.prod` / `.env.dev` files

**Verification**:
```bash
gh api repos/karimzg/donaction/environments/staging/secrets --jq '.[].name'
gh api repos/karimzg/donaction/environments/production/secrets --jq '.[].name'
```

---

## Testing Strategy

### 1. Local Testing (Optional)
```bash
# Test Dockerfile with local build args
docker build -f donaction-api/docker/production/Dockerfile \
  --build-arg DATABASE_PASSWORD=test123 \
  --build-arg DATABASE_NAME=testdb \
  # ... all other args
  .
```

### 2. Staging Environment Test
1. Push changes to `demo/test-env-refactor` branch
2. Verify workflow triggers
3. Check build logs for .env creation
4. Verify no "file not found" errors
5. Pull image and inspect: `docker run --rm image:dev cat /usr/src/app/.env`

### 3. Production Validation
1. Merge to `release/test-env` branch
2. Verify production secrets used
3. Deploy to test environment
4. Smoke test: API endpoints, frontend pages, admin login

---

## Rollback Plan

If builds fail after implementation:

### Quick Rollback
```bash
git revert <commit-hash>
git push origin feat/issue-23
```

### Temporary Fix
Add back .env file copying temporarily:
```dockerfile
# Emergency fallback - commit .env.prod to repo temporarily
COPY ./donaction-api/.env.prod ./.env
```

**Warning**: Do NOT commit actual .env files with secrets to git permanently.

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing secrets in GitHub | Build fails | Verify all 23 secrets configured before testing |
| Wrong secret values | Runtime errors | Copy from existing .env files carefully |
| Secrets in build logs | Security leak | Build args are hidden in GitHub Actions logs |
| ENV variable order matters | App crash | Follow exact order from current .env files |
| Secrets not scoped to environment | Wrong env used | Use `environment:` key in workflow |

---

## Estimated Effort

| Phase | Time | Complexity |
|-------|------|------------|
| Phase 1: API Dockerfile | 20 min | Medium |
| Phase 2: Frontend Dockerfile | 15 min | Medium |
| Phase 3: Workflow | 10 min | Low |
| Phase 4: Secret Configuration | 30 min | Manual/tedious |
| Testing | 45 min | High (requires environments) |
| **Total** | **~2 hours** | **Medium-High** |

---

## Success Criteria

- [ ] All 3 Dockerfiles refactored (no more `COPY .env`)
- [ ] Workflow passes build args to Docker
- [ ] 46 secrets configured in GitHub (23 × 2 environments)
- [ ] Staging build succeeds on `demo/*` branch
- [ ] Production build succeeds on `release/*` branch
- [ ] No secrets exposed in build logs
- [ ] Applications run correctly with injected secrets

---

## Recommendations

### For This PR (#36)
**Skip this refactor** - too complex for initial workflow implementation.

### For Follow-up PR (New Issue)
1. Create issue: "Refactor Dockerfiles to use build-time secrets injection"
2. Assign to DevOps team member with access to production secrets
3. Schedule for after initial workflow is proven working
4. Test thoroughly in staging before production

### Alternative: Runtime ENV Injection
Consider passing env vars at container runtime instead of build time:
```bash
docker run --env-file .env.prod app:latest
```

Simpler but requires infrastructure changes (Kubernetes ConfigMaps, Docker Compose env_file, etc.)

---

## Next Steps

**If approved**:
1. I'll implement Phases 1-3 (Dockerfile + Workflow changes)
2. You manually configure Phase 4 (GitHub secrets)
3. Test on `demo/env-refactor` branch
4. Merge after successful staging test

**If deferred**:
1. Document this plan in separate issue
2. Continue with current PR using existing Dockerfiles
3. Add `.env.*` files to repo temporarily (NOT RECOMMENDED)
4. Or skip Docker builds until secrets are configured

---

**Decision Required**: Proceed with implementation or defer to separate PR?
