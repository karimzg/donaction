# Infrastructure & Deployment

> **Last Updated**: 2025-12-24

## Environments

| Environment | Domain           | VPS | Branch |
|-------------|------------------|-----|--------|
| Staging | re7.donaction.fr | Staging VPS | Any branch |
| Production | www.donaction.fr | Production VPS | release/*, hotfix/* |

## Docker Compose Patterns

### Zero-Downtime Deployments
- Never: `docker compose down && docker compose up`
- Always: `docker compose up -d --wait --wait-timeout 120 --remove-orphans`

### Container Readiness
- Never: `sleep 30` (fixed wait)
- Always: `docker compose up -d --wait --wait-timeout 120`

### Image Registry
- Never: Hardcode username `ghcr.io/karimzg/...`
- Always: Use variable `${IMAGE_REGISTRY:-ghcr.io/owner}`

## Nginx Patterns

### Reload Timing
- Reload nginx BEFORE health checks that use nginx endpoints
- Test config with `nginx -t` before reload

## Health Checks

### Dual Approach
1. **Container healthcheck**: Validates internal service (port 1437)
2. **Workflow healthcheck**: Validates full stack through nginx (https://domain/health)

### Per-Service Tracking
```bash
SERVICE_STATUS="api:ok,frontend:ok,admin:ok,saas:ok"
```

## Pre-Flight Checks

Before deployment, validate:
- [ ] Disk space (minimum 5GB)
- [ ] SSL certificates exist
- [ ] Ports available
- [ ] Docker Compose v2 installed

## Rollback

- Automatic rollback on health check failure
- Keep last 5 backups (docker-compose.yml, .env)
- Always notify on rollback (Slack/Discord)

## Semantic Versioning

Extract version from branch name:
- `release/v1.2.3` -> Docker tag `v1.2.3`
- `hotfix/v1.2.4` -> Docker tag `v1.2.4`

## Notifications

Include per-service status:
```
Api Frontend Admin Saas
```

## Files

| File | Purpose |
|------|---------|
| `.github/workflows/build.yml` | Build & push Docker images |
| `.github/workflows/deploy-staging.yml` | Deploy to staging |
| `.github/workflows/deploy-production.yml` | Deploy to production |
| `infrastructure/staging/` | Staging config (docker-compose, nginx) |
| `infrastructure/production/` | Production config (docker-compose, nginx) |
