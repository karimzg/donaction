# US-DIS-002 : reverseTransferForDispute()

> **Epic**: 10 - Disputes | **Priorité**: P2 | **Estimation**: 5 points

Annuler le transfert vers l'association lors d'un litige.

```typescript
const reversal = await stripe.transfers.createReversal(
  transfer.id,
  { amount: transfer.amount }
);
```
