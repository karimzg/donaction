# US-CFG-001 : Configurer les 2 endpoints webhook dans Stripe Dashboard

> **Epic**: 11 - Configuration & Rollout | **Priorité**: P0 | **Estimation**: 1 point

## 📋 Description

Configurer deux endpoints webhook distincts dans le dashboard Stripe pour séparer les événements platform des événements Connect.

## 🎯 Configuration

### Endpoint 1 : Platform (existant)
```
URL: https://api.donaction.fr/api/stripe/webhook
Événements:
  - payment_intent.succeeded
  - payment_intent.payment_failed
  - payment_intent.canceled
Secret: STRIPE_WEBHOOK_SECRET
```

### Endpoint 2 : Connect (nouveau)
```
URL: https://api.donaction.fr/api/stripe-connect/webhook
Événements Connect:
  - account.updated
  - account.application.deauthorized
  - capability.updated
  - charge.dispute.created
  - charge.dispute.updated
  - charge.dispute.closed
  - payout.paid
  - payout.failed
Secret: STRIPE_WEBHOOK_SECRET_CONNECT
☑️ Listen to events on Connected accounts
```

## 📐 Étapes

1. Aller sur https://dashboard.stripe.com/webhooks
2. Cliquer "Add endpoint"
3. Configurer l'URL `/api/stripe-connect/webhook`
4. Sélectionner les événements Connect
5. Cocher "Listen to events on Connected accounts"
6. Copier le Signing secret
7. Ajouter à `.env.production` comme `STRIPE_WEBHOOK_SECRET_CONNECT`

## ✅ Definition of Done

- [ ] Endpoint Connect configuré sur Stripe Dashboard (staging)
- [ ] Endpoint Connect configuré sur Stripe Dashboard (production)
- [ ] Signing secrets stockés dans les variables d'environnement
- [ ] Test avec `stripe listen --forward-connect-to`
- [ ] Documentation mise à jour
