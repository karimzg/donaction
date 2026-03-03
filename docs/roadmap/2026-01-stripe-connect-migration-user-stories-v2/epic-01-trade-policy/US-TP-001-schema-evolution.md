# US-TP-001 : Évolution du schéma Trade Policy

> **Epic**: 1 - Trade Policy | **Priorité**: P0 | **Estimation**: 3 points

## 📋 Description

**En tant que** système backend,
**Je veux** étendre le schéma trade_policy avec les nouveaux champs Stripe Connect,
**Afin de** configurer finement le comportement des frais par association.

## 🎯 Critères d'Acceptation

```gherkin
Scenario: Nouveaux champs disponibles
  Given le schéma trade_policy mis à jour
  Then les champs suivants sont disponibles :
    | Champ | Type | Défaut |
    | stripe_connect | boolean | false |
    | donor_pays_fee_project | boolean | true |
    | donor_pays_fee_club | boolean | false |
    | allow_donor_fee_choice | boolean | true |
```

## 📐 Spécifications Techniques

```json
{
  "stripe_connect": { "type": "boolean", "default": false },
  "donor_pays_fee_project": { "type": "boolean", "default": true },
  "donor_pays_fee_club": { "type": "boolean", "default": false },
  "allow_donor_fee_choice": { "type": "boolean", "default": true }
}
```

## ✅ Definition of Done

- [ ] Schéma mis à jour
- [ ] Migration créée
- [ ] Tests de régression
- [ ] Documentation API mise à jour
