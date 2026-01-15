# US-REP-002 : Générer le PDF "Relevé de frais" mensuel

> **Epic**: 9 - Reporting | **Priorité**: P2 | **Estimation**: 5 points

## 📋 Description

Générer automatiquement un PDF récapitulant tous les frais prélevés sur les dons du mois pour chaque association.

## 🎯 Critères d'Acceptation

```gherkin
Scenario: Génération fin de mois
  Given nous sommes le 1er du mois
  When le cron de génération s'exécute
  Then un fee_statement est créé pour chaque association active
  And un PDF est généré avec :
    - En-tête association
    - Période (mois précédent)
    - Tableau des dons avec détail frais
    - Total prélevé
```

## 📐 Structure PDF

```
┌─────────────────────────────────────────────────────────┐
│              RELEVÉ DE FRAIS - DONACTION                │
│                                                         │
│  Association: {klubr.denomination}                      │
│  Période: Janvier 2025                                  │
│                                                         │
│  ┌──────────┬──────────┬────────────┬─────────────┐    │
│  │ Date     │ Donateur │ Don        │ Frais (4%)  │    │
│  ├──────────┼──────────┼────────────┼─────────────┤    │
│  │ 05/01    │ M. Dupon │ 100,00 €   │ 4,00 €      │    │
│  │ 12/01    │ Mme Mart │ 50,00 €    │ 2,00 €      │    │
│  │ ...      │ ...      │ ...        │ ...         │    │
│  ├──────────┼──────────┼────────────┼─────────────┤    │
│  │ TOTAL    │ 15 dons  │ 1 500,00 € │ 60,00 €     │    │
│  └──────────┴──────────┴────────────┴─────────────┘    │
│                                                         │
│  Net reçu par l'association: 1 440,00 €                │
└─────────────────────────────────────────────────────────┘
```

## ✅ Definition of Done

- [ ] Template PDF créé
- [ ] Cron job mensuel (1er du mois, 2h)
- [ ] Génération pour toutes les associations
- [ ] Stockage dans fee_statement
- [ ] PR approuvée et mergée
