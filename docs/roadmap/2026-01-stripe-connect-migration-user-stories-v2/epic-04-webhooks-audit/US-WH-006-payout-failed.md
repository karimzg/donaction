# US-WH-006 : Handler payout.failed

> **Epic**: 4 - Webhooks | **Priorité**: P2 | **Estimation**: 3 points

## 📋 Description

Alerter en cas d'échec de virement vers l'association.

```gherkin
Scenario: Payout échoué
  Given un événement payout.failed
  When je traite l'événement
  Then une alerte Slack est envoyée
  And un email est envoyé au responsable de l'association
  And le statut payout est mis à jour
```
