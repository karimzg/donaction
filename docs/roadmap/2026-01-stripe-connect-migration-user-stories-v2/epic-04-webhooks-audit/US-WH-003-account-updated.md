# US-WH-003 : Handler account.updated

> **Epic**: 4 - Webhooks | **Priorité**: P0 | **Estimation**: 3 points

## 📋 Description

Synchroniser le statut KYC lors des mises à jour du compte connecté.

```gherkin
Scenario: KYC complété
  Given un événement account.updated
  And capabilities.card_payments = active
  And capabilities.transfers = active
  When je traite l'événement
  Then connected_account.status = "active"
  And l'association peut recevoir des dons
```
