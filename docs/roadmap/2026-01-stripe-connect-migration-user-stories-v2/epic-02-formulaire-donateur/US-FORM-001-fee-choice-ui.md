# US-FORM-001 : Interface de choix des frais (Step 3)

> **Epic**: 2 - Formulaire Donateur | **Priorité**: P0 | **Estimation**: 3 points

## ⚠️ Condition de Garde

```typescript
if (klubr.trade_policy.stripe_connect === true && 
    klubr.trade_policy.allow_donor_fee_choice === true) {
  // Afficher le choix
}
```

## 📋 Description

**En tant que** donateur,
**Je veux** pouvoir choisir si je prends en charge les frais ou non,
**Afin de** décider du montant final que je paie.

## 🎯 Critères d'Acceptation

```gherkin
Scenario: Affichage du choix
  Given allow_donor_fee_choice = true
  When j'arrive à l'étape 3
  Then je vois deux options radio :
    | Option | Description |
    | "Je prends en charge les frais" | L'association reçoit 100% |
    | "Les frais sont inclus" | Déduction sur le don |

Scenario: Choix masqué si désactivé
  Given allow_donor_fee_choice = false
  When j'arrive à l'étape 3
  Then le choix n'est pas affiché
  And la valeur par défaut s'applique
```

## ✅ Definition of Done

- [ ] Composant Svelte 5 créé
- [ ] Réactif au changement
- [ ] Tests E2E
