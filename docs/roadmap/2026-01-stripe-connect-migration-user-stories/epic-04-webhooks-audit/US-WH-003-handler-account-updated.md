# US-WH-003 : Implémenter le handler `account.updated`

> **Epic**: 4 - Webhooks & Audit | **Priorité**: P0 | **Estimation**: 3 points

---

## 📋 Description

**En tant que** système backend,
**Je veux** synchroniser le statut KYC des comptes connectés lors des événements `account.updated`,
**Afin de** savoir en temps réel si une association peut recevoir des paiements.

---

## 🎯 Critères d'Acceptation

```gherkin
Scenario: Compte activé (KYC complet)
  Given un webhook account.updated reçu
  And charges_enabled = true
  And payouts_enabled = true
  When le handler traite l'événement
  Then connected_account est mis à jour :
    | charges_enabled      | true      |
    | payouts_enabled      | true      |
    | account_status       | active    |
    | verification_status  | verified  |
    | onboarding_completed | true      |
    | last_sync            | now()     |

Scenario: KYC incomplet
  Given un webhook account.updated reçu
  And requirements.currently_due contient des éléments
  When le handler traite l'événement
  Then connected_account.account_status = "pending"
  And connected_account.verification_status = "pending"
  And les requirements sont stockés dans capabilities JSON

Scenario: Compte restreint
  Given un webhook account.updated reçu
  And charges_enabled = false
  And requirements.disabled_reason existe
  When le handler traite l'événement
  Then connected_account.account_status = "restricted"
  And une alerte admin est envoyée
```

---

## 📐 Implémentation

```typescript
// api/stripe-connect/controllers/stripe-connect.ts

async handleAccountUpdated(event: Stripe.Event) {
  const account = event.data.object as Stripe.Account;
  
  // Trouver le connected_account correspondant
  const connectedAccount = await strapi.db.query('api::connected-account.connected-account').findOne({
    where: { stripe_account_id: account.id },
    populate: ['klubr'],
  });
  
  if (!connectedAccount) {
    console.warn(`⚠️ Connected account non trouvé: ${account.id}`);
    return;
  }
  
  // Déterminer le statut
  let accountStatus = 'pending';
  let verificationStatus = 'pending';
  
  if (account.charges_enabled && account.payouts_enabled) {
    accountStatus = 'active';
    verificationStatus = 'verified';
  } else if (account.requirements?.disabled_reason) {
    accountStatus = 'restricted';
    verificationStatus = 'unverified';
  }
  
  // Mettre à jour
  await strapi.documents('api::connected-account.connected-account').update({
    documentId: connectedAccount.documentId,
    data: {
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      account_status: accountStatus,
      verification_status: verificationStatus,
      onboarding_completed: account.details_submitted,
      capabilities: account.capabilities,
      requirements_current: account.requirements?.currently_due || [],
      requirements_pending: account.requirements?.pending_verification || [],
      disabled_reason: account.requirements?.disabled_reason || null,
      last_sync: new Date(),
    },
  });
  
  console.log(`✅ Connected account ${account.id} synced: ${accountStatus}`);
  
  // Alerte si compte restreint
  if (accountStatus === 'restricted') {
    await this.sendAdminAlert({
      type: 'account_restricted',
      klubr: connectedAccount.klubr,
      reason: account.requirements?.disabled_reason,
    });
  }
}
```

---

## ✅ Definition of Done

- [ ] Handler implémenté
- [ ] Tous les champs synchronisés
- [ ] Alerte admin pour comptes restreints
- [ ] Tests avec différents statuts
- [ ] PR approuvée et mergée
