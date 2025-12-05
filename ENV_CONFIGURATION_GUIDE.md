# Guide de Configuration des Variables d'Environnement - Donaction

Ce guide liste toutes les variables d'environnement à configurer pour le projet Donaction.

## 📋 Variables Racine (.env)

```bash
# Project Configuration
PROJECT_SLUG=donaction
ENVIRONMENT=development  # ou production, re7

# Database PostgreSQL
DATABASE_CLIENT=postgres
DATABASE_HOST=donaction_postgres_v5
DATABASE_NAME=donaction_db
DATABASE_USERNAME=donaction_user
DATABASE_PASSWORD=<GENERATE_SECURE_PASSWORD>
DATABASE_PORT=5432

# PgAdmin
PGADMIN_DEFAULT_EMAIL=admin@donaction.local
PGADMIN_DEFAULT_PASSWORD=<GENERATE_SECURE_PASSWORD>
PGADMIN_PORT=5150
```

---

## 🎨 Frontend (donaction-frontend/.env)

### Variables Communes

```bash
# URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3100
NEXT_PUBLIC_API_URL=http://localhost:1437/api
NEXT_PUBLIC_SERVER_COMPONENTS_DEV_API_URL=http://donactionapi:1337/api

# Strapi API Token (API-level authentication)
NEXT_PUBLIC_STRAPI_API_TOKEN=<TO_GENERATE_IN_STRAPI_ADMIN>

# NextAuth
NEXTAUTH_URL=http://localhost:3100
NEXTAUTH_SECRET=<GENERATE_WITH: openssl rand -base64 32>

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<CREATE_NEW_IN_GOOGLE_CLOUD_CONSOLE>
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=<FROM_GOOGLE_CLOUD_CONSOLE>

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<CREATE_NEW_IN_GOOGLE_CLOUD_CONSOLE>

# Google reCAPTCHA Enterprise
NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY=<CREATE_NEW_IN_GOOGLE_CLOUD_CONSOLE>

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<CREATE_NEW_STRIPE_ACCOUNT>
STRIPE_SECRET_KEY=<FROM_STRIPE_DASHBOARD>

# Analytics
NEXT_PUBLIC_ACTIVATE_ANALYTICS=false
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=donaction.nakaa.fr
```

### Variables Spécifiques Environnement

**donaction-frontend/.env.prod**:
```bash
NEXT_PUBLIC_SITE_URL=https://donaction.nakaa.fr
NEXT_PUBLIC_API_URL=https://donaction.nakaa.fr/service/api
NEXTAUTH_URL=https://donaction.nakaa.fr
NEXT_PUBLIC_ACTIVATE_ANALYTICS=true
```

**donaction-frontend/.env.re7**:
```bash
NEXT_PUBLIC_SITE_URL=https://re7-donaction.nakaa.fr
NEXT_PUBLIC_API_URL=https://re7-donaction.nakaa.fr/service/api
NEXTAUTH_URL=https://re7-donaction.nakaa.fr
```

---

## ⚙️ API Backend (donaction-api/.env)

### Variables Communes

```bash
# Strapi Configuration
HOST=0.0.0.0
PORT=1337
APP_KEYS=<GENERATE_MULTIPLE_WITH: openssl rand -base64 32>
API_TOKEN_SALT=<GENERATE_WITH: openssl rand -base64 16>
ADMIN_JWT_SECRET=<GENERATE_WITH: openssl rand -base64 32>
TRANSFER_TOKEN_SALT=<GENERATE_WITH: openssl rand -base64 16>
JWT_SECRET=<GENERATE_WITH: openssl rand -base64 32>

# Database (same as root)
DATABASE_CLIENT=postgres
DATABASE_HOST=donaction_postgres_v5
DATABASE_PORT=5432
DATABASE_NAME=donaction_db
DATABASE_USERNAME=donaction_user
DATABASE_PASSWORD=<SAME_AS_ROOT_ENV>
DATABASE_SSL=false

# URLs
CLIENT_URL=http://localhost:3100
STRAPI_ADMIN_CLIENT_URL=http://localhost:1437
STRAPI_ADMIN_CLIENT_PREVIEW_SECRET=<GENERATE_SECURE_STRING>

# Stripe
STRIPE_SECRET_KEY=<CREATE_NEW_STRIPE_ACCOUNT>
STRIPE_WEBHOOK_SECRET=<FROM_STRIPE_WEBHOOK_SETUP>

# ImageKit CDN (⚠️ REQUIRES NEW ACCOUNT)
IMAGEKIT_PUBLIC_KEY=<CREATE_ACCOUNT_AT_https://imagekit.io>
IMAGEKIT_PRIVATE_KEY=<FROM_IMAGEKIT_DASHBOARD>
IMAGEKIT_URL_ENDPOINT=<FROM_IMAGEKIT_DASHBOARD>

# Email Provider - Brevo (⚠️ REQUIRES NEW ACCOUNT)
MAIL_EMAIL_ADDRESS_FROM=noreply@donaction.nakaa.fr
MAIL_EMAIL_NAME_FROM=Donaction
MAIL_DEFAULT_REPLYTO=contact@donaction.nakaa.fr
MAIL_PROVIDER=nodemailer
MAIL_PROVIDER_SMTP_HOST=smtp-relay.brevo.com
MAIL_PROVIDER_SMTP_PORT=587
MAIL_PROVIDER_SMTP_USERNAME=<CREATE_ACCOUNT_AT_https://brevo.com>
MAIL_PROVIDER_SMTP_PASSWORD=<FROM_BREVO_SMTP_SETTINGS>
BREVO_API_KEY=<FROM_BREVO_API_KEYS>

# Google Cloud Console (⚠️ REQUIRES NEW PROJECT)
GOOGLE_CLIENT_ID=<CREATE_NEW_OAUTH_CLIENT>
GOOGLE_CLIENT_SECRET=<FROM_GOOGLE_CLOUD_CONSOLE>
GOOGLE_CALLBACK_URL=http://localhost:1437/api/auth/google/callback
GOOGLE_MAPS_API_KEY=<ENABLE_PLACES_API>
GCC_PROJECT_ID=<YOUR_GCP_PROJECT_ID>
GCC_PROJECT_KEY=<SERVICE_ACCOUNT_JSON_KEY>
```

### Variables Spécifiques Environnement

**donaction-api/.env.development**:
```bash
NODE_ENV=development
CLIENT_URL=http://localhost:3100
STRAPI_ADMIN_CLIENT_URL=http://localhost:1437
```

**donaction-api/.env.prod**:
```bash
NODE_ENV=production
CLIENT_URL=https://donaction.nakaa.fr
STRAPI_ADMIN_CLIENT_URL=https://donaction.nakaa.fr/service
GOOGLE_CALLBACK_URL=https://donaction.nakaa.fr/service/api/auth/google/callback
```

**donaction-api/.env.re7**:
```bash
NODE_ENV=staging
CLIENT_URL=https://re7-donaction.nakaa.fr
STRAPI_ADMIN_CLIENT_URL=https://re7-donaction.nakaa.fr/service
GOOGLE_CALLBACK_URL=https://re7-donaction.nakaa.fr/service/api/auth/google/callback
```

---

## 🖥️ Admin Dashboard (donaction-admin/.env)

```bash
# API URLs
API_URL=http://localhost:1437/api
NEXT_JS_URL=http://localhost:3100

# Strapi API Token (API-level authentication)
API_TOKEN_V1=<TO_GENERATE_IN_STRAPI_ADMIN>

# Google OAuth
GOOGLE_CLIENT_ID=<SAME_AS_FRONTEND>

# Google Maps
GOOGLE_MAPS_API_KEY=<SAME_AS_FRONTEND>

# Google reCAPTCHA
ANGULAR_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY=<SAME_AS_FRONTEND>

# Environment Flag
PWA_ENABLED=true
```

---

## 🎛️ Web Components (donaction-saas/.env)

```bash
# API Configuration
VITE_API_HOST=http://localhost:1437/api

# Google Services
VITE_GOOGLE_MAPS_KEY=<SAME_AS_FRONTEND>
VITE_GOOGLE_RECAPTCHA_SITE_KEY=<SAME_AS_FRONTEND>

# Stripe
VITE_STRIPE_PK=<SAME_AS_FRONTEND_PUBLISHABLE_KEY>

# Analytics
VITE_ACTIVATE_ANALYTICS=false
VITE_PLAUSIBLE_DOMAIN=donaction.nakaa.fr
```

**donaction-saas/.env.prod**:
```bash
VITE_API_HOST=https://donaction.nakaa.fr/service/api
VITE_ACTIVATE_ANALYTICS=true
```

**donaction-saas/.env.re7**:
```bash
VITE_API_HOST=https://re7-donaction.nakaa.fr/service/api
```

---

## 🔐 Génération de Secrets Sécurisés

### Méthode 1 : OpenSSL (Recommandé)
```bash
# Pour JWT_SECRET, NEXTAUTH_SECRET, etc (32 bytes)
openssl rand -base64 32

# Pour API_TOKEN_SALT, TRANSFER_TOKEN_SALT (16 bytes)
openssl rand -base64 16

# Pour APP_KEYS (générer 4 clés séparées par des virgules)
echo "$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32)"
```

### Méthode 2 : Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🌐 Services Externes à Configurer

### ⚠️ Services Nécessitant de Nouveaux Comptes

| Service | URL | Configuration Requise |
|---------|-----|----------------------|
| **ImageKit** | https://imagekit.io | Nouveau compte, obtenir Public/Private keys |
| **Brevo (Sendinblue)** | https://brevo.com | Compte SMTP + API key |
| **Stripe** | https://stripe.com | Nouveau compte ou projet séparé |
| **Google Cloud Platform** | https://console.cloud.google.com | Nouveau projet avec OAuth 2.0, Maps API, reCAPTCHA Enterprise |

### Google Cloud Platform - APIs à Activer

1. **OAuth 2.0 Client**:
   - Créer un nouveau client OAuth 2.0
   - Authorized redirect URIs:
     - `http://localhost:3100/api/auth/callback/google`
     - `http://localhost:1437/api/auth/google/callback`
     - `https://donaction.nakaa.fr/api/auth/callback/google`
     - `https://donaction.nakaa.fr/service/api/auth/google/callback`

2. **Google Maps JavaScript API**:
   - Activer "Maps JavaScript API"
   - Activer "Places API"
   - Créer une clé API avec restrictions de domaine

3. **reCAPTCHA Enterprise**:
   - Créer une nouvelle clé de site (type: website)
   - Domaines autorisés: `localhost`, `donaction.nakaa.fr`

4. **Service Account** (pour GCC):
   - Créer un compte de service
   - Télécharger la clé JSON
   - Activer "Cloud Resource Manager API"

### Stripe Configuration

1. Créer un nouveau compte ou projet "Donaction"
2. Obtenir les clés API (publishable & secret)
3. Configurer un webhook endpoint:
   - URL: `https://donaction.nakaa.fr/service/api/klub-don-payments/stripe-web-hooks`
   - Événements à écouter: `payment_intent.succeeded`, `payment_intent.failed`
4. Copier le webhook secret

### ImageKit Configuration

1. Créer un compte sur https://imagekit.io
2. Créer un nouveau "Media Library"
3. Noter:
   - Public Key
   - Private Key
   - URL Endpoint
4. Configurer les dossiers:
   - `/avatars/`
   - `/profile-media/`
   - `/klubr-documents/`

### Brevo (Email) Configuration

1. Créer un compte sur https://brevo.com
2. Aller dans SMTP & API > SMTP
3. Créer une clé SMTP
4. Aller dans SMTP & API > API Keys
5. Créer une clé API v3
6. Configurer l'expéditeur vérifié: `noreply@donaction.nakaa.fr`

---

## 📝 GitLab CI/CD Variables

Dans GitLab > Settings > CI/CD > Variables, ajouter :

```
HOST_STG=<STAGING_SERVER_IP>
HOST_PROD=<PRODUCTION_SERVER_IP>
SSH_PRIVATE_KEY=<SSH_KEY_FOR_DEPLOYMENT>
SSH_USER=debian
CI_GITLAB_ACCESS_TOKEN=<GITLAB_TOKEN_WITH_WRITE_ACCESS>
CI_GITLAB_USER_EMAIL=ci@donaction.nakaa.fr
CI_GITLAB_USER_NAME=GitLab CI
DOCKER_AUTH_TOKEN=<BASE64_ENCODED_DOCKER_HUB_AUTH>
```

### Générer DOCKER_AUTH_TOKEN

```bash
echo -n "username:password" | base64
```

---

## ✅ Checklist de Validation

- [ ] Tous les fichiers .env créés localement
- [ ] Secrets générés avec OpenSSL
- [ ] Compte ImageKit créé et configuré
- [ ] Compte Brevo créé et configuré
- [ ] Projet Google Cloud créé avec toutes les APIs activées
- [ ] OAuth 2.0 configuré avec les bonnes redirect URIs
- [ ] Compte/projet Stripe configuré
- [ ] Webhook Stripe configuré
- [ ] Variables GitLab CI/CD ajoutées
- [ ] Tokens Strapi générés dans l'admin panel
- [ ] Base de données PostgreSQL créée
- [ ] Test de connexion à tous les services externes réussi

---

## 🚀 Ordre de Démarrage Recommandé

1. Configurer `.env` racine avec PostgreSQL
2. Démarrer PostgreSQL: `docker-compose up -d postgres pgadmin`
3. Configurer `donaction-api/.env` avec tous les services externes
4. Démarrer l'API: `docker-compose up -d donactionapi`
5. Accéder à Strapi Admin: http://localhost:1437/admin
6. Générer les API tokens dans Strapi
7. Copier les tokens dans `donaction-frontend/.env` et `donaction-admin/.env`
8. Démarrer frontend et admin: `docker-compose up -d donactionfrontend donactionadmin`

---

## 📞 Support

Pour toute question sur la configuration, contacter l'équipe DevOps Nakaa.
