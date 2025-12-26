# Implementation Plan: Issue #37 - Dockerfile Secrets Refactor

> **Created**: 2025-12-22
> **Issue**: [#37](https://github.com/karimzg/donaction/issues/37)
> **Epic**: #20 (CI/CD GitHub Actions Migration)

---

## Summary

Replace `.env` file copying with build-time argument injection from GitHub secrets.

## Files to Modify

| File | Change |
|------|--------|
| `donaction-api/docker/production/Dockerfile` | Remove line 22 COPY, add ARG + RUN echo |
| `donaction-frontend/docker/production/Dockerfile` | Remove lines 10, 15 cp, add ARG + RUN echo |
| `donaction-saas/docker/production/Dockerfile` | Remove line 13 cp, add ARG + RUN echo |
| `.github/workflows/build.yml` | Add environment detection + build-args |

**Note**: `donaction-admin` uses Angular's `environment.ts` files (committed), no changes needed.

---

## Dockerfile Changes

### API Dockerfile

**Remove**:
```dockerfile
COPY ./donaction-api/.env.${ENV} ./.env
```

**Add** (before `RUN npm run build`):
```dockerfile
# Build-time secrets (17 vars)
ARG DATABASE_PASSWORD
ARG DATABASE_NAME
ARG DATABASE_USERNAME
ARG DATABASE_HOST
ARG DATABASE_PORT
ARG JWT_SECRET
ARG ADMIN_JWT_SECRET
ARG APP_KEYS
ARG API_TOKEN_SALT
ARG TRANSFER_TOKEN_SALT
ARG STRIPE_SECRET_KEY
ARG STRIPE_WEBHOOK_SECRET
ARG IMAGEKIT_PUBLIC_KEY
ARG IMAGEKIT_PRIVATE_KEY
ARG IMAGEKIT_URL_ENDPOINT
ARG EMAIL_BREVO_API_KEY
ARG NEXTAUTH_URL
ARG ENVIRONMENT
ARG GOOGLE_RECAPTCHA_SITE_KEY
ARG KLUBR_UUID

# Generate .env
RUN echo "NODE_ENV=${NODE_ENV}" > .env && \
    echo "DATABASE_PASSWORD=${DATABASE_PASSWORD}" >> .env && \
    # ... all other variables
```

### Frontend Dockerfile

**Remove**:
```dockerfile
RUN cp .env.${ENV} .env  # Lines 10, 15
```

**Add**:
- SaaS args: `VITE_STRAPI_API_URL`, `VITE_STRAPI_API_TOKEN`, etc. (9 vars)
- Frontend args: `NEXT_PUBLIC_*` (14 vars)
- Generate `.env` for both workspaces

### SaaS Dockerfile

**Remove**:
```dockerfile
RUN cp .env.${ENV} .env
```

**Add**: VITE_* args (9 vars) + RUN echo pattern

---

## Workflow Changes

### Add Environment Detection (after line 120):
```yaml
- name: Determine environment
  if: matrix.changed == 'true'
  id: env
  run: |
    if [[ "${{ github.ref }}" == refs/heads/demo/* ]]; then
      echo "environment=staging" >> $GITHUB_OUTPUT
    else
      echo "environment=production" >> $GITHUB_OUTPUT
    fi
```

### Modify Build Step (lines 122-132):
```yaml
- name: Build and push Docker image
  uses: docker/build-push-action@v5
  with:
    context: ${{ matrix.context }}
    file: ${{ matrix.dockerfile }}
    push: true
    tags: ${{ steps.tags.outputs.tags }}
    build-args: |
      NODE_ENV=production
      DATABASE_PASSWORD=${{ secrets.DATABASE_PASSWORD }}
      # ... all other secrets
    cache-from: type=gha
    cache-to: type=gha,mode=max
    platforms: linux/amd64
```

---

## GitHub Secrets Required

### Per Environment (staging + production)

**Database (5)**: `DATABASE_PASSWORD`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_HOST`, `DATABASE_PORT`

**Auth (5)**: `JWT_SECRET`, `ADMIN_JWT_SECRET`, `APP_KEYS`, `API_TOKEN_SALT`, `TRANSFER_TOKEN_SALT`

**Stripe (3)**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY`

**ImageKit (3)**: `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`

**Google (4)**: `GOOGLE_RECAPTCHA_SITE_KEY`, `GOOGLE_MAPS_API_KEY`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_GOOGLE_CLIENT_SECRET`

**URLs (6)**: `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SERVER_COMPONENTS_DEV_API_URL`, `VITE_STRAPI_API_URL`, `VITE_NEXT_URL`

**Tokens (4)**: `NEXT_PUBLIC_STRAPI_API_TOKEN`, `VITE_STRAPI_API_TOKEN`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_KLUBR_SPONSORSHIP_FORM_TOKEN`

**Analytics (5)**: `NEXT_PUBLIC_ACTIVATE_ANALYTICS`, `NEXT_PUBLIC_PLAUSIBLE_DATA_DOMAIN`, `VITE_ACTIVATE_ANALYTICS`, `VITE_PLAUSIBLE_DATA_DOMAIN`, `VITE_GOOGLE_GA_TRACKING_ID`

**Other (2)**: `EMAIL_BREVO_API_KEY`, `KLUBR_UUID`

**Total**: ~37 secrets × 2 environments = **74 secrets**

---

## Verification

1. Push to `demo/*` branch
2. Check GitHub Actions build passes
3. Pull image: `docker run --rm image cat /app/.env`
4. Deploy to staging, verify app works
