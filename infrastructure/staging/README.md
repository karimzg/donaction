# Donaction Staging Infrastructure

Staging environment deployment for `re7.donaction.fr`.

## Overview

| Component | Host Port | Container Port | URL |
|-----------|-----------|----------------|-----|
| Frontend (Next.js) | 3100 | 3000 | https://re7.donaction.fr |
| API (Strapi) | 1537 | 1437 | https://re7.donaction.fr/service |
| Admin (Angular) | 4300 | 80 | https://re7.donaction.fr/admin |
| SaaS (Svelte) | 5100 | 80 | https://re7.donaction.fr/saas |

> **Note**: Host ports (3100, 1537, 4300, 5100) avoid conflicts with existing Klubr application on shared VPS.

## Files

```
infrastructure/staging/
├── docker-compose.yml    # Container orchestration
├── nginx/
│   └── donaction.conf    # Reverse proxy config
├── env.template          # Environment variables template
└── README.md             # This file
```

---

## Initial Server Setup

### Prerequisites

- Ubuntu 22.04+ server
- Docker and Docker Compose installed
- Nginx installed
- Let's Encrypt SSL certificate

### 1. Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

### 2. Install Nginx

```bash
sudo apt update
sudo apt install -y nginx
sudo systemctl enable nginx
```

### 3. Configure SSL with Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot certonly --nginx -d re7.donaction.fr

# Verify auto-renewal
sudo certbot renew --dry-run
```

### 4. Create Deployment Directory

```bash
mkdir -p ~/donaction-staging/{nginx,backups,logs}
```

### 5. Configure GitHub Secrets

In GitHub repository → Settings → Environments → Create "staging":

**Required Secrets:**
| Secret | Description |
|--------|-------------|
| `SSH_HOST` | Server IP or hostname |
| `SSH_USER` | SSH username |
| `SSH_PRIVATE_KEY` | SSH private key for authentication |
| `DATABASE_HOST` | PostgreSQL host |
| `DATABASE_PORT` | PostgreSQL port (5432) |
| `DATABASE_NAME` | Database name |
| `DATABASE_USERNAME` | Database user |
| `DATABASE_PASSWORD` | Database password |
| `JWT_SECRET` | Strapi JWT secret |
| `ADMIN_JWT_SECRET` | Strapi admin JWT secret |
| `APP_KEYS` | Strapi app keys |
| `API_TOKEN_SALT` | Strapi API token salt |
| `TRANSFER_TOKEN_SALT` | Strapi transfer token salt |
| `STRIPE_SECRET_KEY` | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |
| `STRIPE_WEBHOOK_SECRET_CONNECT` | Stripe Connect webhook secret |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint |
| `BREVO_API_KEY` | Brevo (email) API key |
| `GOOGLE_RECAPTCHA_SITE_KEY` | reCAPTCHA site key |
| `FRONT_URL` | Frontend URL |
| `NEXTAUTH_SECRET` | NextAuth secret |
| `KLUBR_UUID` | Klubr UUID |

**Optional Secrets:**
| Secret | Description |
|--------|-------------|
| `SLACK_WEBHOOK_URL` | Slack notifications |
| `DISCORD_WEBHOOK_URL` | Discord notifications |

---

## Deployment

### Via GitHub Actions

1. Go to Actions → "Deploy to Staging"
2. Click "Run workflow"
3. Select branch (must be `demo/*`, `release/*`, or `hotfix/*`)
4. Type `DEPLOY` to confirm
5. Optionally specify apps (e.g., `frontend,api` or `all`)

### Manual Deployment (Emergency)

```bash
# SSH to server
ssh user@re7.donaction.fr

# Navigate to deployment directory
cd ~/donaction-staging

# Pull latest images
docker compose pull

# Restart services
docker compose down
docker compose up -d

# Check status
docker compose ps
docker compose logs -f
```

---

## Troubleshooting

### Container Issues

#### Containers not starting
```bash
# Check container status
docker compose ps

# View logs
docker compose logs api
docker compose logs frontend

# Check resource usage
docker stats
```

#### API container unhealthy
```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' donaction_api

# View health check logs
docker inspect --format='{{json .State.Health}}' donaction_api | jq

# Check API logs
docker compose logs api --tail=100
```

#### Out of memory
```bash
# Check memory usage
free -h
docker system df

# Clean up unused images
docker system prune -af
```

### Network Issues

#### Port conflicts
```bash
# Check what's using a port
sudo lsof -i :3100  # Frontend
sudo lsof -i :1537  # API
sudo lsof -i :4300  # Admin
sudo lsof -i :5100  # SaaS

# Or check all staging ports
sudo netstat -tlnp | grep -E '3100|1537|4300|5100'

# Kill conflicting process
sudo kill -9 <PID>
```

#### Nginx errors
```bash
# Test nginx config
sudo nginx -t

# View nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart nginx
sudo systemctl restart nginx
```

### SSL Certificate Issues

#### Certificate expired
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Force renewal
sudo certbot renew --force-renewal
```

#### SSL handshake errors
```bash
# Test SSL
openssl s_client -connect re7.donaction.fr:443 -servername re7.donaction.fr

# Check certificate dates
echo | openssl s_client -connect re7.donaction.fr:443 2>/dev/null | openssl x509 -noout -dates
```

### Database Issues

#### Cannot connect to database
```bash
# Test from API container
docker exec donaction_api wget -qO- http://localhost:1437/health

# Check .env file
cat ~/donaction-staging/.env | grep DATABASE
```

### Rollback

#### Automatic (during failed deployment)
The workflow automatically rolls back if health checks fail after deployment.

#### Manual rollback
```bash
cd ~/donaction-staging

# List available backups (sorted by date)
ls -lt backups/

# Identify the backup timestamp (e.g., 20241224-143000)
TIMESTAMP=YYYYMMDD-HHMMSS

# Restore docker-compose.yml
cp backups/docker-compose-${TIMESTAMP}.yml docker-compose.yml

# Restore .env file if available
if [ -f backups/.env-${TIMESTAMP} ]; then
  cp backups/.env-${TIMESTAMP} .env
  chmod 600 .env
  echo "✓ .env restored"
else
  echo "⚠ No .env backup found for this timestamp"
fi

# Pull previous images (important!)
docker compose pull

# Restart with previous config
docker compose down --remove-orphans
docker compose up -d

# Verify rollback
docker compose ps
docker compose logs -f --tail=50
```

**Testing the rollback:**
```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' donaction_api

# Test endpoints
curl -I https://re7.donaction.fr/health
curl https://re7.donaction.fr/service/health
```

### View Deployment History

```bash
# View deployment log
cat ~/donaction-staging/logs/deployments.log

# Last 10 deployments
tail -100 ~/donaction-staging/logs/deployments.log
```

---

## Monitoring

### Health Checks

```bash
# Nginx health
curl -I https://re7.donaction.fr/health

# API health
curl https://re7.donaction.fr/service/health

# All containers
docker compose ps
```

### Logs

```bash
# All logs
docker compose logs -f

# Specific service
docker compose logs -f api

# Last 100 lines
docker compose logs --tail=100
```

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
df -h
docker system df
```

---

## Maintenance

### Update Images

Triggered automatically by the build workflow when pushing to main/develop.

### Clean Up

```bash
# Remove old images (done automatically, but can be run manually)
docker image prune -af --filter "until=48h"

# Remove all unused resources
docker system prune -af
```

### Backup Database

```bash
# From server with database access
pg_dump -h $DATABASE_HOST -U $DATABASE_USERNAME $DATABASE_NAME > backup.sql
```

---

## Security Notes

- SSH keys are cleaned up after each deployment
- Docker registry credentials are logged out after deployment
- .env file has 600 permissions (owner read/write only)
- Secrets are never logged (masked by GitHub Actions)
