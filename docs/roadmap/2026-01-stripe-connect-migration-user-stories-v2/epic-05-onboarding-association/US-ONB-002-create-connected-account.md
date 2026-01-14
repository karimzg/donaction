# US-ONB-002 : createConnectedAccount()

> **Epic**: 5 - Onboarding | **Priorité**: P0 | **Estimation**: 5 points

## ⚠️ Condition de Garde

```typescript
if (klubr.trade_policy.stripe_connect === true) {
  await createConnectedAccount(klubr);
}
```

## 📋 Description

Créer un compte Stripe Express pour l'association.

```typescript
const account = await stripe.accounts.create({
  type: 'express',
  country: 'FR',
  email: klubr.leaderEmail,
  capabilities: {
    card_payments: { requested: true },
    transfers: { requested: true },
  },
  business_type: 'non_profit',
  business_profile: {
    name: klubr.name,
    mcc: '8398', // Charitable organizations
  },
});
```
