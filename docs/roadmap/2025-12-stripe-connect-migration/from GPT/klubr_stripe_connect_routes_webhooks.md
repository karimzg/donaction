
# Stripe Connect — Plan détaillé (Routes, Webhooks, Exemples)

## Choix recommandé
- **Stripe Connect** — *Standard accounts* (ou Custom si besoin d'un contrôle maximal)
- Utiliser **Checkout Sessions** pour la simplicité
- Prélever un **application_fee_amount** si tu veux une commission

---

## Concepts clés
- `stripe_account_id` : identifiant du compte Stripe de l'association
- Onboarding : `accountLinks` (hosted)
- Checkout : créer la session avec `stripeAccount` header/option
- Webhooks : recevoir évènements pour générer reçus, suivre paiements

---

## Endpoints backend (exemples REST)

### 1. POST /api/stripe/create-connect-account
- Crée un compte Connect (facultatif si on passe directement par accountLinks)
- Response : `{ accountId }`

### 2. POST /api/stripe/create-account-link
- Body : `{ accountId, refresh_url, return_url }`
- Utilité : génère `accountLink.url` pour rediriger l'association vers Stripe onboarding
- Response : `{ url }`

### 3. GET /api/stripe/account-status?accountId=acct_xxx
- Récupère le statut KYC / capabilites
- Utilité : afficher dans le dashboard si l'association peut accepter paiements

### 4. POST /api/donations/create-checkout-session
- Body : `{ clubId, projectId, amount, currency, success_url, cancel_url }`
- Backend crée Checkout Session en utilisant `stripe.accounts`:
```js
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{ price_data: { currency, product_data: { name }, unit_amount: amount }, quantity: 1 }],
  mode: 'payment',
  success_url,
  cancel_url,
  payment_intent_data: {
    application_fee_amount: Math.round(amount * PLATFORM_FEE),
    transfer_data: { destination: stripeAccountId }
  }
}, { stripeAccount: stripeAccountId });
```
- Response : `{ sessionId }`

### 5. POST /api/stripe/deauthorize
- Permet à une association de déconnecter son compte
- Révoquer tokens si applicable

---

## Webhooks (Stripe → ton backend)

Configure un endpoint sécurisé, par ex `/webhooks/stripe`, et écoute :

- `checkout.session.completed`
  - Objectif : générer le reçu fiscal PDF, marquer don comme "payé"
  - Récupérer `session.payment_intent`, `session.amount_total`, `session.customer_details`

- `payment_intent.succeeded`
  - Vérifie et corrige les statuts si webhook `checkout.session.completed` manquait
  - Stocke le paiement

- `account.updated`
  - Surveille le statut KYC & capabilities `transfers`/`card_payments`

- `payout.paid`
  - Notifier l'association que le virement a été effectué

- `charge.refunded`, `charge.failed`
  - Gérer l'état du don / annuler reçu si nécessaire

---

## Sécurité & bonnes pratiques
- Vérifier la signature webhook (`stripe-signature` header)
- Stocker `stripe_account_id` chiffré (ou à minima dans DB protégée)
- Logs d'audit pour chaque webhook
- Rejetez les webhooks non connus
- Mettre en place un replay protection

---

## Exemples de flux (schéma rapide)
1. Club se connecte → Stripe onboarding → `stripe_account_id` stocké
2. Donateur clique sur page projet → Front appelle backend → backend crée Checkout Session (avec `stripeAccount`)
3. Donateur paye → Stripe reverse fonds au club
4. Stripe envoie `checkout.session.completed` → tu génères reçu PDF et l'envoies par email

---

## Checklist de déploiement
- [ ] Mode test OK
- [ ] Webhook signature vérifiée
- [ ] Process refunds testés
- [ ] Application fee correctement calculée
- [ ] Onboarding Stripe OK en production

