# US-ONB-003 : Implémenter `generateOnboardingLink()`

> **Epic**: 5 - Onboarding Association | **Priorité**: P0 | **Estimation**: 2 points

---

## ⚠️ Condition de Garde

Cette fonction ne s'exécute que si `stripe_connect === true`.

---

## 📋 Description

**En tant que** responsable d'association,
**Je veux** obtenir un lien vers le formulaire d'onboarding Stripe,
**Afin de** compléter la vérification d'identité et configurer mes coordonnées bancaires.

---

## 🎯 Critères d'Acceptation

```gherkin
Scenario: Génération lien réussie
  Given un klubr avec connected_account existant
  When generateOnboardingLink est appelé
  Then un AccountLink Stripe est créé
  And l'URL d'onboarding est retournée
  And refresh_url pointe vers /payment-setup?refresh=true
  And return_url pointe vers /payment-setup?success=true

Scenario: Compte non créé
  Given un klubr sans connected_account
  When generateOnboardingLink est appelé
  Then une erreur "Compte Stripe non créé" est levée
```

---

## 📐 Implémentation

```typescript
async generateOnboardingLink(klubrId: string): Promise<{ url: string }> {
  const klubr = await strapi.documents('api::klubr.klubr').findOne({
    documentId: klubrId,
    populate: ['connected_account', 'trade_policy'],
  });
  
  if (!klubr.trade_policy?.stripe_connect) {
    throw new Error('Stripe Connect non activé');
  }
  
  if (!klubr.connected_account) {
    throw new Error('Compte Stripe non créé. Veuillez d\'abord créer le compte.');
  }
  
  const accountLink = await stripe.accountLinks.create({
    account: klubr.connected_account.stripe_account_id,
    refresh_url: `${process.env.ADMIN_URL}/payment-setup?refresh=true`,
    return_url: `${process.env.ADMIN_URL}/payment-setup?success=true`,
    type: 'account_onboarding',
  });
  
  return { url: accountLink.url };
}
```

---

## ✅ Definition of Done

- [ ] Endpoint `/stripe-connect/:klubrId/onboarding-link` créé
- [ ] AccountLink Stripe généré
- [ ] URLs de retour configurées
- [ ] Tests
- [ ] PR approuvée et mergée
