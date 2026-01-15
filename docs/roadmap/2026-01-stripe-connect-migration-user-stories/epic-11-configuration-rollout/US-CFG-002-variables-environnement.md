# US-CFG-002 : Ajouter la variable `STRIPE_WEBHOOK_SECRET_CONNECT`

> **Epic**: 11 - Configuration & Rollout | **Priorité**: P0 | **Estimation**: 1 point

## 📋 Description

Ajouter les nouvelles variables d'environnement nécessaires pour Stripe Connect.

## 🎯 Nouvelles Variables

```bash
# .env.example

# Stripe Connect
STRIPE_WEBHOOK_SECRET_CONNECT=whsec_xxx  # Secret pour webhooks comptes connectés

# Feature flags
STRIPE_CONNECT_ENABLED=true              # Activer/désactiver Stripe Connect

# URLs de retour onboarding
STRIPE_CONNECT_REFRESH_URL=https://admin.donaction.fr/payment-setup?refresh=true
STRIPE_CONNECT_RETURN_URL=https://admin.donaction.fr/payment-setup?success=true
```

## 📐 Configuration par environnement

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| STRIPE_WEBHOOK_SECRET_CONNECT | whsec_test_xxx | whsec_test_xxx | whsec_live_xxx |
| STRIPE_CONNECT_ENABLED | true | true | false (puis true) |

## ✅ Definition of Done

- [ ] Variables ajoutées à `.env.example`
- [ ] Variables configurées sur le serveur staging
- [ ] Variables configurées sur le serveur production
- [ ] Documentation mise à jour
- [ ] GitHub Secrets mis à jour pour CI/CD
