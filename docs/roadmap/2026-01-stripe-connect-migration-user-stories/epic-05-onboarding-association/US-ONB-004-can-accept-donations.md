# US-ONB-004 : Implémenter `canAcceptDonations()`

> **Epic**: 5 - Onboarding Association | **Priorité**: P0 | **Estimation**: 3 points

---

## ⚠️ Condition de Garde

Pour les klubrs avec `stripe_connect === true`, des vérifications supplémentaires sont requises.

---

## 📋 Description

**En tant que** système,
**Je veux** une fonction centralisée qui vérifie tous les prérequis pour recevoir des dons,
**Afin de** bloquer les tentatives de paiement vers des comptes non activés.

---

## 🎯 Critères d'Acceptation

```gherkin
Scenario: Association éligible (Stripe Connect)
  Given trade_policy.stripe_connect = true
  And requiredFieldsCompletion = 100%
  And requiredDocsValidatedCompletion = 100%
  And donationEligible = true
  And connected_account.charges_enabled = true
  When canAcceptDonations est appelé
  Then eligible = true
  And reasons = []

Scenario: Compte Stripe non activé
  Given trade_policy.stripe_connect = true
  And connected_account.charges_enabled = false
  When canAcceptDonations est appelé
  Then eligible = false
  And reasons contient "Paiements non activés sur Stripe"

Scenario: Mode Legacy
  Given trade_policy.stripe_connect = false
  And donationEligible = true
  When canAcceptDonations est appelé
  Then eligible = true (pas de vérification Stripe)
```

---

## 📐 Implémentation

```typescript
interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
}

function canAcceptDonations(klubr: KlubrEntity): EligibilityResult {
  const reasons: string[] = [];
  const isStripeConnect = klubr.trade_policy?.stripe_connect === true;
  
  // Vérifications communes
  if (klubr.requiredFieldsCompletion < 100) {
    reasons.push(`Informations incomplètes (${klubr.requiredFieldsCompletion}%)`);
  }
  if (klubr.requiredDocsValidatedCompletion < 100) {
    reasons.push(`Documents non validés (${klubr.requiredDocsValidatedCompletion}%)`);
  }
  if (!klubr.donationEligible) {
    reasons.push('Collecte de dons non activée');
  }
  if (klubr.status !== 'published') {
    reasons.push('Profil non publié');
  }
  
  // Vérifications Stripe Connect (CONDITION DE GARDE)
  if (isStripeConnect) {
    const connectedAccount = klubr.connected_account;
    
    if (!connectedAccount) {
      reasons.push('Compte Stripe non créé');
    } else {
      if (!connectedAccount.charges_enabled) {
        reasons.push('Paiements non activés sur Stripe');
      }
      if (connectedAccount.account_status === 'restricted') {
        reasons.push('Compte Stripe restreint');
      }
      if (connectedAccount.account_status === 'disabled') {
        reasons.push('Compte Stripe désactivé');
      }
    }
    
    // Signature requise pour Stripe Connect
    if (!klubr.managerSignature) {
      reasons.push('Signature du responsable manquante');
    }
  }
  
  return {
    eligible: reasons.length === 0,
    reasons,
  };
}
```

---

## ✅ Definition of Done

- [ ] Fonction canAcceptDonations créée
- [ ] Toutes les vérifications implémentées
- [ ] Différenciation Connect / Legacy
- [ ] Tests unitaires exhaustifs
- [ ] PR approuvée et mergée
