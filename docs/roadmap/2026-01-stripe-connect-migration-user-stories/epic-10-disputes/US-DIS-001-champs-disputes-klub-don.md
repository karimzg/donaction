# US-DIS-001 : Ajouter les champs disputes au schéma `klub-don`

> **Epic**: 10 - Disputes | **Priorité**: P1 | **Estimation**: 1 point

## 📋 Description

Ajouter les champs nécessaires pour tracker les litiges Stripe sur chaque don.

## 🎯 Schéma

```json
{
  "attributes": {
    "disputeStatus": {
      "type": "enumeration",
      "enum": [
        "none",
        "warning_received",
        "open",
        "under_review",
        "won",
        "lost"
      ],
      "default": "none"
    },
    "disputeId": {
      "type": "string"
    },
    "disputeReason": {
      "type": "string"
    },
    "disputeClosedAt": {
      "type": "datetime"
    }
  }
}
```

## ✅ Definition of Done

- [ ] Champs ajoutés au schéma
- [ ] Migration générée
- [ ] Index sur disputeStatus
- [ ] PR approuvée et mergée
