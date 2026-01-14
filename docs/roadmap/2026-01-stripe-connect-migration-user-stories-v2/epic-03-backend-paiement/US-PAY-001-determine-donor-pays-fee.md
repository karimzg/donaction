# US-PAY-001 : Implémenter la logique `determineDonorPaysFee()`

> **Epic**: 3 - Backend Paiement | **Priorité**: P0 | **Estimation**: 5 points

---

## ⚠️ Condition de Garde

```typescript
// Cette logique ne s'applique QUE si :
klubr.trade_policy.stripe_connect === true
// Sinon, utiliser le comportement Legacy
```

---

## 📋 Description

**En tant que** système backend,
**Je veux** déterminer automatiquement si le donateur paie les frais,
**Afin que** le calcul des montants soit cohérent selon le contexte (projet vs club) et le choix du donateur.

---

## 🎯 Critères d'Acceptation

```gherkin
Feature: Détermination du mode Donor Pays Fee

  Background:
    Given un klubr avec stripe_connect = true

  Scenario: Don à un projet (défaut = frais payés par donateur)
    Given un don destiné à un projet
    And trade_policy.donor_pays_fee_project = true
    And le donateur n'a pas fait de choix explicite
    When je calcule determineDonorPaysFee()
    Then le résultat est true
    And les frais Stripe + commission sont ajoutés au montant

  Scenario: Don au club (défaut = frais inclus)
    Given un don destiné au club (pas de projet)
    And trade_policy.donor_pays_fee_club = false
    And le donateur n'a pas fait de choix explicite
    When je calcule determineDonorPaysFee()
    Then le résultat est false
    And le montant saisi est le total (frais déduits de l'association)

  Scenario: Donateur override le défaut
    Given trade_policy.allow_donor_fee_choice = true
    And le donateur a explicitement choisi donorPaysFee = true
    When je calcule determineDonorPaysFee()
    Then le résultat respecte le choix du donateur (true)
    And le défaut du contexte est ignoré

  Scenario: Choix donateur désactivé
    Given trade_policy.allow_donor_fee_choice = false
    And le donateur tente de modifier donorPaysFee
    When je calcule determineDonorPaysFee()
    Then le choix du donateur est ignoré
    And le défaut du contexte s'applique

  Scenario: Mode Legacy (stripe_connect = false)
    Given klubr.trade_policy.stripe_connect = false
    When je calcule determineDonorPaysFee()
    Then le comportement Legacy s'applique
    And la fonction retourne la valeur historique
```

---

## 📐 Spécifications Techniques

### Fonction principale

```typescript
// helpers/fee-calculation-helper.ts

interface DonorPaysFeeParams {
  klubr: Klubr;
  isProjectDon: boolean;
  donorChoice?: boolean | null;
}

export function determineDonorPaysFee(params: DonorPaysFeeParams): boolean {
  const { klubr, isProjectDon, donorChoice } = params;
  const tradePolicy = klubr.trade_policy;
  
  // ⚠️ CONDITION DE GARDE - Mode Legacy
  if (!tradePolicy.stripe_connect) {
    return tradePolicy.donor_pays_fee ?? false; // Legacy behavior
  }
  
  // 1. Récupérer la valeur par défaut selon le contexte
  const defaultValue = isProjectDon 
    ? tradePolicy.donor_pays_fee_project 
    : tradePolicy.donor_pays_fee_club;
  
  // 2. Si le choix donateur est désactivé, retourner le défaut
  if (!tradePolicy.allow_donor_fee_choice) {
    return defaultValue;
  }
  
  // 3. Si le donateur a fait un choix explicite, le respecter
  if (donorChoice !== null && donorChoice !== undefined) {
    return donorChoice;
  }
  
  // 4. Sinon, retourner le défaut
  return defaultValue;
}
```

### Interface TradePolicy étendue

```typescript
interface TradePolicy {
  // Champs existants
  fee_model: 'percentage_only' | 'fixed_only' | 'percentage_plus_fixed';
  commissionPercentage: number;
  fixed_amount: number;
  
  // Nouveaux champs Stripe Connect
  stripe_connect: boolean;
  donor_pays_fee_project: boolean;  // Défaut pour dons projet
  donor_pays_fee_club: boolean;     // Défaut pour dons club
  allow_donor_fee_choice: boolean;  // Autoriser le donateur à choisir
  
  // Legacy (déprécié mais conservé)
  donor_pays_fee?: boolean;
}
```

### Tests unitaires requis

```typescript
describe('determineDonorPaysFee', () => {
  it('should use project default for project donations', () => {
    const result = determineDonorPaysFee({
      klubr: { trade_policy: { stripe_connect: true, donor_pays_fee_project: true }},
      isProjectDon: true,
      donorChoice: null
    });
    expect(result).toBe(true);
  });
  
  it('should use club default for club donations', () => {
    const result = determineDonorPaysFee({
      klubr: { trade_policy: { stripe_connect: true, donor_pays_fee_club: false }},
      isProjectDon: false,
      donorChoice: null
    });
    expect(result).toBe(false);
  });
  
  it('should respect donor choice when allowed', () => {
    const result = determineDonorPaysFee({
      klubr: { trade_policy: { stripe_connect: true, allow_donor_fee_choice: true }},
      isProjectDon: true,
      donorChoice: false
    });
    expect(result).toBe(false);
  });
  
  it('should ignore donor choice when not allowed', () => {
    const result = determineDonorPaysFee({
      klubr: { trade_policy: { stripe_connect: true, allow_donor_fee_choice: false, donor_pays_fee_project: true }},
      isProjectDon: true,
      donorChoice: false
    });
    expect(result).toBe(true);
  });
  
  it('should use legacy behavior when stripe_connect is false', () => {
    const result = determineDonorPaysFee({
      klubr: { trade_policy: { stripe_connect: false, donor_pays_fee: true }},
      isProjectDon: true,
      donorChoice: null
    });
    expect(result).toBe(true);
  });
});
```

---

## 🔗 Dépendances

- **Prérequis**: US-TP-002 (champs donor_pays_fee_* dans trade_policy)
- **Bloque**: US-PAY-002, US-FORM-002

---

## ✅ Definition of Done

- [ ] Fonction `determineDonorPaysFee()` implémentée
- [ ] Condition de garde `stripe_connect === true` présente
- [ ] Comportement Legacy préservé si `stripe_connect === false`
- [ ] Tests unitaires passants (5 cas minimum)
- [ ] Documentation JSDoc ajoutée
- [ ] PR approuvée et mergée
