# Environment Variables Reference

> **Last Updated**: 2025-12-29
> **Purpose**: Document which environment variables are baked at build-time vs injected at runtime

---

## Overview

This document explains how environment variables are handled across the Donaction platform. Understanding the difference between **build-time** and **runtime** variables is critical for proper deployment.

### Key Principle

| Type | When Set | Can Change After Build? |
|------|----------|------------------------|
| **Build-time** | During Docker image build | ❌ No - baked into image |
| **Runtime** | When container starts | ✅ Yes - via .env file |

---

## Build-Time Variables (Baked into Docker Image)

These variables are compiled into the application during the Docker build process. They **cannot be changed** without rebuilding the image.

### Frontend (Next.js)

All `NEXT_PUBLIC_*` variables are replaced at build time.

| Variable | Description | Staging Value | Production Value |
|----------|-------------|---------------|------------------|
| `NEXT_PUBLIC_ENVIRONMENT` | Environment name | `re7` | `prod` |
| `NEXT_PUBLIC_SITE_URL` | Frontend URL | `https://re7.donaction.fr` | `https://www.donaction.fr` |
| `NEXT_PUBLIC_API_URL` | Strapi API URL | `https://re7.donaction.fr/service` | `https://www.donaction.fr/service` |
| `NEXT_PUBLIC_STRAPI_API_TOKEN` | Public API token | staging token | production token |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client | same | same |
| `NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY` | reCAPTCHA site key | same | same |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Google Maps API key | same | same |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key | test key | live key |
| `NEXT_PUBLIC_ACTIVATE_ANALYTICS` | Enable analytics | `false` | `true` |
| `NEXT_PUBLIC_PLAUSIBLE_DATA_DOMAIN` | Plausible domain | staging domain | production domain |
| `NEXT_PUBLIC_KLUBR_SPONSORSHIP_FORM_TOKEN` | Form token | staging token | production token |
| `NEXTAUTH_SECRET` | NextAuth secret | staging secret | production secret |

### SaaS Widget (Svelte/Vite)

All `VITE_*` variables are replaced at build time.

| Variable | Description | Staging Value | Production Value |
|----------|-------------|---------------|------------------|
| `VITE_STRAPI_API_URL` | Strapi API URL | `https://re7.donaction.fr/service` | `https://www.donaction.fr/service` |
| `VITE_STRAPI_API_TOKEN` | API token | staging token | production token |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe public key | test key | live key |
| `VITE_GOOGLE_RECAPTCHA_SITE_KEY` | reCAPTCHA site key | same | same |
| `VITE_GOOGLE_MAPS_KEY` | Google Maps API key | same | same |
| `VITE_GOOGLE_GA_TRACKING_ID` | Google Analytics ID | staging ID | production ID |
| `VITE_ACTIVATE_ANALYTICS` | Enable analytics | `false` | `true` |
| `VITE_PLAUSIBLE_DATA_DOMAIN` | Plausible domain | staging domain | production domain |
| `VITE_NEXT_URL` | Frontend URL | `https://re7.donaction.fr` | `https://www.donaction.fr` |

### Admin Dashboard (Angular)

Angular uses `environment.ts` files, selected at build time.

| Variable | Description |
|----------|-------------|
| `ENVIRONMENT` | `re7` or `prod` |
| `STRAPI_ADMIN_API_TOKEN` | Admin API token |
| `GOOGLE_CLIENT_ID` | Google OAuth client |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `GOOGLE_RECAPTCHA_SITE_KEY` | reCAPTCHA site key |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key |
| `KLUBR_UUID` | Klubr identifier |

---

## Runtime Variables (Injected via .env)

These variables are read when the container starts. They can be changed by updating the `.env` file and restarting the container.

### API (Strapi)

| Variable | Description | Secret? |
|----------|-------------|---------|
| `NODE_ENV` | `production` | No |
| `ENVIRONMENT` | `re7` or `prod` | No |
| `DATABASE_HOST` | PostgreSQL host | Yes |
| `DATABASE_PORT` | PostgreSQL port | No |
| `DATABASE_NAME` | Database name | No |
| `DATABASE_USERNAME` | Database user | Yes |
| `DATABASE_PASSWORD` | Database password | Yes |
| `DATABASE_SSL` | SSL enabled | No |
| `JWT_SECRET` | JWT signing secret | Yes |
| `ADMIN_JWT_SECRET` | Admin JWT secret | Yes |
| `APP_KEYS` | Application keys | Yes |
| `API_TOKEN_SALT` | API token salt | Yes |
| `TRANSFER_TOKEN_SALT` | Transfer token salt | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Yes |
| `STRIPE_WEBHOOK_SECRET_CONNECT` | Stripe Connect webhook | Yes |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key | No |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key | Yes |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL | No |
| `EMAIL_BREVO_API_KEY` | Brevo API key | Yes |
| `GOOGLE_RECAPTCHA_SITE_KEY` | reCAPTCHA key | No |
| `GOOGLE_MAPS_API_KEY` | Maps API key | No |

---

## GitHub Environments & Secrets

### Environment Mapping

| Branch Pattern | GitHub Environment | Image Tag |
|----------------|-------------------|-----------|
| `demo/*` | `staging` | `:dev` |
| `release/*` | `production` | `:prod` |
| `hotfix/*` | `production` | `:prod` |

### Secret Scopes

Secrets are configured per GitHub environment:

```
Repository
├── staging (environment)
│   ├── SSH_HOST → staging server
│   ├── STRIPE_SECRET_KEY → test mode key
│   ├── FRONT_URL → https://re7.donaction.fr
│   └── ... (staging values)
│
└── production (environment)
    ├── SSH_HOST → production server
    ├── STRIPE_SECRET_KEY → live mode key
    ├── FRONT_URL → https://www.donaction.fr
    └── ... (production values)
```

---

## Image Versioning & Deployment Flexibility

### Available Image Tags

Every build creates multiple tags for traceability and rollback:

| Tag Format | Example | Preserved? | Use Case |
|------------|---------|------------|----------|
| `:dev` | `donaction-frontend:dev` | Overwritten | Latest staging build |
| `:prod` | `donaction-frontend:prod` | Overwritten | Latest production build |
| `:sha-xxxxx` | `donaction-frontend:sha-abc1234` | ✅ Yes | Specific commit |
| `:vX.Y.Z` | `donaction-frontend:v1.2.3` | ✅ Yes | Release version |

### Choosing Which Version to Deploy

Deploy workflows accept an optional `image_tag` input:

**Staging (`deploy-staging.yml`):**
```
image_tag: ""           → deploys :dev (default)
image_tag: "sha-abc1234" → deploys specific commit
```

**Production (`deploy-production.yml`):**
```
image_tag: ""           → deploys :prod (default)
image_tag: "v1.2.3"     → deploys specific version
image_tag: "sha-abc1234" → deploys specific commit
```

### Finding Available Tags

**Option 1: From git commit**
```bash
# Get SHA for any commit
git log --oneline -5
# abc1234 feat: add feature X   →  use "sha-abc1234"
```

**Option 2: From GitHub Packages**
- Go to: `https://github.com/orgs/karimzg/packages`
- Select the container (e.g., `donaction-frontend`)
- View all available tags

**Option 3: Using GitHub CLI**
```bash
gh api /user/packages/container/donaction-frontend/versions \
  --jq '.[].metadata.container.tags[]' | head -20
```

### Rollback Scenarios

| Scenario | Action |
|----------|--------|
| Rollback staging to previous build | Deploy with `image_tag: "sha-xxxxx"` of last good commit |
| Rollback production to previous version | Deploy with `image_tag: "v1.1.0"` (previous version) |
| Rollback production to specific commit | Deploy with `image_tag: "sha-xxxxx"` |

### Image Labels

All images include OCI labels for traceability:

```
org.opencontainers.image.environment=staging|production
org.opencontainers.image.source.branch=demo/feature-x
org.opencontainers.image.revision=abc1234567890...
```

---

## Critical Rules

### 1. Never Deploy Staging Images to Production

Build-time variables are baked in. A staging image contains:
- Staging API URLs
- Test Stripe keys
- Staging analytics

**Always rebuild from `release/*` or `hotfix/*` branch for production.**

### 2. Image Tags Indicate Environment

| Tag | Built From | Contains |
|-----|------------|----------|
| `:dev` | `demo/*` branch | Staging secrets |
| `:prod` | `release/*` or `hotfix/*` | Production secrets |
| `:sha-xxxxx` | Any | Matches branch type |
| `:vX.Y.Z` | Versioned release | Production secrets |

### 3. Runtime Secrets Stay on Server

The `.env` file is generated during deployment and contains sensitive runtime secrets. It is:
- ✅ Generated from GitHub secrets
- ✅ Stored with `chmod 600`
- ❌ Never committed to git
- ❌ Never logged in CI output

---

## Troubleshooting

### Wrong API URL in Production

**Symptom**: Production frontend calls staging API.

**Cause**: Deployed a `:dev` tagged image to production.

**Fix**: Rebuild from `release/*` branch and deploy `:prod` image.

### Stripe Payments Fail in Production

**Symptom**: "Invalid API Key" errors.

**Cause**: Build-time `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` has test key.

**Fix**: Ensure production secrets are in `production` GitHub environment.

### Analytics Not Working

**Symptom**: No data in Plausible/GA.

**Cause**: `*_ACTIVATE_ANALYTICS` set to `false` at build time.

**Fix**: Check `staging` environment has `false`, `production` has `true`.

---

## Adding New Variables

### For Build-Time Variables

1. Add to appropriate workflow in `.github/workflows/build.yml`
2. Add to GitHub secrets for both `staging` and `production` environments
3. Update this documentation

### For Runtime Variables

1. Add to `.env` generation in deploy workflows
2. Add to GitHub secrets for both environments
3. Update `infrastructure/*/docker-compose.yml` if needed
4. Update this documentation

---

## See Also

- [Infrastructure Documentation](./INFRASTRUCTURE.md)
- [Build Workflow](.github/workflows/build.yml)
- [Deploy Staging Workflow](.github/workflows/deploy-staging.yml)
- [Deploy Production Workflow](.github/workflows/deploy-production.yml)
