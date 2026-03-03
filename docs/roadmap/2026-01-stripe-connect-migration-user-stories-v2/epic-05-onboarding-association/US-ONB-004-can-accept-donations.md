# US-ONB-004 : canAcceptDonations()

> **Epic**: 5 - Onboarding | **Priorité**: P0 | **Estimation**: 3 points

## ⚠️ Condition de Garde

Vérification complète avant d'accepter un don Stripe Connect.

```typescript
function canAcceptDonations(klubr: Klubr): { can: boolean; reason?: string } {
  if (!klubr.trade_policy.stripe_connect) {
    return { can: true }; // Mode Legacy
  }
  
  const ca = klubr.connected_account;
  if (!ca) return { can: false, reason: 'no_connected_account' };
  if (ca.status !== 'active') return { can: false, reason: 'account_not_active' };
  if (!ca.chargesEnabled) return { can: false, reason: 'charges_disabled' };
  if (!ca.payoutsEnabled) return { can: false, reason: 'payouts_disabled' };
  
  return { can: true };
}
```
