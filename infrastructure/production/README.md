# Donaction Production Infrastructure

> Documentation for production deployment on `www.donaction.fr`

## Architecture

```
                    ┌─────────────────┐
                    │   Cloudflare    │
                    │   (DNS + CDN)   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │     Nginx       │
                    │  (Reverse Proxy)│
                    │   Port 443/80   │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   Frontend    │   │     API       │   │    Admin      │
│   (Next.js)   │   │   (Strapi)    │   │  (Angular)    │
│   Port 3100   │   │   Port 1537   │   │   Port 4300   │
└───────────────┘   └───────────────┘   └───────────────┘
                             │
                    ┌────────▼────────┐
                    │   PostgreSQL    │
                    │   (Database)    │
                    └─────────────────┘
```

## URLs

| Service | URL |
|---------|-----|
| Frontend | https://www.donaction.fr |
| Redirect | https://donaction.fr → https://www.donaction.fr |
| API | https://www.donaction.fr/service |
| Admin | https://www.donaction.fr/admin |
| SaaS | https://www.donaction.fr/saas |

## Prerequisites

### Server Requirements

- Ubuntu 22.04 LTS or later
- Docker Engine 24+
- Docker Compose v2
- Nginx
- Certbot (Let's Encrypt)
- 4GB RAM minimum
- 20GB disk space

### Initial Server Setup

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose v2
sudo apt install docker-compose-plugin

# Install Nginx
sudo apt install nginx

# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Create deployment directory
mkdir -p ~/donaction-production/{nginx,backups,logs}
```

### SSL Certificate Setup

```bash
# Generate certificate for production domain
sudo certbot certonly --nginx -d www.donaction.fr -d donaction.fr

# Verify auto-renewal
sudo certbot renew --dry-run
```

## GitHub Secrets Required

Configure these in GitHub repository settings under **Settings > Environments > production**:

### SSH Access
| Secret | Description |
|--------|-------------|
| `SSH_PRIVATE_KEY` | Private key for SSH access to production server |
| `SSH_HOST` | Production server IP/hostname |
| `SSH_USER` | SSH username |

### Database
| Secret | Description |
|--------|-------------|
| `DATABASE_HOST` | PostgreSQL host |
| `DATABASE_PORT` | PostgreSQL port (default: 5432) |
| `DATABASE_NAME` | Database name |
| `DATABASE_USERNAME` | Database user |
| `DATABASE_PASSWORD` | Database password |
| `DATABASE_SSL` | Enable SSL (true/false) |

### Strapi Authentication
| Secret | Description |
|--------|-------------|
| `JWT_SECRET` | JWT signing secret |
| `ADMIN_JWT_SECRET` | Admin panel JWT secret |
| `APP_KEYS` | Application keys (comma-separated) |
| `API_TOKEN_SALT` | API token salt |
| `TRANSFER_TOKEN_SALT` | Transfer token salt |

### External Services
| Secret | Description |
|--------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key (live) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |
| `STRIPE_WEBHOOK_SECRET_CONNECT` | Stripe Connect webhook secret |
| `STRIPE_PUBLIC_KEY` | Stripe publishable key (live) |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint |
| `BREVO_API_KEY` | Brevo (Sendinblue) API key |

### Google Services
| Secret | Description |
|--------|-------------|
| `GOOGLE_RECAPTCHA_SITE_KEY` | reCAPTCHA site key |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key |
| `GOOGLE_GA_TRACKING_ID` | Google Analytics tracking ID |

### Application
| Secret | Description |
|--------|-------------|
| `NEXTAUTH_SECRET` | NextAuth.js secret |
| `STRAPI_FRONT_API_TOKEN` | Strapi API token for frontend |
| `KLUBR_UUID` | Default Klubr UUID |
| `FRONT_URL` | Frontend URL (https://www.donaction.fr) |

### Notifications (Optional)
| Secret | Description |
|--------|-------------|
| `SLACK_WEBHOOK_URL` | Slack webhook for notifications |
| `DISCORD_WEBHOOK_URL` | Discord webhook for notifications |

## Deployment

### Automated (Recommended)

1. Create a release branch: `git checkout -b release/v1.0.0`
2. Push to GitHub
3. Go to **Actions > Deploy to Production**
4. Click **Run workflow**
5. Enter:
   - Confirmation: `DEPLOY-PROD`
   - Version tag: `v1.0.0`
   - Skip staging: `false` (default)
6. Wait for approval (5 min timer + reviewers)
7. Monitor deployment

### Manual (Emergency Only)

```bash
# SSH to production server
ssh user@production-server

# Navigate to deployment directory
cd ~/donaction-production

# Pull latest images
export IMAGE_TAG=release/v1.0.0
docker compose pull

# Deploy
docker compose down
docker compose up -d

# Check status
docker compose ps
docker compose logs -f
```

## Rollback Procedure

### Automatic Rollback

The workflow automatically rolls back if health checks fail after deployment.

### Manual Rollback

```bash
cd ~/donaction-production

# List available backups
ls -la backups/

# Restore previous docker-compose
cp backups/docker-compose-YYYYMMDD-HHMMSS.yml docker-compose.yml

# Restore previous .env
cp backups/.env-YYYYMMDD-HHMMSS .env

# Pull previous images and redeploy
docker compose pull
docker compose down
docker compose up -d

# Verify
docker compose ps
```

## Monitoring

### Container Status

```bash
docker compose ps
docker compose logs --tail=100 -f
```

### Health Checks

```bash
# Nginx health
curl -I https://www.donaction.fr/health

# API health
curl https://www.donaction.fr/service/health

# Container health
docker inspect --format='{{.State.Health.Status}}' donaction_api
```

### Logs

```bash
# All containers
docker compose logs -f

# Specific container
docker compose logs -f api

# Deployment history
cat ~/donaction-production/logs/deployments.log
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose logs api

# Check resources
docker stats

# Verify environment
docker compose config
```

### Database Connection Issues

```bash
# Test from API container
docker exec -it donaction_api sh
wget -qO- http://localhost:1437/health
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check error log
sudo tail -f /var/log/nginx/error.log

# Reload configuration
sudo systemctl reload nginx
```

### SSL Certificate Issues

```bash
# Check certificate expiry
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal

# Reload nginx after renewal
sudo systemctl reload nginx
```

## Security Considerations

1. **Never commit `.env` files** - All secrets are injected via GitHub Actions
2. **SSH keys** - Use dedicated deploy keys, not personal keys
3. **Firewall** - Only ports 80, 443, and 22 should be open
4. **Updates** - Regularly update server packages and Docker images
5. **Backups** - Database backups should be configured separately
6. **Monitoring** - Set up uptime monitoring (UptimeRobot, Pingdom, etc.)

## Differences from Staging

| Aspect | Staging | Production |
|--------|---------|------------|
| Domain | re7.donaction.fr | www.donaction.fr |
| Environment | `re7` | `prod` |
| HSTS | No | Yes (1 year) |
| Analytics | Disabled | Enabled |
| Stripe | Test mode | Live mode |
| Reviewers | None | Required |
| Wait timer | None | 5 minutes |

## Contact

For production issues, contact the DevOps team or create an issue in the repository.
