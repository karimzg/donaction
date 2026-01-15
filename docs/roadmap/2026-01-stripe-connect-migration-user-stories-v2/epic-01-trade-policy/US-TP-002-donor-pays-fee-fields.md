# US-TP-002 : Champs donor_pays_fee différenciés

> **Epic**: 1 - Trade Policy | **Priorité**: P0 | **Estimation**: 2 points

## 📋 Description

**En tant que** administrateur d'association,
**Je veux** configurer des comportements différents pour les dons projet vs club,
**Afin d'** optimiser l'expérience selon le contexte du don.

## 🎯 Critères d'Acceptation

```gherkin
Scenario: Configuration différenciée
  Given une trade_policy avec stripe_connect = true
  When je configure donor_pays_fee_project = true
  And donor_pays_fee_club = false
  Then les dons projet proposent par défaut que le donateur paie les frais
  And les dons club déduisent les frais par défaut
```

## ✅ Definition of Done

- [ ] Champs ajoutés au schéma
- [ ] Interface admin Angular mise à jour
- [ ] Valeurs par défaut appliquées
