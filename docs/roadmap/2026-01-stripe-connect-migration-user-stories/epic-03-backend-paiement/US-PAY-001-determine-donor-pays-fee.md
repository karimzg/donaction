# US-PAY-001 : Implémenter la logique `determineDonorPaysFee()`

> **Epic**: 3 - Backend Paiement | **Priorité**: P0 | **Estimation**: 3 points

---

## ⚠️ Condition de Garde

```typescript
// Cette logique ne s'applique QUE si :
klubr.trade_policy.stripe_connect === true
```

Si `stripe_connect === false`, cette fonction n'est pas appelée.

---

## 📋 Description

**En tant que** système backend,
**Je veux** une fonction qui détermine si le donateur paie les frais,
**Afin de** calculer correctement le montant du PaymentIntent et l'application_fee.

---

## 🎯 Critères d'Acceptation

### Scénario 1 : Choix explicite du donateur prioritaire

```gherkin
Given trade_policy.stripe_connect = true
And trade_policy.allow_donor_fee_choice = true
And le donateur a fait un choix explicite (donorPaysFee = false)
When determineDonorPaysFee est appelé
Then la fonction retourne false (choix du donateur)
```

### Scénario 2 : Valeur par défaut pour don projet

```gherkin
Given trade_policy.stripe_connect = true
And trade_policy.donor_pays_fee_project = true
And le don est lié à un projet (klub_projet != null)
And aucun choix explicite du donateur (donorChoice = null)
When determineDonorPaysFee est appelé
Then la fonction retourne true
```

### Scénario 3 : Valeur par défaut pour don club

```gherkin
Given trade_policy.stripe_connect = true
And trade_policy.donor_pays_fee_club = false
And le don est pour le club (klub_projet = null)
And aucun choix explicite du donateur
When determineDonorPaysFee est appelé
Then la fonction retourne false
```

### Scénario 4 : Choix non autorisé - ignorer donorChoice

```gherkin
Given trade_policy.stripe_connect = true
And trade_policy.allow_donor_fee_choice = false
And le donateur a fourni donorChoice = false
And le don est pour un projet
When determineDonorPaysFee est appelé
Then la fonction retourne donor_pays_fee_project (ignore le choix)
```

---

## 📐 Spécifications Techniques

### Fichier à créer

```
donaction-api/src/api/klub-don-payment/helpers/fee-calculation-helper.ts
```

### Implémentation

```typescript
// fee-calculation-helper.ts

import type { TradePolicyEntity } from '../../../../types/generated/components';

export interface FeeContext {
  tradePolicy: TradePolicyEntity;
  isProjectDonation: boolean;      // true si klub_projet est défini
  donorChoice: boolean | null;     // Choix explicite du donateur (null = pas de choix)
}

/**
 * Détermine si le donateur paie les frais
 * 
 * Priorité :
 * 1. Choix explicite du donateur (si autorisé)
 * 2. Valeur par défaut selon le type de don (projet vs club)
 * 
 * @throws Error si stripe_connect n'est pas activé
 */
export function determineDonorPaysFee(context: FeeContext): boolean {
  const { tradePolicy, isProjectDonation, donorChoice } = context;
  
  // Condition de garde
  if (!tradePolicy.stripe_connect) {
    throw new Error('determineDonorPaysFee ne doit être appelé que si stripe_connect === true');
  }
  
  // 1. Si le donateur a fait un choix explicite ET que c'est autorisé
  if (donorChoice !== null && tradePolicy.allow_donor_fee_choice) {
    return donorChoice;
  }
  
  // 2. Sinon, utiliser la valeur par défaut selon le type de don
  return isProjectDonation 
    ? (tradePolicy.donor_pays_fee_project ?? true)
    : (tradePolicy.donor_pays_fee_club ?? false);
}

/**
 * Calcule l'application_fee_amount pour Stripe Connect
 * 
 * @param amountInCents - Montant du don en centimes
 * @param tradePolicy - Politique commerciale du klubr
 * @returns Montant de l'application fee en centimes
 */
export function calculateApplicationFee(
  amountInCents: number,
  tradePolicy: TradePolicyEntity
): number {
  // Condition de garde
  if (!tradePolicy.stripe_connect) {
    throw new Error('calculateApplicationFee ne doit être appelé que si stripe_connect === true');
  }
  
  const feeModel = tradePolicy.fee_model ?? 'percentage_only';
  const commissionPercentage = tradePolicy.commissionPercentage ?? 4;
  const fixedAmount = tradePolicy.fixed_amount ?? 0;
  
  let fee = 0;
  
  switch (feeModel) {
    case 'percentage_only':
      fee = Math.round(amountInCents * (commissionPercentage / 100));
      break;
      
    case 'fixed_only':
      fee = Math.round(fixedAmount * 100); // Convertir € en centimes
      break;
      
    case 'percentage_plus_fixed':
      fee = Math.round(amountInCents * (commissionPercentage / 100) + fixedAmount * 100);
      break;
      
    default:
      fee = Math.round(amountInCents * (commissionPercentage / 100));
  }
  
  return fee;
}
```

### Tests unitaires

```typescript
// fee-calculation-helper.test.ts

import { describe, it, expect } from 'vitest';
import { determineDonorPaysFee, calculateApplicationFee } from './fee-calculation-helper';

describe('determineDonorPaysFee', () => {
  const baseTradePolicy = {
    stripe_connect: true,
    allow_donor_fee_choice: true,
    donor_pays_fee_project: true,
    donor_pays_fee_club: false,
    commissionPercentage: 4,
  };
  
  it('should return donor choice when allowed', () => {
    const result = determineDonorPaysFee({
      tradePolicy: baseTradePolicy,
      isProjectDonation: true,
      donorChoice: false,
    });
    expect(result).toBe(false);
  });
  
  it('should return project default when no donor choice', () => {
    const result = determineDonorPaysFee({
      tradePolicy: baseTradePolicy,
      isProjectDonation: true,
      donorChoice: null,
    });
    expect(result).toBe(true);
  });
  
  it('should return club default when no donor choice', () => {
    const result = determineDonorPaysFee({
      tradePolicy: baseTradePolicy,
      isProjectDonation: false,
      donorChoice: null,
    });
    expect(result).toBe(false);
  });
  
  it('should ignore donor choice when not allowed', () => {
    const result = determineDonorPaysFee({
      tradePolicy: { ...baseTradePolicy, allow_donor_fee_choice: false },
      isProjectDonation: true,
      donorChoice: false,
    });
    expect(result).toBe(true); // Ignore le choix, utilise default projet
  });
  
  it('should throw if stripe_connect is false', () => {
    expect(() => determineDonorPaysFee({
      tradePolicy: { ...baseTradePolicy, stripe_connect: false },
      isProjectDonation: true,
      donorChoice: null,
    })).toThrow();
  });
});

describe('calculateApplicationFee', () => {
  it('should calculate percentage only', () => {
    const fee = calculateApplicationFee(10000, {
      stripe_connect: true,
      fee_model: 'percentage_only',
      commissionPercentage: 4,
    });
    expect(fee).toBe(400); // 4% de 100€
  });
  
  it('should calculate fixed only', () => {
    const fee = calculateApplicationFee(10000, {
      stripe_connect: true,
      fee_model: 'fixed_only',
      fixed_amount: 2.5,
    });
    expect(fee).toBe(250); // 2.50€
  });
  
  it('should calculate percentage plus fixed', () => {
    const fee = calculateApplicationFee(10000, {
      stripe_connect: true,
      fee_model: 'percentage_plus_fixed',
      commissionPercentage: 4,
      fixed_amount: 0.5,
    });
    expect(fee).toBe(450); // 4€ + 0.50€
  });
});
```

---

## 🔗 Dépendances

| Type | US | Description |
|------|-----|-------------|
| Requiert | US-TP-001 | Nouveaux champs trade_policy |
| Bloque | US-PAY-004 | Création PaymentIntent avec application_fee |

---

## ✅ Definition of Done

- [ ] Helper `fee-calculation-helper.ts` créé
- [ ] Condition de garde `stripe_connect === true` implémentée
- [ ] Tests unitaires avec 100% coverage sur les fonctions
- [ ] Documentation JSDoc complète
- [ ] PR approuvée et mergée

---

## 📝 Notes

- Les montants sont toujours en centimes pour Stripe
- La fonction doit être pure (pas d'effets de bord)
- Prévoir des valeurs par défaut robustes pour les champs nullables
