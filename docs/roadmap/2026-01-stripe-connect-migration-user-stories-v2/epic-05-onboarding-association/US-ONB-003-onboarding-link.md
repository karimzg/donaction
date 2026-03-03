# US-ONB-003 : generateOnboardingLink()

> **Epic**: 5 - Onboarding | **Priorité**: P0 | **Estimation**: 3 points

## 📋 Description

Générer le lien d'onboarding Stripe hébergé.

```typescript
const accountLink = await stripe.accountLinks.create({
  account: connectedAccount.stripeAccountId,
  refresh_url: `${FRONTEND_URL}/dashboard/onboarding/refresh`,
  return_url: `${FRONTEND_URL}/dashboard/onboarding/complete`,
  type: 'account_onboarding',
});
```
