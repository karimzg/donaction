# US-ERR-001 : Retry instantané donateur

> **Epic**: 8 - Erreurs & Réconciliation | **Priorité**: P1 | **Estimation**: 3 points

## 📋 Description

Permettre au donateur de réessayer son paiement en réutilisant le même PaymentIntent si celui-ci est encore valide (<24h).

## 🎯 Critères d'Acceptation

```gherkin
Scenario: PaymentIntent encore valide
  Given un PaymentIntent créé il y a moins de 24h
  And status = "requires_payment_method"
  When le donateur retente le paiement
  Then le même client_secret est réutilisé
  And response.reused = true

Scenario: PaymentIntent expiré
  Given un PaymentIntent créé il y a plus de 24h
  When le donateur retente le paiement
  Then un nouveau PaymentIntent est créé
  And response.reused = false
```

## 📐 Implémentation

```typescript
async function getOrCreatePaymentIntent(params: PaymentIntentParams) {
  // Chercher un PI existant récent
  const existingPayment = await strapi.db.query('api::klub-don-payment.klub-don-payment').findOne({
    where: {
      klub_don: params.donId,
      status: 'pending',
      created_at: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });
  
  if (existingPayment) {
    // Vérifier le statut sur Stripe
    const pi = await stripe.paymentIntents.retrieve(existingPayment.intent_id);
    
    if (pi.status === 'requires_payment_method' || pi.status === 'requires_confirmation') {
      return { 
        intent: existingPayment.client_secret, 
        reused: true,
      };
    }
  }
  
  // Créer un nouveau PI
  return await createNewPaymentIntent(params);
}
```

## ✅ Definition of Done

- [ ] Logique de réutilisation implémentée
- [ ] Vérification expiration 24h
- [ ] Flag `reused` dans la réponse
- [ ] Tests
- [ ] PR approuvée et mergée
