# US-TP-003 : Script de migration des trade_policies existantes

> **Epic**: 1 - Trade Policy | **Priorité**: P0 | **Estimation**: 3 points

## 📋 Description

**En tant que** système,
**Je veux** migrer les trade_policies existantes vers le nouveau format,
**Afin que** les associations existantes ne soient pas impactées.

## 🎯 Critères d'Acceptation

```gherkin
Scenario: Migration sans impact
  Given des trade_policies existantes avec donor_pays_fee = true
  When la migration s'exécute
  Then stripe_connect = false pour toutes
  And donor_pays_fee_project = ancien donor_pays_fee
  And donor_pays_fee_club = ancien donor_pays_fee
  And le comportement Legacy est préservé
```

## ✅ Definition of Done

- [ ] Script de migration créé
- [ ] Rollback possible
- [ ] Tests sur copie de prod
- [ ] Exécution en staging validée
