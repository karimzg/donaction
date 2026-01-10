# US-DIS-002 : Implémenter `reverseTransferForDispute()`

> **Epic**: 10 - Disputes | **Priorité**: P2 | **Estimation**: 3 points

## 📋 Description

Lors d'un litige ouvert, reverser le montant de l'association vers le compte plateforme pour provisionner le montant contesté.

## 🎯 Critères d'Acceptation

```gherkin
Scenario: Reverse transfer lors dispute
  Given un litige créé sur un don Stripe Connect
  When reverseTransferForDispute est appelé
  Then stripe.transfers.createReversal est appelé
  And le montant est provisionné sur le compte plateforme
  And une notification est envoyée à l'association
```

## 📐 Implémentation

```typescript
async function reverseTransferForDispute(don: KlubDonEntity, dispute: Stripe.Dispute) {
  const payment = don.payment;
  
  // Récupérer le transfer original
  const paymentIntent = await stripe.paymentIntents.retrieve(payment.intent_id, {
    expand: ['latest_charge.transfer'],
  });
  
  const transfer = paymentIntent.latest_charge?.transfer as Stripe.Transfer;
  
  if (transfer) {
    // Reverser le transfer
    await stripe.transfers.createReversal(transfer.id, {
      amount: dispute.amount,
      metadata: {
        dispute_id: dispute.id,
        don_uuid: don.uuid,
      },
    });
    
    console.log(`⚠️ Transfer reversé pour dispute ${dispute.id}: ${dispute.amount/100}€`);
  }
}
```

## ✅ Definition of Done

- [ ] Fonction implémentée
- [ ] Intégration handler dispute.created
- [ ] Notification association
- [ ] Tests
- [ ] PR approuvée et mergée
