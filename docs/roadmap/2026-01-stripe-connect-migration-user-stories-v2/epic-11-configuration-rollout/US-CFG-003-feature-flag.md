# US-CFG-003 : Feature flag STRIPE_CONNECT_ENABLED

> **Epic**: 11 - Configuration | **Priorité**: P1 | **Estimation**: 2 points

## Description

Kill switch global pour désactiver Stripe Connect en cas de problème.

```typescript
const isStripeConnectGloballyEnabled = process.env.STRIPE_CONNECT_ENABLED === 'true';

function shouldUseStripeConnect(klubr: Klubr): boolean {
  return isStripeConnectGloballyEnabled && klubr.trade_policy.stripe_connect;
}
```

Si `false` → Toutes les associations retombent en mode Legacy.
