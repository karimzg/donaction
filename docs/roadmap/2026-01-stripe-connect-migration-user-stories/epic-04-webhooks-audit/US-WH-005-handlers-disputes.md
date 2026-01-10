# US-WH-005 : Implémenter les handlers disputes

> **Epic**: 4 - Webhooks & Audit | **Priorité**: P1 | **Estimation**: 5 points

---

## 📋 Description

**En tant que** système backend,
**Je veux** gérer les litiges Stripe (disputes) pour protéger les associations,
**Afin de** réagir rapidement et limiter les pertes financières.

---

## 🎯 Critères d'Acceptation

```gherkin
Scenario: Litige créé
  Given un webhook charge.dispute.created reçu
  When le handler traite l'événement
  Then klub_don.disputeStatus = "open"
  And klub_don.disputeId = dispute.id
  And klub_don.disputeReason = dispute.reason
  And une alerte admin urgente est envoyée
  And un reverse transfer est créé si nécessaire

Scenario: Litige mis à jour
  Given un webhook charge.dispute.updated reçu
  When le statut change à "under_review"
  Then klub_don.disputeStatus = "under_review"

Scenario: Litige fermé (gagné)
  Given un webhook charge.dispute.closed reçu
  And dispute.status = "won"
  When le handler traite l'événement
  Then klub_don.disputeStatus = "won"
  And klub_don.disputeClosedAt = now()

Scenario: Litige fermé (perdu)
  Given un webhook charge.dispute.closed reçu
  And dispute.status = "lost"
  When le handler traite l'événement
  Then klub_don.disputeStatus = "lost"
  And le montant est définitivement perdu
  And une notification est envoyée à l'association
```

---

## 📐 Implémentation

```typescript
async handleDispute(event: Stripe.Event) {
  const dispute = event.data.object as Stripe.Dispute;
  const paymentIntentId = dispute.payment_intent as string;
  
  // Trouver le don correspondant
  const payment = await strapi.db.query('api::klub-don-payment.klub-don-payment').findOne({
    where: { intent_id: paymentIntentId },
    populate: { klub_don: { populate: ['klubr'] } },
  });
  
  if (!payment?.klub_don) {
    console.warn(`⚠️ Don non trouvé pour dispute: ${dispute.id}`);
    return;
  }
  
  const klubDon = payment.klub_don;
  
  // Mapper le statut
  const statusMap = {
    'warning_needs_response': 'warning_received',
    'warning_under_review': 'warning_received',
    'warning_closed': 'none',
    'needs_response': 'open',
    'under_review': 'under_review',
    'won': 'won',
    'lost': 'lost',
  };
  
  const disputeStatus = statusMap[dispute.status] || 'open';
  
  // Mettre à jour le don
  await strapi.documents('api::klub-don.klub-don').update({
    documentId: klubDon.documentId,
    data: {
      disputeStatus,
      disputeId: dispute.id,
      disputeReason: dispute.reason,
      disputeClosedAt: ['won', 'lost'].includes(disputeStatus) ? new Date() : null,
    },
  });
  
  // Actions selon le type d'événement
  if (event.type === 'charge.dispute.created') {
    await this.sendDisputeAlert({
      type: 'dispute_created',
      don: klubDon,
      dispute,
      deadline: new Date(dispute.evidence_details.due_by * 1000),
    });
    
    // Reverser le transfer si nécessaire
    if (dispute.amount > 0) {
      await this.reverseTransferForDispute(klubDon, dispute);
    }
  }
  
  if (event.type === 'charge.dispute.closed' && dispute.status === 'lost') {
    await this.sendDisputeAlert({
      type: 'dispute_lost',
      don: klubDon,
      dispute,
    });
  }
  
  console.log(`📋 Dispute ${dispute.id} traité: ${disputeStatus}`);
}
```

---

## 🔗 Dépendances

| Type | US | Description |
|------|-----|-------------|
| Requiert | US-DIS-001 | Champs disputes dans klub-don |
| Bloque | US-DIS-002 | Reverse transfer |

---

## ✅ Definition of Done

- [ ] Handler pour les 3 événements disputes
- [ ] Mise à jour du statut klub_don
- [ ] Alertes admin
- [ ] Reverse transfer si litige ouvert
- [ ] Tests avec Stripe CLI
- [ ] PR approuvée et mergée
