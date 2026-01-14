# US-ONB-007 : Email relance onboarding

> **Epic**: 5 - Onboarding | **Priorité**: P2 | **Estimation**: 2 points

## 📋 Description

Cron job pour relancer les associations avec onboarding incomplet.

```gherkin
Scenario: Relance après 7 jours
  Given un compte avec status = "pending"
  And créé il y a plus de 7 jours
  When le cron s'exécute
  Then un email de relance est envoyé
  And max 3 relances par compte
```
