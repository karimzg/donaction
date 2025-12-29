# Plan Technique: US-005 Deploy Production Workflow

> **Issue**: #25
> **Epic**: #20
> **Dépendance**: #24 (staging workflow)

## Objectif

Créer un workflow de déploiement manuel vers production avec validation, basé sur le workflow staging existant.

## Fichiers à Créer

### 1. `.github/workflows/deploy-production.yml`

**Structure des jobs** :

```
validate → deploy-staging → validate-staging → deploy-production → post-deploy → notify
              (skip si skip_staging=true)
```

**Inputs** :
- `confirmation`: string - doit être "DEPLOY-PROD"
- `skip_staging`: boolean - pour hotfix urgents (défaut: false)
- `version_tag`: string - tag sémantique (ex: v1.2.3)
- `apps`: string - services à déployer (défaut: "all")

**Jobs** :

1. **validate**
   - Vérifier confirmation = "DEPLOY-PROD"
   - Vérifier branche = `release/*` ou `hotfix/*`
   - Valider secrets requis
   - Déterminer apps à déployer

2. **deploy-staging** (si skip_staging=false)
   - Appeler workflow `deploy-staging.yml` via `workflow_call`
   - Passer les mêmes apps

3. **validate-staging** (si skip_staging=false)
   - Health check sur `re7.donaction.fr`
   - Attendre confirmation manuelle (environment reviewers)

4. **deploy-production**
   - Environment: `production` (required reviewers + 5min wait)
   - SSH vers serveur prod
   - Copier docker-compose.yml et nginx config
   - Générer .env depuis secrets
   - Pull images + deploy containers
   - Health check avec 5 retries
   - Rollback automatique si échec

5. **post-deploy**
   - Merge branche vers `main`
   - Créer tag `vX.Y.Z`
   - Push tag

6. **notify**
   - Slack + Discord
   - Résumé déploiement

**Environment variables** :
```yaml
PROD_DOMAIN: www.donaction.fr
PROD_ENV: prod
```

### 2. `infrastructure/production/docker-compose.yml`

Basé sur staging avec :
- Ports différents : `3000:3000`, `4200:80`, `1437:1437`, `5000:80`
- Container names : `donaction_prod_frontend`, etc.
- Même structure de services

### 3. `infrastructure/production/nginx/donaction.conf`

Configuration nginx pour :
- `www.donaction.fr` (principal)
- `donaction.fr` → redirect vers `www.donaction.fr`
- SSL via Let's Encrypt
- Mêmes locations : `/`, `/service`, `/admin`, `/saas`

### 4. `infrastructure/production/env.template`

Template des variables d'environnement :
- URLs pointant vers `www.donaction.fr`
- Même structure que staging

### 5. `infrastructure/production/README.md`

Documentation :
- Prérequis serveur
- Liste des secrets GitHub
- Procédure de rollback manuel
- Troubleshooting

## Différences Clés vs Staging

| Aspect | Staging | Production |
|--------|---------|------------|
| Domaine | `re7.donaction.fr` | `www.donaction.fr` |
| Confirmation | `DEPLOY` | `DEPLOY-PROD` |
| Branches | `demo/*`, `release/*`, `hotfix/*` | `release/*`, `hotfix/*` |
| Environment GitHub | `staging` | `production` + reviewers + wait 5min |
| SSH_HOST | VPS staging | VPS production (différent) |
| Pré-deploy | - | Deploy staging (optionnel) |
| Post-deploy | - | Merge main + tag |
| Ports | 3100, 4300, 1537, 5100 | 3100, 4300, 1537, 5100 (identiques) |

> **Note**: Les VPS staging et production sont séparés, donc les mêmes ports peuvent être utilisés.

## Secrets GitHub Requis (environment: production)

### SSH
- `SSH_PRIVATE_KEY`
- `SSH_HOST`
- `SSH_USER`

### Database
- `DATABASE_HOST`
- `DATABASE_PORT`
- `DATABASE_NAME`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- `DATABASE_SSL`

### Strapi Auth
- `JWT_SECRET`
- `ADMIN_JWT_SECRET`
- `APP_KEYS`
- `API_TOKEN_SALT`
- `TRANSFER_TOKEN_SALT`

### Services Externes
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_WEBHOOK_SECRET_CONNECT`
- `STRIPE_PUBLIC_KEY`
- `IMAGEKIT_PUBLIC_KEY`
- `IMAGEKIT_PRIVATE_KEY`
- `IMAGEKIT_URL_ENDPOINT`
- `BREVO_API_KEY`

### Google
- `GOOGLE_RECAPTCHA_SITE_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_MAPS_API_KEY`
- `GOOGLE_GA_TRACKING_ID`

### Application
- `NEXTAUTH_SECRET`
- `STRAPI_FRONT_API_TOKEN`
- `KLUBR_UUID`
- `FRONT_URL`

### Notifications (optionnel)
- `SLACK_WEBHOOK_URL`
- `DISCORD_WEBHOOK_URL`

## Flow de Déploiement

```
1. Trigger manuel depuis release/* ou hotfix/*
   ↓
2. Validation (confirmation + branch + secrets)
   ↓
3. [Si skip_staging=false] Deploy staging
   ↓
4. [Si skip_staging=false] Validate staging health
   ↓
5. Wait for reviewers approval (5 min timer)
   ↓
6. Deploy production
   - Backup current state
   - Pull new images
   - Deploy containers
   - Health check (5 retries)
   - [Si échec] Rollback automatique
   ↓
7. Post-deploy
   - Merge to main
   - Create & push tag vX.Y.Z
   ↓
8. Notifications Slack/Discord
```

## Critères d'Acceptation

- [x] Plan technique créé
- [ ] Workflow `.github/workflows/deploy-production.yml`
- [ ] Déclenchement manuel avec "DEPLOY-PROD"
- [ ] Option `skip_staging` boolean
- [ ] Branches `release/*`, `hotfix/*` uniquement
- [ ] Environment GitHub "production" avec reviewers
- [ ] Wait timer 5 minutes
- [ ] Deploy staging FIRST (sauf skip)
- [ ] Validation staging avant prod
- [ ] Deploy production après approval
- [ ] Health check avec retry
- [ ] Auto-merge vers main
- [ ] Tag vX.Y.Z automatique
- [ ] Notifications Slack + Discord
