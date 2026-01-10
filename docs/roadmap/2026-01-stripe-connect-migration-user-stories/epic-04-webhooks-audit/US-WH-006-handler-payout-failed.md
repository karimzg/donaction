# US-WH-006 : Implémenter le handler `payout.failed`

> **Epic**: 4 - Webhooks & Audit | **Priorité**: P2 | **Estimation**: 2 points

---

## 📋 Description

**En tant que** système backend,
**Je veux** être alerté lorsqu'un virement vers une association échoue,
**Afin de** réagir rapidement et aider l'association à corriger ses coordonnées bancaires.

---

## 🎯 Critères d'Acceptation

```gherkin
Scenario: Payout échoué
  Given un webhook payout.failed reçu
  When le handler traite l'événement
  Then une alerte admin est envoyée avec :
    | Champ           | Valeur                    |
    | Association     | klubr.denomination        |
    | Montant         | payout.amount             |
    | Raison          | payout.failure_message    |
  And une notification email est envoyée à l'association
  And le statut est loggé pour suivi
```

---

## 📐 Implémentation

```typescript
async handlePayoutFailed(event: Stripe.Event) {
  const payout = event.data.object as Stripe.Payout;
  
  // Trouver l'association
  const connectedAccount = await strapi.db.query('api::connected-account.connected-account').findOne({
    where: { stripe_account_id: event.account },
    populate: ['klubr', 'klubr.leaders'],
  });
  
  if (!connectedAccount) return;
  
  // Alerter admin
  await this.sendAdminAlert({
    type: 'payout_failed',
    klubr: connectedAccount.klubr,
    amount: payout.amount / 100,
    reason: payout.failure_message,
    payoutId: payout.id,
  });
  
  // Notifier l'association
  for (const leader of connectedAccount.klubr.leaders) {
    await sendBrevoTransacEmail({
      to: [{ email: leader.email }],
      templateId: BREVO_TEMPLATES.PAYOUT_FAILED,
      params: {
        LEADER_NAME: `${leader.prenom} ${leader.nom}`,
        CLUB_NAME: connectedAccount.klubr.denomination,
        AMOUNT: formatCurrency(payout.amount / 100),
        REASON: payout.failure_message,
      },
    });
  }
  
  console.log(`❌ Payout échoué pour ${connectedAccount.klubr.denomination}: ${payout.failure_message}`);
}
```

---

## ✅ Definition of Done

- [ ] Handler implémenté
- [ ] Alerte admin avec détails
- [ ] Email aux leaders de l'association
- [ ] Template email créé dans Brevo
- [ ] PR approuvée et mergée
