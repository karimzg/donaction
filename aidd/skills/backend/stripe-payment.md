---
name: "stripe-payment-integration"
description: "Integrate Stripe payments with payment intent creation, webhook handling, and status checking"
triggers: ["stripe", "payment", "payment intent", "webhook", "donation payment", "subscription payment"]
tags: ["stripe", "payment", "backend", "strapi", "api"]
priority: high
scope: module
output: code
---

# Stripe Payment Integration

## Instructions

- Import Stripe SDK with secret key from `process.env.STRIPE_SECRET_KEY`
- Create payment intent with amount (in cents), currency EUR
- Handle webhooks at `/klub-don-payments/stripe-web-hooks` without authentication
- Verify webhook signature using `stripe.webhooks.constructEvent()`
- Check payment status via Stripe API or webhook events
- Update donation status based on payment confirmation
- Return client_secret to frontend for Stripe Elements
- Log all payment events for audit trail

## Example

**Input:** "Implement Stripe payment for donations"

**Output:** Payment intent controller, webhook handler, status checker

```typescript
// donaction-api/src/api/klub-don-payment/controllers/klub-don-payment.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export default factories.createCoreController(
  'api::klub-don-payment.klub-don-payment',
  ({ strapi }) => ({
    async createPaymentIntent(ctx) {
      const { amount, donationId } = ctx.request.body;

      if (!amount || amount <= 0) {
        return ctx.badRequest('Montant invalide');
      }

      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'eur',
          metadata: { donationId }
        });

        return { clientSecret: paymentIntent.client_secret };
      } catch (error) {
        console.error('Stripe error:', error);
        return ctx.internalServerError('Erreur de paiement');
      }
    },

    async handleWebhook(ctx) {
      const sig = ctx.request.headers['stripe-signature'];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

      try {
        const event = stripe.webhooks.constructEvent(
          ctx.request.body,
          sig,
          webhookSecret
        );

        if (event.type === 'payment_intent.succeeded') {
          const paymentIntent = event.data.object;
          const { donationId } = paymentIntent.metadata;

          await strapi.db.query('api::klub-don.klub-don').update({
            where: { id: donationId },
            data: { status: 'Confirmé' }
          });
        }

        return { received: true };
      } catch (error) {
        console.error('Webhook error:', error);
        return ctx.badRequest('Webhook invalide');
      }
    },

    async checkStatus(ctx) {
      const { paymentIntentId } = ctx.params;

      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        return { status: paymentIntent.status };
      } catch (error) {
        return ctx.notFound('Paiement non trouvé');
      }
    }
  })
);
```
