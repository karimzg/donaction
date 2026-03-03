# US-ERR-002 : Cron réconciliation PaymentIntents

> **Epic**: 8 - Erreurs | **Priorité**: P1 | **Estimation**: 5 points

Identifier les PaymentIntents orphelins (status mismatch avec klub-don).

```typescript
// Exécution toutes les heures
const orphans = await findOrphanPaymentIntents();
for (const pi of orphans) {
  await reconcile(pi);
}
```
