# US-REF-004 : Appel stripe.refunds.create()

> **Epic**: 7 - Remboursement | **Priorité**: P2 | **Estimation**: 5 points

```typescript
const refund = await stripe.refunds.create({
  payment_intent: klubDon.stripePaymentIntentId,
  reverse_transfer: true, // Annuler aussi le transfert vers l'association
  refund_application_fee: true, // Rembourser l'application_fee
});
```
