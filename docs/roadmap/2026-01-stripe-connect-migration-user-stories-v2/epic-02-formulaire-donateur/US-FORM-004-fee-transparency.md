# US-FORM-004 : Transparence totale des frais

> **Epic**: 2 - Formulaire Donateur | **Priorité**: P1 | **Estimation**: 3 points

## 📋 Description

**En tant que** donateur,
**Je veux** comprendre exactement où va mon argent,
**Afin d'** avoir confiance dans la plateforme.

## 🎯 Critères d'Acceptation

```gherkin
Scenario: Décomposition visible
  When je visualise le récapitulatif
  Then je vois la décomposition :
    | Poste | Montant |
    | Don à l'association | 100,00 € |
    | Commission plateforme | 4,00 € |
    | Frais bancaires | 1,90 € |
    | Contribution (optionnelle) | 10,00 € |

Scenario: Tooltip explicatif
  When je clique sur l'icône info
  Then un popup explique chaque ligne de frais
```

## ✅ Definition of Done

- [ ] Décomposition claire
- [ ] Tooltips informatifs
- [ ] Responsive mobile
