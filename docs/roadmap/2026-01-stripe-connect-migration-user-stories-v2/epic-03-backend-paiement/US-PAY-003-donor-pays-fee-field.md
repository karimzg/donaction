# US-PAY-003 : Champ `donor_pays_fee` sur klub-don

> **Epic**: 3 - Backend Paiement | **Priorité**: P0 | **Estimation**: 2 points

## 📋 Description

**En tant que** système,
**Je veux** enregistrer le choix du donateur sur chaque don,
**Afin de** pouvoir recalculer les montants et générer les documents corrects.

## 🎯 Critères d'Acceptation

```gherkin
Scenario: Enregistrement du choix
  Given un don en cours de création
  When le donateur choisit donorPaysFee = false
  Then le champ est sauvegardé sur l'entité klub-don
  And il est immuable après paiement

Scenario: Valeurs calculées stockées
  Given donorPaysFee = false
  When le paiement est confirmé
  Then netAssociationAmount est calculé et stocké
  And applicationFeeAmount est stocké
  And ces valeurs sont utilisées pour le reçu fiscal
```

## 📐 Spécifications Techniques

```json
{
  "donorPaysFee": { "type": "boolean" },
  "netAssociationAmount": { "type": "integer" },
  "applicationFeeAmount": { "type": "integer" },
  "stripeFeesEstimate": { "type": "integer" }
}
```

## ✅ Definition of Done

- [ ] Schéma klub-don mis à jour
- [ ] Migration créée
- [ ] Valeurs calculées lors du paiement
- [ ] Champs immuables après confirmation
