# US-REF-004 : Intégrer `stripe.refunds.create()`

> **Epic**: 7 - Remboursement | **Priorité**: P2 | **Estimation**: 3 points

## 📋 Description

Appeler l'API Stripe pour effectuer le remboursement réel après approbation admin.

## 🎯 Critères d'Acceptation

```gherkin
Scenario: Remboursement Stripe Connect
  Given trade_policy.stripe_connect = true
  And un remboursement approuvé
  When processStripeRefund est appelé
  Then stripe.refunds.create est appelé avec :
    | Paramètre              | Valeur                    |
    | payment_intent         | pi_xxx                    |
    | amount                 | montant en centimes       |
    | refund_application_fee | true                      |
    | reverse_transfer       | true                      |
  And receipt_cancellation.refund_id = re_xxx

Scenario: Remboursement Legacy
  Given trade_policy.stripe_connect = false
  When processStripeRefund est appelé
  Then stripe.refunds.create est appelé SANS reverse_transfer
```

## 📐 Implémentation

```typescript
async function processStripeRefund(cancellationId: string) {
  const cancellation = await getCancellationWithDon(cancellationId);
  const don = cancellation.klub_don;
  const isStripeConnect = don.klubr.trade_policy?.stripe_connect;
  
  const refundParams: Stripe.RefundCreateParams = {
    payment_intent: don.payment.intent_id,
    amount: Math.round(don.montant * 100),
  };
  
  // Paramètres spécifiques Stripe Connect
  if (isStripeConnect) {
    refundParams.refund_application_fee = true;
    refundParams.reverse_transfer = true;
  }
  
  const refund = await stripe.refunds.create(refundParams);
  
  await strapi.documents('api::receipt-cancellation.receipt-cancellation').update({
    documentId: cancellationId,
    data: {
      status: 'completed',
      refund_id: refund.id,
      completed_at: new Date(),
    },
  });
}
```

## ✅ Definition of Done

- [ ] Intégration Stripe refunds
- [ ] Différenciation Connect/Legacy
- [ ] Gestion des erreurs Stripe
- [ ] Tests
- [ ] PR approuvée et mergée
