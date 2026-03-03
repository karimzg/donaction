# US-WH-002 : Créer l'endpoint `/stripe-connect/webhook`

> **Epic**: 4 - Webhooks & Audit | **Priorité**: P0 | **Estimation**: 5 points

---

## 📋 Description

**En tant que** système backend,
**Je veux** un endpoint dédié pour recevoir les webhooks des comptes connectés Stripe,
**Afin de** gérer les événements KYC, payouts et disputes séparément des événements paiement.

---

## 🎯 Critères d'Acceptation

```gherkin
Scenario: Réception webhook Connect valide
  Given un webhook Stripe avec signature valide
  And le header stripe-signature présent
  When POST /api/stripe-connect/webhook
  Then status 200 est retourné
  And l'événement est loggé dans webhook_logs avec source = "connect"

Scenario: Signature invalide
  Given un webhook avec signature invalide
  When POST /api/stripe-connect/webhook
  Then status 400 est retourné
  And le message contient "Webhook signature verification failed"

Scenario: Événements supportés
  Given un événement Connect
  When le type est l'un des suivants :
    | account.updated                    |
    | account.application.deauthorized   |
    | capability.updated                 |
    | charge.dispute.created             |
    | charge.dispute.updated             |
    | charge.dispute.closed              |
    | payout.paid                        |
    | payout.failed                      |
  Then l'événement est traité par le handler approprié
```

---

## 📐 Spécifications Techniques

### Route

```typescript
// api/stripe-connect/routes/stripe-connect-custom.ts
export default {
  routes: [
    {
      method: 'POST',
      path: '/stripe-connect/webhook',
      handler: 'stripe-connect.handleWebhook',
      config: {
        auth: false, // Pas d'auth, validation par signature Stripe
      },
    },
  ],
};
```

### Controller

```typescript
// api/stripe-connect/controllers/stripe-connect.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default {
  async handleWebhook(ctx) {
    const sig = ctx.request.headers['stripe-signature'];
    const rawBody = ctx.request.body[Symbol.for('unparsedBody')];
    
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET_CONNECT
      );
    } catch (err) {
      console.error('⚠️ Webhook signature verification failed:', err.message);
      return ctx.badRequest(`Webhook Error: ${err.message}`);
    }
    
    // Log l'événement
    const existingLog = await strapi.db.query('api::webhook-log.webhook-log').findOne({
      where: { event_id: event.id },
    });
    
    if (existingLog) {
      await strapi.db.query('api::webhook-log.webhook-log').update({
        where: { id: existingLog.id },
        data: { status: 'ignored', retry_count: existingLog.retry_count + 1 },
      });
      return ctx.send({ received: true, status: 'duplicate' });
    }
    
    const webhookLog = await strapi.documents('api::webhook-log.webhook-log').create({
      data: {
        event_id: event.id,
        event_type: event.type,
        source: 'connect',
        stripe_account_id: event.account,
        payload: event.data.object,
        status: 'processing',
      },
    });
    
    try {
      // Dispatcher vers le handler approprié
      await this.dispatchEvent(event);
      
      await strapi.documents('api::webhook-log.webhook-log').update({
        documentId: webhookLog.documentId,
        data: { status: 'processed', processed_at: new Date() },
      });
    } catch (error) {
      await strapi.documents('api::webhook-log.webhook-log').update({
        documentId: webhookLog.documentId,
        data: { status: 'failed', processing_error: error.message },
      });
      throw error;
    }
    
    ctx.send({ received: true });
  },
  
  async dispatchEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'account.updated':
        await this.handleAccountUpdated(event);
        break;
      case 'account.application.deauthorized':
        await this.handleAccountDeauthorized(event);
        break;
      case 'charge.dispute.created':
      case 'charge.dispute.updated':
      case 'charge.dispute.closed':
        await this.handleDispute(event);
        break;
      case 'payout.failed':
        await this.handlePayoutFailed(event);
        break;
      default:
        console.log(`Événement non géré: ${event.type}`);
    }
  },
};
```

---

## 🔗 Dépendances

| Type | US | Description |
|------|-----|-------------|
| Requiert | US-WH-001 | Content-type webhook-log |
| Requiert | US-CFG-002 | Variable STRIPE_WEBHOOK_SECRET_CONNECT |
| Bloque | US-WH-003 | Handler account.updated |
| Bloque | US-WH-005 | Handler disputes |

---

## ✅ Definition of Done

- [ ] Route créée et fonctionnelle
- [ ] Validation signature implémentée
- [ ] Logging dans webhook_logs
- [ ] Dispatcher par type d'événement
- [ ] Tests avec Stripe CLI (`stripe listen`)
- [ ] PR approuvée et mergée
