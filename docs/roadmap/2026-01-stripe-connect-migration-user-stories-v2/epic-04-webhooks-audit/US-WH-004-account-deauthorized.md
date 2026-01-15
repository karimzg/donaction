# US-WH-004 : Handler account.application.deauthorized

> **Epic**: 4 - Webhooks | **Priorité**: P1 | **Estimation**: 2 points

## 📋 Description

Gérer la déconnexion d'un compte Express.

```gherkin
Scenario: Compte déconnecté
  Given un événement account.application.deauthorized
  When je traite l'événement
  Then connected_account.status = "disconnected"
  And l'association ne peut plus recevoir de dons
  And une alerte admin est envoyée
```
