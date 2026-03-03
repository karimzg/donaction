# US-ERR-002 : Cron de réconciliation PaymentIntents orphelins

> **Epic**: 8 - Erreurs & Réconciliation | **Priorité**: P1 | **Estimation**: 5 points

## 📋 Description

Implémenter un cron job qui vérifie les PaymentIntents en statut "pending" et les synchronise avec Stripe.

## 🎯 Critères d'Acceptation

```gherkin
Scenario: PI succeeded mais non enregistré
  Given un PaymentIntent en base avec status = "pending"
  And sur Stripe le status = "succeeded"
  When le cron s'exécute
  Then le status local est mis à jour
  And le don passe à "confirmé"
  And le reçu fiscal est généré

Scenario: PI expired
  Given un PaymentIntent créé il y a plus de 24h
  And sur Stripe le status = "canceled" ou "requires_payment_method"
  When le cron s'exécute
  Then le status local = "expired"
  And le don passe à "abandonné"
```

## 📐 Configuration Cron

```typescript
// config/cron-tasks.ts
export default {
  reconcilePaymentIntents: {
    task: async ({ strapi }) => {
      await strapi.service('api::klub-don-payment.reconciliation').run();
    },
    options: {
      rule: '*/15 * * * *', // Toutes les 15 minutes
    },
  },
};
```

## 📐 Service

```typescript
// services/reconciliation.ts
async run() {
  const pendingPayments = await strapi.db.query('api::klub-don-payment.klub-don-payment').findMany({
    where: {
      status: 'pending',
      created_at: { $lt: new Date(Date.now() - 5 * 60 * 1000) }, // > 5 min
    },
    limit: 100,
  });
  
  for (const payment of pendingPayments) {
    try {
      const pi = await stripe.paymentIntents.retrieve(payment.intent_id);
      await this.syncPaymentStatus(payment, pi);
    } catch (error) {
      console.error(`Erreur réconciliation ${payment.intent_id}:`, error);
    }
  }
}
```

## ✅ Definition of Done

- [ ] Cron job configuré (15 min)
- [ ] Service réconciliation
- [ ] Génération reçu si succeeded
- [ ] Logs détaillés
- [ ] Tests
- [ ] PR approuvée et mergée
