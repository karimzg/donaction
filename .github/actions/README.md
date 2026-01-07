# Composite GitHub Actions

Reusable actions for Donaction CI/CD pipelines.

## Actions Overview

| Action | Description |
|--------|-------------|
| `cleanup-images` | Remove old Docker images from GHCR |
| `deploy-containers` | Backup, pull, migrate, deploy via SSH |
| `docker-build-push` | Build and push images to GHCR |
| `gcc-credentials` | Setup Google Cloud credentials |
| `health-check` | Verify deployed services health |
| `notify` | Send deployment notifications |
| `rollback` | Restore previous deployment from backup |
| `ssh-setup` | Configure SSH connection |
| `validate-secrets` | Verify required secrets exist |

## Usage

```yaml
- uses: ./.github/actions/ssh-setup
  with:
    ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}
    ssh-host: ${{ secrets.SSH_HOST }}
    ssh-user: ${{ secrets.SSH_USER }}

- uses: ./.github/actions/deploy-containers
  with:
    ssh-user: ${{ secrets.SSH_USER }}
    ssh-host: ${{ secrets.SSH_HOST }}
    deploy-dir: /opt/donaction
    image-tag: ${{ github.sha }}
    image-registry: ghcr.io/${{ github.repository }}
```

## Action Details

### ssh-setup
Configures SSH key and validates connection.

**Inputs:**
- `ssh-private-key` (required): SSH private key
- `ssh-host` (required): Target host
- `ssh-user` (required): SSH username
- `ssh-port` (optional, default: 63009): SSH port

### deploy-containers
Performs full deployment with backup and optional migrations.

**Inputs:**
- `ssh-user`, `ssh-host`, `ssh-port`: Connection details
- `deploy-dir` (required): Server deployment path
- `services-list` (optional): Space-separated services to deploy
- `image-tag` (required): Docker tag to deploy
- `image-registry` (required): Docker registry URL
- `run-migrations` (optional, default: false): Run Strapi migrations
- `db-ready-timeout` (optional, default: 60): PostgreSQL ready timeout (seconds)

**Outputs:**
- `deployment-time`: Deployment timestamp

### health-check
Validates all services are healthy after deployment.

**Inputs:**
- `ssh-user`, `ssh-host`, `ssh-port`: Connection details
- `domain` (required): Domain to check
- `check-db` (optional, default: true): Check database connection
- `max-retries` (optional, default: 5): Retry attempts
- `retry-delay` (optional, default: 10): Seconds between retries
- `curl-timeout` (optional, default: 30): HTTP request timeout (seconds)

**Outputs:**
- `service-status`: Comma-separated service statuses
- `status`: Overall success/failure

### rollback
Restores previous deployment from backup.

**⚠️ Limitations:** Only restores docker-compose.yml, .env, and images. Does NOT restore database migrations, nginx config, or external service state. See action file header for details.

**Inputs:**
- `ssh-user`, `ssh-host`, `ssh-port`: Connection details
- `deploy-dir` (required): Server deployment path
- `github-run-id` (required): For logging

### docker-build-push
Builds and pushes Docker images with caching.

**Inputs:**
- `app-name` (required): Application name (api, frontend, admin, saas)
- `app-path` (required): Path to application directory
- `image-registry` (required): Docker registry URL
- `image-tag` (required): Tag to apply
- `registry-token` (required): GHCR authentication token

### notify
Sends deployment status notifications (Slack/Discord/email).

### validate-secrets
Checks that required secrets are defined before deployment.

### cleanup-images
Removes old Docker images from registry to save storage.
