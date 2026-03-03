# US-DIS-004 : Alertes Slack/Discord pour nouveaux litiges

> **Epic**: 10 - Disputes | **Priorité**: P2 | **Estimation**: 2 points

## 📋 Description

Envoyer une notification immédiate sur Slack et/ou Discord lors de la création d'un nouveau litige.

## 🎯 Critères d'Acceptation

```gherkin
Scenario: Alerte nouveau litige
  Given un webhook charge.dispute.created reçu
  When le handler traite l'événement
  Then une notification est envoyée sur Slack #alerts-disputes
  And une notification est envoyée sur Discord #litiges
  And le message contient :
    - Association concernée
    - Montant contesté
    - Motif
    - Deadline réponse
    - Lien vers dashboard
```

## 📐 Implémentation

```typescript
async function sendDisputeAlert(dispute: Stripe.Dispute, don: KlubDonEntity) {
  const deadline = new Date(dispute.evidence_details.due_by * 1000);
  
  const message = {
    text: `🚨 Nouveau litige DONACTION`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Association:* ${don.klubr.denomination}\n*Montant:* ${dispute.amount/100}€\n*Motif:* ${dispute.reason}\n*Deadline:* ${formatDate(deadline)}`,
        },
      },
      {
        type: 'actions',
        elements: [{
          type: 'button',
          text: { type: 'plain_text', text: 'Voir dans dashboard' },
          url: `${ADMIN_URL}/disputes/${dispute.id}`,
        }],
      },
    ],
  };
  
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
}
```

## ✅ Definition of Done

- [ ] Intégration Slack webhook
- [ ] Intégration Discord webhook (optionnel)
- [ ] Template message
- [ ] Variables env configurées
- [ ] PR approuvée et mergée
