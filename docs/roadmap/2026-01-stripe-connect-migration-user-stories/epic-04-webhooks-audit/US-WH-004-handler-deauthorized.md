# US-WH-004 : Implémenter le handler `account.application.deauthorized`

> **Epic**: 4 - Webhooks & Audit | **Priorité**: P1 | **Estimation**: 2 points

---

## 📋 Description

**En tant que** système backend,
**Je veux** gérer la déconnexion d'une association de la plateforme,
**Afin de** désactiver la collecte de dons et informer les administrateurs.

---

## 🎯 Critères d'Acceptation

```gherkin
Scenario: Association se déconnecte
  Given un webhook account.application.deauthorized reçu
  When le handler traite l'événement
  Then connected_account.account_status = "disabled"
  And connected_account.charges_enabled = false
  And klubr.donationEligible = false
  And une alerte admin est envoyée
  And une notification email est envoyée au klubr
```

---

## 📐 Implémentation

```typescript
async handleAccountDeauthorized(event: Stripe.Event) {
  const account = event.data.object as Stripe.Account;
  
  const connectedAccount = await strapi.db.query('api::connected-account.connected-account').findOne({
    where: { stripe_account_id: account.id },
    populate: ['klubr'],
  });
  
  if (!connectedAccount) return;
  
  // Désactiver le compte
  await strapi.documents('api::connected-account.connected-account').update({
    documentId: connectedAccount.documentId,
    data: {
      account_status: 'disabled',
      charges_enabled: false,
      payouts_enabled: false,
      last_sync: new Date(),
    },
  });
  
  // Désactiver la collecte pour le klubr
  await strapi.documents('api::klubr.klubr').update({
    documentId: connectedAccount.klubr.documentId,
    data: { donationEligible: false },
  });
  
  // Alertes
  await this.sendAdminAlert({
    type: 'account_deauthorized',
    klubr: connectedAccount.klubr,
  });
  
  console.log(`⚠️ Compte déconnecté: ${account.id}`);
}
```

---

## ✅ Definition of Done

- [ ] Handler implémenté
- [ ] Compte et klubr désactivés
- [ ] Alertes envoyées
- [ ] Tests
- [ ] PR approuvée et mergée
