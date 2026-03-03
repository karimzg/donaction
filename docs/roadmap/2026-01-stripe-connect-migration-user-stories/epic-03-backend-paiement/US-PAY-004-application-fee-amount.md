# US-PAY-004 : Modifier `createPaymentIntent` pour inclure `application_fee_amount` dynamique

> **Epic**: 3 - Backend Paiement | **Priorité**: P0 | **Estimation**: 5 points

---

## ⚠️ Condition de Garde

```typescript
// Stripe Connect ne s'active QUE si :
klubr.trade_policy.stripe_connect === true
&& klubr.connected_account?.charges_enabled === true
```

Si ces conditions ne sont pas remplies, utiliser le flux Legacy.

---

## 📋 Description

**En tant que** système backend,
**Je veux** créer des PaymentIntents avec `application_fee_amount` calculé dynamiquement,
**Afin que** Stripe prélève automatiquement la commission DONACTION.

---

## 🎯 Critères d'Acceptation

### Scénario 1 : PaymentIntent Stripe Connect avec Donor Pays Fee

```gherkin
Given trade_policy.stripe_connect = true
And connected_account.charges_enabled = true
And donorPaysFee = true
And un don de 100€ avec commission 4%
When createPaymentIntent est appelé
Then le PaymentIntent est créé avec :
  | Champ                    | Valeur                     |
  | amount                   | 10400 (100€ + 4€ frais)    |
  | on_behalf_of             | acct_xxx                   |
  | transfer_data.destination| acct_xxx                   |
  | application_fee_amount   | 400 (4€)                   |
  | metadata.donor_pays_fee  | "true"                     |
```

### Scénario 2 : PaymentIntent Stripe Connect sans Donor Pays Fee

```gherkin
Given trade_policy.stripe_connect = true
And donorPaysFee = false
And un don de 100€
When createPaymentIntent est appelé
Then le PaymentIntent est créé avec :
  | Champ                    | Valeur                     |
  | amount                   | 10000 (100€ brut)          |
  | application_fee_amount   | 400 (4€ déduits)           |
And l'association recevra 96€ net
```

### Scénario 3 : Fallback mode Legacy

```gherkin
Given trade_policy.stripe_connect = false
When createPaymentIntent est appelé
Then le PaymentIntent est créé SANS :
  - on_behalf_of
  - transfer_data
  - application_fee_amount
And le paiement va sur le compte unique DONACTION
```

### Scénario 4 : Compte non activé - Blocage

```gherkin
Given trade_policy.stripe_connect = true
And connected_account.charges_enabled = false
When createPaymentIntent est appelé
Then une erreur 400 est retournée
And le message indique "Le compte paiement de l'association n'est pas activé"
```

---

## 📐 Spécifications Techniques

### Fichier à modifier

```
donaction-api/src/api/klub-don-payment/controllers/klub-don-payment.ts
```

### Implémentation

```typescript
// klub-don-payment.controller.ts

import Stripe from 'stripe';
import { determineDonorPaysFee, calculateApplicationFee } from '../helpers/fee-calculation-helper';

async createPaymentIntent(ctx) {
  const { price, idempotencyKey, donorPaysFee: donorChoiceFromFrontend, metadata } = ctx.request.body;
  
  // Récupérer le klubr avec sa trade_policy et connected_account
  const klubDon = await strapi.documents('api::klub-don.klub-don').findOne({
    documentId: metadata.donUuid,
    populate: {
      klubr: {
        populate: ['trade_policy', 'connected_account'],
      },
      klub_projet: true,
    },
  });
  
  const klubr = klubDon.klubr;
  const tradePolicy = klubr.trade_policy;
  const connectedAccount = klubr.connected_account;
  
  // ==========================================
  // CONDITION DE GARDE : Mode Stripe Connect ?
  // ==========================================
  const useStripeConnect = tradePolicy?.stripe_connect === true;
  
  if (useStripeConnect) {
    // Vérifier que le compte est activé
    if (!connectedAccount?.charges_enabled) {
      return ctx.badRequest(
        'Le compte paiement de l\'association n\'est pas activé. ' +
        'Veuillez contacter l\'association pour finaliser son inscription.'
      );
    }
    
    // Déterminer le mode donor_pays_fee
    const isProjectDonation = !!klubDon.klub_projet;
    const actualDonorPaysFee = determineDonorPaysFee({
      tradePolicy,
      isProjectDonation,
      donorChoice: donorChoiceFromFrontend ?? null,
    });
    
    // Calculer les montants
    let amountInCents = Math.round(price * 100);
    const applicationFeeAmount = calculateApplicationFee(amountInCents, tradePolicy);
    
    // Si donor pays fee, ajouter les frais au montant total
    if (actualDonorPaysFee) {
      amountInCents += applicationFeeAmount;
    }
    
    // Stocker le choix dans le don
    await strapi.documents('api::klub-don.klub-don').update({
      documentId: metadata.donUuid,
      data: { donor_pays_fee: actualDonorPaysFee },
    });
    
    // Créer le PaymentIntent Stripe Connect
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: amountInCents,
      currency: 'eur',
      metadata: {
        ...metadata,
        payment_method: 'stripe_connect',
        donor_pays_fee: String(actualDonorPaysFee),
        is_project_donation: String(isProjectDonation),
      },
      // Paramètres Stripe Connect
      on_behalf_of: connectedAccount.stripe_account_id,
      transfer_data: {
        destination: connectedAccount.stripe_account_id,
      },
      application_fee_amount: applicationFeeAmount,
    };
    
    const paymentIntent = await stripe.paymentIntents.create(
      paymentIntentParams,
      { idempotencyKey: idempotencyKey || undefined }
    );
    
    // Sauvegarder le payment
    await strapi.documents('api::klub-don-payment.klub-don-payment').create({
      data: {
        intent_id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: amountInCents,
        currency: 'eur',
        status: 'pending',
        klub_don: klubDon.id,
      },
    });
    
    return { intent: paymentIntent.client_secret, reused: false };
    
  } else {
    // ==========================================
    // MODE LEGACY : Flux existant inchangé
    // ==========================================
    const amountInCents = Math.round(price * 100);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      metadata: {
        ...metadata,
        payment_method: 'stripe_standard',
      },
    }, { idempotencyKey: idempotencyKey || undefined });
    
    await strapi.documents('api::klub-don-payment.klub-don-payment').create({
      data: {
        intent_id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: amountInCents,
        currency: 'eur',
        status: 'pending',
        klub_don: klubDon.id,
      },
    });
    
    return { intent: paymentIntent.client_secret, reused: false };
  }
}
```

---

## 🧪 Tests d'intégration

```typescript
describe('createPaymentIntent', () => {
  it('should create Connect PaymentIntent when stripe_connect is true', async () => {
    // Setup
    const klubr = await createTestKlubr({
      trade_policy: { stripe_connect: true, commissionPercentage: 4 },
      connected_account: { charges_enabled: true, stripe_account_id: 'acct_test' },
    });
    
    // Act
    const response = await request(app)
      .post('/api/klub-don-payments/create-payment-intent')
      .send({
        price: 100,
        donorPaysFee: true,
        metadata: { donUuid: 'xxx', klubUuid: klubr.uuid },
      });
    
    // Assert
    expect(response.status).toBe(200);
    expect(stripeMock.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 10400, // 100€ + 4€ frais
        application_fee_amount: 400,
        on_behalf_of: 'acct_test',
      }),
      expect.any(Object)
    );
  });
  
  it('should create Legacy PaymentIntent when stripe_connect is false', async () => {
    const klubr = await createTestKlubr({
      trade_policy: { stripe_connect: false },
    });
    
    const response = await request(app)
      .post('/api/klub-don-payments/create-payment-intent')
      .send({
        price: 100,
        metadata: { donUuid: 'xxx', klubUuid: klubr.uuid },
      });
    
    expect(response.status).toBe(200);
    expect(stripeMock.paymentIntents.create).toHaveBeenCalledWith(
      expect.not.objectContaining({
        on_behalf_of: expect.any(String),
        application_fee_amount: expect.any(Number),
      }),
      expect.any(Object)
    );
  });
  
  it('should reject when charges_enabled is false', async () => {
    const klubr = await createTestKlubr({
      trade_policy: { stripe_connect: true },
      connected_account: { charges_enabled: false },
    });
    
    const response = await request(app)
      .post('/api/klub-don-payments/create-payment-intent')
      .send({
        price: 100,
        metadata: { donUuid: 'xxx', klubUuid: klubr.uuid },
      });
    
    expect(response.status).toBe(400);
    expect(response.body.error.message).toContain('n\'est pas activé');
  });
});
```

---

## 🔗 Dépendances

| Type | US | Description |
|------|-----|-------------|
| Requiert | US-PAY-001 | Helper determineDonorPaysFee |
| Requiert | US-PAY-002 | Helper calculateApplicationFee |
| Requiert | US-PAY-003 | Champ donor_pays_fee |
| Requiert | US-ONB-002 | Connected account existe |

---

## ✅ Definition of Done

- [ ] Contrôleur modifié avec condition de garde
- [ ] Mode Stripe Connect implémenté
- [ ] Mode Legacy préservé (régression 0)
- [ ] Validation compte activé implémentée
- [ ] Tests d'intégration passants
- [ ] Logs de debug ajoutés
- [ ] PR approuvée et mergée

---

## 📝 Notes

- Utiliser des logs détaillés pour le debugging en production
- Le `idempotencyKey` doit être unique par tentative
- Prévoir un monitoring sur les erreurs 400 (compte non activé)
