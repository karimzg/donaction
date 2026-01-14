# US-PAY-002 : Implémenter les 3 modes de `fee_model` avec correction Scénario B

> **Epic**: 3 - Backend Paiement | **Priorité**: P0 | **Estimation**: 8 points

---

## ⚠️ Condition de Garde

```typescript
// Ce calcul ne s'applique QUE si :
klubr.trade_policy.stripe_connect === true
// Sinon, utiliser le calcul Legacy
```

---

## 📋 Description

**En tant que** système backend,
**Je veux** calculer les montants selon le mode de frais configuré,
**Afin que** DONACTION maintienne sa commission de 4% net dans tous les scénarios, y compris quand le donateur ne paie pas les frais.

---

## 🚨 Point Technique Critique : Scénario B

### Problème identifié

Avec Stripe Connect en mode **Destination Charges**, les frais Stripe sont toujours déduits du solde de la **plateforme** (DONACTION), pas du compte connecté.

Avec l'ancienne formule (`application_fee = 4%` seulement) :
- Sur un don de 100€, application_fee = 4€
- Stripe prélève ~1.90€ sur DONACTION
- DONACTION ne reçoit que **2.10€ net** (au lieu de 4€)

### Solution implémentée

L'`application_fee_amount` inclut les frais Stripe estimés :

```
application_fee = commission_DONACTION + frais_Stripe_estimés
```

---

## 🎯 Critères d'Acceptation

```gherkin
Feature: Calcul des montants selon fee_model

  Background:
    Given un klubr avec stripe_connect = true
    And commissionPercentage = 4%

  # SCÉNARIO A : Donor Pays Fee = TRUE
  
  Scenario: Percentage only + Donor Pays Fee = TRUE
    Given fee_model = "percentage_only"
    And donorPaysFee = true
    And montant don = 100€
    And contribution = 10€
    When je calcule les montants
    Then frais_stripe = (114€ × 1.5%) + 0.25€ = 1.96€
    And commission_donaction = 100€ × 4% = 4.00€
    And total_donateur = 100€ + 4€ + 1.96€ + 10€ = 115.96€
    And application_fee = 4.00€ + 1.96€ = 5.96€
    And net_association = 100.00€
    And net_donaction = 10€ + 4€ = 14.00€
    And recu_fiscal = 100.00€

  Scenario: Fixed only + Donor Pays Fee = TRUE
    Given fee_model = "fixed_only"
    And fixed_amount = 5€
    And donorPaysFee = true
    And montant don = 100€
    When je calcule les montants
    Then commission_donaction = 5€
    And le calcul utilise le montant fixe

  Scenario: Percentage plus fixed + Donor Pays Fee = TRUE
    Given fee_model = "percentage_plus_fixed"
    And commissionPercentage = 4%
    And fixed_amount = 1€
    And donorPaysFee = true
    And montant don = 100€
    When je calcule les montants
    Then commission_donaction = (100€ × 4%) + 1€ = 5€
    And les deux composants sont additionnés

  # SCÉNARIO B : Donor Pays Fee = FALSE (CORRIGÉ)
  
  Scenario: Percentage only + Donor Pays Fee = FALSE (FORMULE CORRIGÉE)
    Given fee_model = "percentage_only"
    And donorPaysFee = false
    And montant don = 100€
    And contribution = 10€
    When je calcule les montants
    Then total_preleve = 100€ + 10€ = 110€
    And frais_stripe_estimes = (110€ × 1.5%) + 0.25€ = 1.90€
    And commission_donaction = 100€ × 4% = 4.00€
    And application_fee = 4.00€ + 1.90€ = 5.90€
    And net_association = 100€ - 5.90€ = 94.10€
    And net_donaction_brut = 10€ + 5.90€ = 15.90€
    And net_donaction_apres_stripe = 15.90€ - 1.90€ = 14.00€
    And recu_fiscal = 94.10€

  Scenario: Vérification commission 4% maintenue (Scénario B)
    Given donorPaysFee = false
    And montant don = 100€
    And contribution = 10€
    When le paiement est finalisé
    Then DONACTION reçoit net = 14.00€ (contribution 10€ + commission 4€)
    And la commission effective = 4% du don

  # MODE LEGACY
  
  Scenario: Mode Legacy préservé
    Given klubr.trade_policy.stripe_connect = false
    When je calcule les montants
    Then le calcul utilise l'ancien algorithme
    And aucune application_fee_amount n'est définie
```

---

## 📐 Spécifications Techniques

### Constantes Stripe (France)

```typescript
// constants/stripe.ts
export const STRIPE_FEES = {
  PERCENTAGE: 0.015,  // 1.5% pour cartes européennes
  FIXED: 0.25,        // 0.25€ par transaction
} as const;

export const DONACTION_COMMISSION = {
  DEFAULT_PERCENTAGE: 0.04,  // 4%
} as const;
```

### Interface de calcul

```typescript
interface FeeCalculationInput {
  montantDon: number;           // En centimes
  contribution: number;         // En centimes (contribution volontaire DONACTION)
  donorPaysFee: boolean;
  tradePolicy: {
    fee_model: 'percentage_only' | 'fixed_only' | 'percentage_plus_fixed';
    commissionPercentage: number;
    fixed_amount: number;
    stripe_connect: boolean;
  };
}

interface FeeCalculationOutput {
  totalDonateur: number;        // Ce que le donateur paie
  netAssociation: number;       // Ce que l'association reçoit
  applicationFee: number;       // application_fee_amount pour Stripe
  commissionDonaction: number;  // Commission DONACTION (4%)
  fraisStripeEstimes: number;   // Frais Stripe estimés
  montantRecuFiscal: number;    // Montant pour le reçu fiscal
}
```

### Fonction de calcul principale

```typescript
// helpers/fee-calculation-helper.ts

export function calculateFees(input: FeeCalculationInput): FeeCalculationOutput {
  const { montantDon, contribution, donorPaysFee, tradePolicy } = input;
  
  // ⚠️ CONDITION DE GARDE
  if (!tradePolicy.stripe_connect) {
    return calculateLegacyFees(input);
  }
  
  // 1. Calculer la commission DONACTION selon le fee_model
  const commissionDonaction = calculateCommission(montantDon, tradePolicy);
  
  if (donorPaysFee) {
    // SCÉNARIO A : Le donateur paie les frais séparément
    return calculateScenarioA(montantDon, contribution, commissionDonaction);
  } else {
    // SCÉNARIO B : Les frais sont déduits du don (FORMULE CORRIGÉE)
    return calculateScenarioB(montantDon, contribution, commissionDonaction);
  }
}

function calculateCommission(montantDon: number, tradePolicy: TradePolicy): number {
  switch (tradePolicy.fee_model) {
    case 'percentage_only':
      return Math.round(montantDon * tradePolicy.commissionPercentage);
    case 'fixed_only':
      return tradePolicy.fixed_amount * 100; // Convertir en centimes
    case 'percentage_plus_fixed':
      return Math.round(montantDon * tradePolicy.commissionPercentage) 
             + (tradePolicy.fixed_amount * 100);
    default:
      return Math.round(montantDon * DONACTION_COMMISSION.DEFAULT_PERCENTAGE);
  }
}

function calculateScenarioA(
  montantDon: number, 
  contribution: number, 
  commissionDonaction: number
): FeeCalculationOutput {
  // Total avant frais Stripe
  const subtotal = montantDon + commissionDonaction + contribution;
  
  // Frais Stripe sur le total
  const fraisStripeEstimes = Math.round(subtotal * STRIPE_FEES.PERCENTAGE) + STRIPE_FEES.FIXED * 100;
  
  // Total final pour le donateur
  const totalDonateur = subtotal + fraisStripeEstimes;
  
  // Application fee = commission + frais Stripe (pour que DONACTION paie les frais)
  const applicationFee = commissionDonaction + fraisStripeEstimes;
  
  return {
    totalDonateur,
    netAssociation: montantDon,  // L'association reçoit 100% du don
    applicationFee,
    commissionDonaction,
    fraisStripeEstimes,
    montantRecuFiscal: montantDon,  // Reçu = montant intentionnel
  };
}

function calculateScenarioB(
  montantDon: number, 
  contribution: number, 
  commissionDonaction: number
): FeeCalculationOutput {
  // Total prélevé = don + contribution (pas de frais additionnels visibles)
  const totalDonateur = montantDon + contribution;
  
  // ⚠️ FORMULE CORRIGÉE : Estimer les frais Stripe sur le total prélevé
  const fraisStripeEstimes = Math.round(totalDonateur * STRIPE_FEES.PERCENTAGE) + STRIPE_FEES.FIXED * 100;
  
  // ⚠️ Application fee INCLUT les frais Stripe pour garantir 4% net à DONACTION
  const applicationFee = commissionDonaction + fraisStripeEstimes;
  
  // L'association reçoit le don MOINS l'application fee
  const netAssociation = montantDon - applicationFee;
  
  return {
    totalDonateur,
    netAssociation,
    applicationFee,
    commissionDonaction,
    fraisStripeEstimes,
    montantRecuFiscal: netAssociation,  // Reçu = ce que l'association reçoit réellement
  };
}
```

### Exemple de calcul détaillé (Scénario B)

```
Don: 100€ (10000 centimes) | Contribution: 10€ (1000 centimes)

1. totalDonateur = 10000 + 1000 = 11000 (110€)
2. fraisStripeEstimes = round(11000 × 0.015) + 25 = 165 + 25 = 190 (1.90€)
3. commissionDonaction = 10000 × 0.04 = 400 (4€)
4. applicationFee = 400 + 190 = 590 (5.90€)
5. netAssociation = 10000 - 590 = 9410 (94.10€)
6. montantRecuFiscal = 9410 (94.10€)

Vérification côté DONACTION:
- DONACTION reçoit brut = contribution + applicationFee = 1000 + 590 = 1590 (15.90€)
- Stripe prélève = 190 (1.90€)
- DONACTION net = 1590 - 190 = 1400 (14.00€) ✅
- Commission effective = 400/10000 = 4% ✅
```

---

## 🧪 Tests Unitaires

```typescript
describe('calculateFees', () => {
  describe('Scénario A - Donor Pays Fee = TRUE', () => {
    it('should add fees on top of donation amount', () => {
      const result = calculateFees({
        montantDon: 10000, // 100€
        contribution: 1000, // 10€
        donorPaysFee: true,
        tradePolicy: { fee_model: 'percentage_only', commissionPercentage: 0.04, stripe_connect: true }
      });
      
      expect(result.netAssociation).toBe(10000); // 100€
      expect(result.commissionDonaction).toBe(400); // 4€
      expect(result.montantRecuFiscal).toBe(10000); // 100€
    });
  });
  
  describe('Scénario B - Donor Pays Fee = FALSE (CORRIGÉ)', () => {
    it('should include Stripe fees in application_fee to maintain 4% commission', () => {
      const result = calculateFees({
        montantDon: 10000, // 100€
        contribution: 1000, // 10€
        donorPaysFee: false,
        tradePolicy: { fee_model: 'percentage_only', commissionPercentage: 0.04, stripe_connect: true }
      });
      
      // application_fee = commission (400) + frais Stripe estimés (190) = 590
      expect(result.applicationFee).toBe(590);
      
      // Association reçoit don - application_fee = 10000 - 590 = 9410
      expect(result.netAssociation).toBe(9410);
      
      // Reçu fiscal = montant net reçu par l'association
      expect(result.montantRecuFiscal).toBe(9410);
      
      // Vérification: DONACTION net après déduction Stripe
      // contribution (1000) + applicationFee (590) - fraisStripe (190) = 1400 (14€)
      const netDonaction = result.contribution + result.applicationFee - result.fraisStripeEstimes;
      expect(netDonaction).toBe(1400); // 14€ = 10€ contribution + 4€ commission
    });
    
    it('should ensure DONACTION always receives 4% net commission', () => {
      const testCases = [
        { don: 5000, contribution: 500 },   // 50€ + 5€
        { don: 10000, contribution: 1000 }, // 100€ + 10€
        { don: 50000, contribution: 2500 }, // 500€ + 25€
      ];
      
      testCases.forEach(({ don, contribution }) => {
        const result = calculateFees({
          montantDon: don,
          contribution,
          donorPaysFee: false,
          tradePolicy: { fee_model: 'percentage_only', commissionPercentage: 0.04, stripe_connect: true }
        });
        
        const netDonaction = contribution + result.applicationFee - result.fraisStripeEstimes;
        const expectedCommission = don * 0.04;
        
        // DONACTION doit recevoir contribution + 4% du don
        expect(netDonaction).toBeCloseTo(contribution + expectedCommission, 0);
      });
    });
  });
  
  describe('Mode Legacy', () => {
    it('should use legacy calculation when stripe_connect is false', () => {
      const result = calculateFees({
        montantDon: 10000,
        contribution: 1000,
        donorPaysFee: false,
        tradePolicy: { fee_model: 'percentage_only', commissionPercentage: 0.04, stripe_connect: false }
      });
      
      // Vérifier que le calcul Legacy est utilisé
      expect(result.applicationFee).toBe(0); // Pas d'application_fee en mode Legacy
    });
  });
});
```

---

## 🔗 Dépendances

- **Prérequis**: US-PAY-001 (determineDonorPaysFee)
- **Bloque**: US-PAY-004 (createPaymentIntent), US-FORM-002, US-DOC-003

---

## ✅ Definition of Done

- [ ] Fonction `calculateFees()` implémentée avec les 3 modes
- [ ] Scénario B corrigé pour inclure frais Stripe dans application_fee
- [ ] Condition de garde `stripe_connect === true` présente
- [ ] Tests unitaires couvrant les 2 scénarios × 3 modes = 6 cas
- [ ] Test de non-régression du mode Legacy
- [ ] Vérification que DONACTION maintient 4% net dans tous les cas
- [ ] Documentation des formules ajoutée
- [ ] PR approuvée et mergée
