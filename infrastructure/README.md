# Infrastructure Documentation

> **Last Updated**: 2025-12-26

## Directory Structure

```
infrastructure/
├── production/           # Production environment configs
│   ├── docker-compose.yml
│   ├── nginx/
│   │   └── donaction.conf
│   └── env.template
├── staging/              # Staging environment configs
│   ├── docker-compose.yml
│   ├── nginx/
│   │   └── donaction.conf
│   └── env.template
├── scripts/              # Infrastructure scripts
│   └── setup-ssl.sh      # SSL certificate setup
└── README.md             # This file
```

## SSL Certificates

### Initial Setup

Run the SSL setup script on each server:

```bash
# Staging server (re7.donaction.fr)
sudo ./scripts/setup-ssl.sh staging

# Production server (www.donaction.fr)
sudo ./scripts/setup-ssl.sh production
```

**Prerequisites:**
- Nginx installed and running
- Domains pointing to server IP
- Port 80 accessible (for ACME challenge)

### Certificate Locations

| Environment | Certificate Path |
|-------------|------------------|
| Production | `/etc/letsencrypt/live/www.donaction.fr/` |
| Staging | `/etc/letsencrypt/live/re7.donaction.fr/` |

### Auto-Renewal

Certificates auto-renew via cron (runs twice daily at 00:00 and 12:00):

```bash
# View cron job
cat /etc/cron.d/certbot-renew

# View renewal logs
tail -f /var/log/certbot-renew.log
```

### Manual Renewal

```bash
# Check certificate status
sudo certbot certificates

# Test renewal (dry-run)
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal

# Renew and reload nginx
sudo certbot renew && sudo systemctl reload nginx
```

### Troubleshooting

**Certificate not found:**
```bash
# Verify certificate exists
ls -la /etc/letsencrypt/live/

# Re-run setup
sudo ./scripts/setup-ssl.sh [staging|production]
```

**Renewal failing:**
```bash
# Check ACME challenge location
curl -I http://yourdomain.com/.well-known/acme-challenge/test

# Verify webroot exists
ls -la /var/www/certbot/

# Check nginx config
sudo nginx -t
```

**Port 80 blocked:**
- Ensure firewall allows port 80
- ACME challenge requires HTTP access

## PostgreSQL Backup & Restore

### Manual Backup

```bash
# Run backup script (from VPS)
cd ~/donaction-staging  # or ~/donaction-production
./scripts/backup-postgres.sh ./backups/postgres

# Or directly with docker
docker exec donaction_postgres pg_dump -U $DATABASE_USERNAME -d $DATABASE_NAME | gzip > backup.sql.gz
```

### Restore from Backup

```bash
# Stop API to prevent connections
docker compose stop api

# Restore database
gunzip -c backup.sql.gz | docker exec -i donaction_postgres psql -U $DATABASE_USERNAME -d $DATABASE_NAME

# Restart API
docker compose start api
```

### Automated Backups

Set up cron job on VPS:

```bash
# Daily backup at 2:00 AM
echo "0 2 * * * cd ~/donaction-production && ./scripts/backup-postgres.sh ./backups/postgres >> ./logs/backup.log 2>&1" | crontab -
```

### Backup Retention

- Backups older than 7 days are automatically deleted
- Store backups: `~/donaction-{staging|production}/backups/postgres/`

## Deployment

See `.github/workflows/` for CI/CD deployment workflows:
- `deploy-staging.yml` - Deploy to staging
- `deploy-production.yml` - Deploy to production

## Environments

| Environment | Domain | VPS |
|-------------|--------|-----|
| Staging | re7.donaction.fr | Staging server |
| Production | www.donaction.fr | Production server |
