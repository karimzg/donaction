# US-DOC-003 : Calculer le montant du reçu fiscal selon `donorPaysFee`

> **Epic**: 6 - Documents Fiscaux | **Priorité**: P0 | **Estimation**: 3 points

---

## ⚠️ Condition de Garde

```typescript
// Ce calcul ne s'applique QUE si :
klubr.trade_policy.stripe_connect === true
// Sinon, utiliser le calcul Legacy
```

---

## 📋 Description

**En tant que** système de génération de documents,
**Je veux** calculer correctement le montant du reçu fiscal selon le mode de prise en charge des frais,
**Afin que** le reçu soit conforme aux exigences Cerfa et reflète exactement ce que l'association a réellement reçu.

---

## 🚨 Règle Fiscale Fondamentale

> **Le reçu fiscal doit TOUJOURS correspondre au montant effectivement reçu par l'association.**

Cette règle est imposée par l'administration fiscale française pour les reçus Cerfa. Un reçu ne peut pas mentionner un montant supérieur à ce que l'association a réellement encaissé.

---

## 🎯 Critères d'Acceptation

```gherkin
Feature: Calcul du montant du reçu fiscal

  Background:
    Given un klubr avec stripe_connect = true
    And le don a été validé par Stripe

  # SCÉNARIO A : Donor Pays Fee = TRUE
  
  Scenario: Reçu fiscal = montant intentionnel (Scénario A)
    Given un don de 100€
    And donorPaysFee = true
    And l'association a reçu 100€ (100% du don)
    When je génère le reçu fiscal
    Then le montant indiqué est 100,00 €
    And la mention "Montant du don" apparaît
    And le donateur peut déduire 66€ (particulier) ou 60€ (entreprise)

  # SCÉNARIO B : Donor Pays Fee = FALSE (FORMULE CORRIGÉE)
  
  Scenario: Reçu fiscal = montant net reçu (Scénario B)
    Given un don de 100€
    And contribution = 10€
    And donorPaysFee = false
    And les frais déduits sont de 5,90€ (4€ commission + 1,90€ Stripe)
    And l'association a reçu 94,10€
    When je génère le reçu fiscal
    Then le montant indiqué est 94,10 €
    And la mention "Montant net reçu par l'association" apparaît
    And le donateur peut déduire 62,11€ (particulier)

  Scenario: Vérification cohérence avec Stripe
    Given un don finalisé avec PaymentIntent.status = "succeeded"
    And transfer.amount = 9410 (94,10€)
    When je génère le reçu fiscal
    Then le montant du reçu = transfer.amount
    And une incohérence génère une alerte

  # VALIDATION
  
  Scenario: Blocage si montant incohérent
    Given un don avec donorPaysFee = false
    And montant calculé reçu fiscal = 94,10€
    And montant transfer Stripe = 95,00€
    When je tente de générer le reçu fiscal
    Then une erreur est levée "Incohérence montant reçu fiscal"
    And le reçu n'est pas généré
    And une alerte admin est envoyée

  # MODE LEGACY
  
  Scenario: Mode Legacy préservé
    Given klubr.trade_policy.stripe_connect = false
    When je calcule le montant du reçu fiscal
    Then le calcul utilise l'ancien algorithme
```

---

## 📐 Spécifications Techniques

### Fonction de calcul

```typescript
// helpers/fiscal-receipt-helper.ts

interface ReceiptAmountInput {
  klubDon: KlubDon;
  klubr: Klubr;
  paymentIntent?: Stripe.PaymentIntent;
  transfer?: Stripe.Transfer;
}

interface ReceiptAmountOutput {
  montantRecuFiscal: number;  // En centimes
  label: string;              // Label pour le PDF
  deductionParticulier: number;
  deductionEntreprise: number;
}

export function calculateReceiptAmount(input: ReceiptAmountInput): ReceiptAmountOutput {
  const { klubDon, klubr, transfer } = input;
  const tradePolicy = klubr.trade_policy;
  
  // ⚠️ CONDITION DE GARDE
  if (!tradePolicy.stripe_connect) {
    return calculateLegacyReceiptAmount(input);
  }
  
  let montantRecuFiscal: number;
  let label: string;
  
  if (klubDon.donorPaysFee) {
    // SCÉNARIO A : Le donateur a payé les frais séparément
    // L'association reçoit 100% du montant intentionnel
    montantRecuFiscal = klubDon.amount; // Montant du don en centimes
    label = "Montant du don";
  } else {
    // SCÉNARIO B : Les frais ont été déduits du don
    // L'association reçoit le montant net après déduction
    montantRecuFiscal = klubDon.netAssociationAmount;
    label = "Montant net reçu par l'association";
  }
  
  // Vérification de cohérence avec Stripe
  if (transfer && transfer.amount !== montantRecuFiscal) {
    throw new FiscalInconsistencyError(
      `Incohérence montant reçu fiscal: calculé=${montantRecuFiscal}, transfer=${transfer.amount}`,
      { klubDonId: klubDon.id, expected: montantRecuFiscal, actual: transfer.amount }
    );
  }
  
  // Calcul des déductions fiscales
  const deductionParticulier = Math.round(montantRecuFiscal * 0.66);
  const deductionEntreprise = Math.round(montantRecuFiscal * 0.60);
  
  return {
    montantRecuFiscal,
    label,
    deductionParticulier,
    deductionEntreprise,
  };
}
```

### Mise à jour du schéma `klub-don`

```json
// api/klub-don/content-types/klub-don/schema.json
{
  "attributes": {
    // ... champs existants ...
    
    "netAssociationAmount": {
      "type": "integer",
      "description": "Montant net reçu par l'association (en centimes). Calculé lors du paiement."
    },
    "receiptAmount": {
      "type": "integer", 
      "description": "Montant figurant sur le reçu fiscal (en centimes). = netAssociationAmount"
    },
    "receiptLabel": {
      "type": "string",
      "enum": ["Montant du don", "Montant net reçu par l'association"],
      "description": "Label affiché sur le reçu fiscal"
    }
  }
}
```

### Intégration dans le générateur PDF

```typescript
// helpers/generateCertificate.ts

export async function generateFiscalReceipt(klubDon: KlubDon, klubr: Klubr): Promise<Buffer> {
  const tradePolicy = klubr.trade_policy;
  
  // ⚠️ CONDITION DE GARDE
  if (!tradePolicy.stripe_connect) {
    return generateLegacyFiscalReceipt(klubDon, klubr);
  }
  
  const { montantRecuFiscal, label, deductionParticulier } = calculateReceiptAmount({
    klubDon,
    klubr,
  });
  
  const templateData = {
    // Informations association (émetteur)
    associationName: klubr.name,
    associationAddress: formatAddress(klubr.address),
    associationSiren: klubr.siren,
    managerName: klubr.managerName,
    managerSignature: klubr.managerSignature?.url,
    
    // Informations donateur
    donorName: formatDonorName(klubDon.klubDonateur),
    donorAddress: formatAddress(klubDon.klubDonateur.address),
    
    // Montants
    amount: formatCurrency(montantRecuFiscal),
    amountLabel: label,
    amountInWords: numberToWords(montantRecuFiscal / 100),
    
    // Déductions
    deductionInfo: `Soit une réduction d'impôt de ${formatCurrency(deductionParticulier)}`,
    
    // Métadonnées
    receiptNumber: generateReceiptNumber(klubDon),
    receiptDate: formatDate(new Date()),
    donationDate: formatDate(klubDon.paymentDate),
    
    // Mentions légales
    legalMentions: CERFA_LEGAL_MENTIONS,
  };
  
  return renderPdfTemplate('fiscal-receipt-cerfa', templateData);
}
```

### Exemple de reçu généré (Scénario B)

```
┌────────────────────────────────────────────────────────────────┐
│                    REÇU AU TITRE DES DONS                      │
│              À DES ORGANISMES D'INTÉRÊT GÉNÉRAL               │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ORGANISME BÉNÉFICIAIRE                                        │
│  ───────────────────────                                       │
│  FC Lyon - Association sportive loi 1901                       │
│  12 rue du Stade, 69000 Lyon                                   │
│  SIREN : 123 456 789                                           │
│                                                                │
│  DONATEUR                                                      │
│  ────────                                                      │
│  M. Jean DUPONT                                                │
│  45 avenue de la République, 69001 Lyon                        │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  MONTANT NET REÇU PAR L'ASSOCIATION                           │
│                                                                │
│           94,10 € (quatre-vingt-quatorze euros                │
│                    et dix centimes)                            │
│                                                                │
│  Date du don : 11/01/2026                                      │
│  Numéro de reçu : 2026-FC-LYON-00042                          │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Ce don ouvre droit à une réduction d'impôt de 62,11 €        │
│  (66% du montant pour un particulier)                          │
│                                                                │
│  Le présent reçu est établi conformément aux articles          │
│  200 et 238 bis du Code général des impôts.                   │
│                                                                │
│                                                                │
│  Fait à Lyon, le 11/01/2026                                    │
│                                                                │
│  Le responsable de l'association,                              │
│  [Signature]                                                   │
│  Pierre MARTIN, Président                                      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 🧪 Tests

```typescript
describe('calculateReceiptAmount', () => {
  describe('Scénario A - Donor Pays Fee = TRUE', () => {
    it('should use donation amount as receipt amount', () => {
      const result = calculateReceiptAmount({
        klubDon: { amount: 10000, donorPaysFee: true },
        klubr: { trade_policy: { stripe_connect: true } },
      });
      
      expect(result.montantRecuFiscal).toBe(10000);
      expect(result.label).toBe("Montant du don");
    });
  });
  
  describe('Scénario B - Donor Pays Fee = FALSE', () => {
    it('should use net association amount as receipt amount', () => {
      const result = calculateReceiptAmount({
        klubDon: { 
          amount: 10000, 
          donorPaysFee: false,
          netAssociationAmount: 9410 
        },
        klubr: { trade_policy: { stripe_connect: true } },
      });
      
      expect(result.montantRecuFiscal).toBe(9410);
      expect(result.label).toBe("Montant net reçu par l'association");
    });
    
    it('should throw error if transfer amount does not match', () => {
      expect(() => calculateReceiptAmount({
        klubDon: { 
          amount: 10000, 
          donorPaysFee: false,
          netAssociationAmount: 9410 
        },
        klubr: { trade_policy: { stripe_connect: true } },
        transfer: { amount: 9500 }, // Incohérence!
      })).toThrow('Incohérence montant reçu fiscal');
    });
  });
  
  describe('Mode Legacy', () => {
    it('should use legacy calculation when stripe_connect is false', () => {
      const result = calculateReceiptAmount({
        klubDon: { amount: 10000 },
        klubr: { trade_policy: { stripe_connect: false } },
      });
      
      // Le comportement Legacy doit être préservé
      expect(result).toBeDefined();
    });
  });
});
```

---

## 🔗 Dépendances

- **Prérequis**: US-PAY-002 (calcul netAssociationAmount), US-DOC-001 (émission au nom association)
- **Bloque**: US-DOC-004 (attestation annulation)

---

## ✅ Definition of Done

- [ ] Fonction `calculateReceiptAmount()` implémentée
- [ ] Condition de garde `stripe_connect === true` présente
- [ ] Scénario A : reçu = montant du don (100%)
- [ ] Scénario B : reçu = montant net (~94%)
- [ ] Vérification de cohérence avec transfer Stripe
- [ ] Champ `netAssociationAmount` ajouté au schéma klub-don
- [ ] Template PDF mis à jour avec le bon label
- [ ] Tests unitaires passants
- [ ] Validation juridique du format Cerfa
- [ ] PR approuvée et mergée
