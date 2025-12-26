# GitHub Production Environment Setup

> Configuration manuelle pour le workflow deploy-production

## 1. Créer l'environnement "production"

1. Aller sur **GitHub > Settings > Environments**
2. Cliquer **New environment**
3. Nom : `production`
4. Cliquer **Configure environment**

### 1.1 Protection rules

- [x] **Required reviewers** : Ajouter les reviewers requis
- [x] **Wait timer** : `5` minutes
- [ ] **Prevent self-review** : Optionnel

### 1.2 Deployment branches

- Sélectionner : **Selected branches**
- Ajouter les patterns :
  - `release/*`
  - `hotfix/*`

---

## 2. Configurer les secrets (environment: production)

> ⚠️ Ces secrets sont spécifiques à la PRODUCTION (pas staging)

### SSH Access

| Secret | Valeur |
|--------|--------|
| `SSH_PRIVATE_KEY` | Clé privée SSH pour le serveur prod |
| `SSH_HOST` | IP ou hostname du serveur prod |
| `SSH_USER` | Utilisateur SSH |

### Database

| Secret | Valeur |
|--------|--------|
| `DATABASE_HOST` | Host PostgreSQL prod |
| `DATABASE_PORT` | `5432` |
| `DATABASE_NAME` | Nom de la base prod |
| `DATABASE_USERNAME` | User PostgreSQL |
| `DATABASE_PASSWORD` | Password PostgreSQL |
| `DATABASE_SSL` | `true` |

### Strapi Authentication

| Secret | Valeur |
|--------|--------|
| `JWT_SECRET` | Secret JWT (générer nouveau pour prod) |
| `ADMIN_JWT_SECRET` | Secret JWT admin |
| `APP_KEYS` | Clés app (comma-separated) |
| `API_TOKEN_SALT` | Salt pour API tokens |
| `TRANSFER_TOKEN_SALT` | Salt pour transfer tokens |

### Stripe (LIVE MODE)

| Secret | Valeur |
|--------|--------|
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `STRIPE_PUBLIC_KEY` | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Webhook secret prod |
| `STRIPE_WEBHOOK_SECRET_CONNECT` | Connect webhook secret |

### ImageKit

| Secret | Valeur |
|--------|--------|
| `IMAGEKIT_PUBLIC_KEY` | Public key |
| `IMAGEKIT_PRIVATE_KEY` | Private key |
| `IMAGEKIT_URL_ENDPOINT` | URL endpoint |

### Email (Brevo)

| Secret | Valeur |
|--------|--------|
| `BREVO_API_KEY` | API key Brevo |

### Google Services

| Secret | Valeur |
|--------|--------|
| `GOOGLE_RECAPTCHA_SITE_KEY` | reCAPTCHA site key |
| `GOOGLE_CLIENT_ID` | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret |
| `GOOGLE_MAPS_API_KEY` | Maps API key |
| `GOOGLE_GA_TRACKING_ID` | Analytics tracking ID |

### Application

| Secret | Valeur |
|--------|--------|
| `NEXTAUTH_SECRET` | NextAuth secret (générer nouveau) |
| `STRAPI_FRONT_API_TOKEN` | Token API Strapi pour frontend |
| `KLUBR_UUID` | UUID du Klubr par défaut |
| `FRONT_URL` | `https://www.donaction.fr` |

### Notifications (optionnel)

| Secret | Valeur |
|--------|--------|
| `SLACK_WEBHOOK_URL` | Webhook Slack |
| `DISCORD_WEBHOOK_URL` | Webhook Discord |

---

## 3. Checklist de vérification

- [ ] Environment `production` créé
- [ ] Required reviewers configurés
- [ ] Wait timer de 5 minutes activé
- [ ] Deployment branches limitées à `release/*` et `hotfix/*`
- [ ] Tous les secrets SSH configurés
- [ ] Tous les secrets Database configurés
- [ ] Tous les secrets Strapi configurés
- [ ] Secrets Stripe en mode LIVE
- [ ] Secrets Google configurés
- [ ] Secrets Application configurés

---

## 4. Test

1. Créer une branche `release/v1.0.0`
2. Aller sur **Actions > Deploy to Production**
3. Cliquer **Run workflow**
4. Remplir :
   - Branch : `release/v1.0.0`
   - Confirmation : `DEPLOY-PROD`
   - Version tag : `v1.0.0`
   - Skip staging : `false`
5. Vérifier que le workflow démarre et attend l'approbation
