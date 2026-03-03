# US-PAY-004 : Création PaymentIntent avec application_fee_amount

> **Epic**: 3 - Backend Paiement | **Priorité**: P0 | **Estimation**: 6 points

## ⚠️ Condition de Garde

```typescript
if (klubr.trade_policy.stripe_connect === true) {
  // Créer avec transfer_data et application_fee_amount
} else {
  // Comportement Legacy
}
```

## 📋 Description

**En tant que** système backend,
**Je veux** créer le PaymentIntent avec les bons paramètres Stripe Connect,
**Afin que** le paiement soit correctement routé vers l'association.

## 🎯 Critères d'Acceptation

```gherkin
Scenario: Création PaymentIntent Stripe Connect
  Given stripe_connect = true
  And un compte connecté valide
  When je crée le PaymentIntent
  Then les paramètres incluent :
    | Paramètre | Valeur |
    | transfer_data.destination | acct_XXXXX |
    | application_fee_amount | calculé selon US-PAY-002 |
    | on_behalf_of | acct_XXXXX |

Scenario: Mode Legacy
  Given stripe_connect = false
  When je crée le PaymentIntent
  Then aucun transfer_data n'est inclus
  And le paiement va sur le compte Fond Klubr
```

## 📐 Code clé

```typescript
const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
  amount: fees.totalDonateur,
  currency: 'eur',
  ...(tradePolicy.stripe_connect && connectedAccount && {
    transfer_data: {
      destination: connectedAccount.stripeAccountId,
    },
    application_fee_amount: fees.applicationFee,
    on_behalf_of: connectedAccount.stripeAccountId,
  }),
};
```

## ✅ Definition of Done

- [ ] Création PaymentIntent adaptée
- [ ] Condition de garde implémentée
- [ ] Tests avec Stripe CLI
- [ ] Webhook payment_intent.succeeded vérifie le routage
