# US-FORM-003 : Affichage infos association (Stripe Connect)

> **Epic**: 2 - Formulaire Donateur | **Priorité**: P1 | **Estimation**: 2 points

## ⚠️ Condition de Garde

```typescript
if (klubr.trade_policy.stripe_connect === true) {
  // Afficher le nom de l'association comme bénéficiaire
}
```

## 📋 Description

**En tant que** donateur,
**Je veux** voir clairement le nom de l'association bénéficiaire,
**Afin de** savoir à qui va mon don directement.

## 🎯 Critères d'Acceptation

```gherkin
Scenario: Affichage bénéficiaire
  Given stripe_connect = true
  When je visualise le récapitulatif
  Then je vois "Bénéficiaire : FC Lyon"
  And le logo de l'association est affiché
  And la mention "Paiement sécurisé via DONACTION" apparaît
```

## ✅ Definition of Done

- [ ] Nom association affiché
- [ ] Logo association intégré
- [ ] Mention plateforme visible
