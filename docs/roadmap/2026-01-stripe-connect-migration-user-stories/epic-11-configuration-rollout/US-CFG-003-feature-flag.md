# US-CFG-003 : Feature flag `STRIPE_CONNECT_ENABLED`

> **Epic**: 11 - Configuration & Rollout | **Priorité**: P1 | **Estimation**: 2 points

## 📋 Description

Implémenter un feature flag global permettant de désactiver Stripe Connect en cas de problème, indépendamment des trade_policy individuelles.

## 🎯 Critères d'Acceptation

```gherkin
Scenario: Feature flag désactivé
  Given STRIPE_CONNECT_ENABLED = false
  And trade_policy.stripe_connect = true
  When un paiement est initié
  Then le mode Legacy est utilisé
  And un warning est loggé

Scenario: Feature flag activé
  Given STRIPE_CONNECT_ENABLED = true
  And trade_policy.stripe_connect = true
  When un paiement est initié
  Then le mode Stripe Connect est utilisé
```

## 📐 Implémentation

```typescript
// helpers/feature-flags.ts

export function isStripeConnectEnabled(): boolean {
  return process.env.STRIPE_CONNECT_ENABLED === 'true';
}

export function shouldUseStripeConnect(tradePolicy: TradePolicyEntity): boolean {
  // Feature flag global + configuration association
  return isStripeConnectEnabled() && tradePolicy?.stripe_connect === true;
}
```

### Utilisation

```typescript
// Dans createPaymentIntent
const useStripeConnect = shouldUseStripeConnect(klubr.trade_policy);

if (!useStripeConnect && klubr.trade_policy?.stripe_connect) {
  console.warn(`⚠️ Stripe Connect désactivé globalement, fallback Legacy pour ${klubr.uuid}`);
}
```

## ✅ Definition of Done

- [ ] Helper créé
- [ ] Intégré dans tous les points d'entrée Connect
- [ ] Warning logs si fallback
- [ ] Tests
- [ ] Documentation rollback
- [ ] PR approuvée et mergée
