# US-ONB-002 : Implémenter `createConnectedAccount()`

> **Epic**: 5 - Onboarding Association | **Priorité**: P0 | **Estimation**: 5 points

---

## ⚠️ Condition de Garde

```typescript
// Cette fonction ne doit être appelée QUE si :
klubr.trade_policy.stripe_connect === true
```

---

## 📋 Description

**En tant que** système backend,
**Je veux** créer un compte Stripe Express pour chaque association éligible,
**Afin qu'** elle puisse recevoir des dons directement.

---

## 🎯 Critères d'Acceptation

```gherkin
Scenario: Création compte Express réussie
  Given un klubr avec requiredFieldsCompletion = 100%
  And trade_policy.stripe_connect = true
  When createConnectedAccount est appelé
  Then un compte Stripe Express est créé
  And connected_account est créé en base avec :
    | stripe_account_id   | acct_xxx        |
    | account_status      | pending         |
    | charges_enabled     | false           |
    | country             | FR              |
    | business_type       | non_profit      |

Scenario: Prérequis non remplis
  Given un klubr avec requiredFieldsCompletion < 100%
  When createConnectedAccount est appelé
  Then une erreur "Informations incomplètes" est levée

Scenario: Compte déjà existant
  Given un klubr avec un connected_account existant
  When createConnectedAccount est appelé
  Then une erreur "Compte déjà créé" est levée
```

---

## 📐 Implémentation

```typescript
// api/stripe-connect/services/stripe-connect.ts

async createConnectedAccount(klubrId: string): Promise<ConnectedAccountEntity> {
  const klubr = await strapi.documents('api::klubr.klubr').findOne({
    documentId: klubrId,
    populate: ['trade_policy', 'connected_account'],
  });
  
  // Condition de garde
  if (!klubr.trade_policy?.stripe_connect) {
    throw new Error('Stripe Connect non activé pour ce klubr');
  }
  
  // Vérifications
  if (klubr.requiredFieldsCompletion < 100) {
    throw new Error(`Informations incomplètes (${klubr.requiredFieldsCompletion}%)`);
  }
  
  if (klubr.connected_account) {
    throw new Error('Compte Stripe déjà créé');
  }
  
  // Créer le compte Stripe Express
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'FR',
    email: klubr.email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: 'non_profit',
    business_profile: {
      name: klubr.denomination,
      url: `https://donaction.fr/${klubr.slug}`,
      mcc: '8398', // Charitable organizations
    },
    metadata: {
      klubr_uuid: klubr.uuid,
      klubr_siren: klubr.SIREN,
    },
    settings: {
      payouts: {
        schedule: { interval: 'manual' },
      },
    },
    controller: {
      losses: { payments: 'stripe' },
      fees: { payer: 'application' },
      stripe_dashboard: { type: 'express' },
    },
  });
  
  // Créer l'entrée en base
  const connectedAccount = await strapi.documents('api::connected-account.connected-account').create({
    data: {
      stripe_account_id: account.id,
      klubr: klubr.id,
      account_status: 'pending',
      verification_status: 'unverified',
      onboarding_completed: false,
      charges_enabled: false,
      payouts_enabled: false,
      country: 'FR',
      business_type: 'non_profit',
      created_at_stripe: new Date(account.created * 1000),
      last_sync: new Date(),
    },
  });
  
  return connectedAccount;
}
```

---

## 🔗 Dépendances

| Type | US | Description |
|------|-----|-------------|
| Bloque | US-ONB-003 | Génération lien onboarding |
| Bloque | US-PAY-004 | Utilisation du compte pour paiements |

---

## ✅ Definition of Done

- [ ] Service createConnectedAccount implémenté
- [ ] Validations prérequis
- [ ] Création compte Stripe via API
- [ ] Stockage en base connected_account
- [ ] Tests unitaires et intégration
- [ ] PR approuvée et mergée
