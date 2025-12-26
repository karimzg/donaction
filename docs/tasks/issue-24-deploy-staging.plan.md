# Implementation Plan: US-004 - Workflow Deploy Staging

> **Issue**: [#24](https://github.com/karimzg/donaction/issues/24)
> **Created**: 2025-12-23
> **Branch**: `feat/issue-24`

---

## Summary

Create a manual deployment workflow for staging environment (`re7.donaction.fr`) that:
- Deploys Docker images from GHCR (built by `build.yml`)
- Requires explicit "DEPLOY" confirmation
- Creates runtime .env on server
- Manages nginx configuration
- Performs health checks
- Sends Slack/Discord notifications

---

## Files to Create

| File | Description |
|------|-------------|
| `.github/workflows/deploy-staging.yml` | Main deployment workflow |
| `infrastructure/staging/docker-compose.yml` | Docker Compose for staging |
| `infrastructure/staging/nginx/donaction.conf` | Nginx reverse proxy config |
| `infrastructure/staging/.env.template` | Environment template (no secrets) |

---

## Workflow Features

1. **Trigger**: `workflow_dispatch` with confirmation input
2. **Validation**: Must type "DEPLOY", branch must be `demo/*`, `release/*`, or `hotfix/*`
3. **Environment**: Uses GitHub Environment "staging"
4. **Deployment Steps**:
   - SSH to server
   - Copy docker-compose.yml
   - Generate .env from secrets
   - Pull GHCR images
   - Restart containers
   - Install nginx config
   - Health check
5. **Notifications**: Slack + Discord

---

## Required Secrets

### Repository-Level (existing)
- `SSH_PRIVATE_KEY`
- `SLACK_WEBHOOK_URL`
- `DISCORD_WEBHOOK_URL`

### Staging Environment
- `SSH_HOST`, `SSH_USER`
- `DATABASE_*` (host, port, name, user, password)
- `JWT_SECRET`, `ADMIN_JWT_SECRET`, `APP_KEYS`
- `STRIPE_*` secrets
- `IMAGEKIT_*` secrets
- `BREVO_API_KEY`
- `GOOGLE_RECAPTCHA_SITE_KEY`
- `FRONT_URL`, `KLUBR_UUID`

---

## Staging URLs

- Frontend: https://re7.donaction.fr
- API: https://re7.donaction.fr/service
- Admin: https://re7.donaction.fr/admin

---

## Implementation Steps

1. Create `infrastructure/staging/` directory structure
2. Create docker-compose.yml with 4 services (frontend, api, admin, saas)
3. Create nginx config for reverse proxy
4. Create deploy-staging.yml workflow
5. Test workflow from demo branch

---

## Success Criteria

- [ ] Workflow triggers only from allowed branches
- [ ] "DEPLOY" confirmation enforced
- [ ] .env generated on server
- [ ] Containers restarted with new images
- [ ] Health check passes
- [ ] Notifications sent
