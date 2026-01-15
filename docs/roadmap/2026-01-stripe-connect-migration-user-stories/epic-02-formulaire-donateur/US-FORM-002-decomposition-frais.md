# US-FORM-002 : Calculer et afficher la décomposition des frais en temps réel

> **Epic**: 2 - Formulaire Donateur | **Priorité**: P0 | **Estimation**: 3 points

---

## ⚠️ Condition de Garde

```typescript
// Cette fonctionnalité ne s'active QUE si :
klubr.trade_policy.stripe_connect === true
```

Si `stripe_connect === false`, l'affichage Legacy s'applique (pas de décomposition détaillée).

---

## 📋 Description

**En tant que** donateur,
**Je veux** voir en temps réel la décomposition des frais et montants,
**Afin de** comprendre exactement comment mon argent est réparti.

---

## 🎯 Critères d'Acceptation

### Scénario 1 : Affichage avec Donor Pays Fee = TRUE

```gherkin
Given un don de 100€ avec contribution DONACTION de 10€
And trade_policy.stripe_connect = true
And donorPaysFee = true
And commissionPercentage = 4%
When le récapitulatif est affiché
Then je vois :
  | Ligne                      | Montant    |
  | Montant du don             | 100,00 €   |
  | Contribution DONACTION     | 10,00 €    |
  | Sous-total                 | 110,00 €   |
  | Commission plateforme (4%) | 4,00 €     |
  | Frais bancaires (~1.5%)    | ~1,90 €    |
  | TOTAL DÉBITÉ               | 115,90 €   |
And je vois "L'association reçoit 100,00 € (100%)"
And je vois "Reçu fiscal : 100,00 €"
```

### Scénario 2 : Affichage avec Donor Pays Fee = FALSE

```gherkin
Given un don de 100€ avec contribution DONACTION de 10€
And trade_policy.stripe_connect = true
And donorPaysFee = false
And commissionPercentage = 4%
When le récapitulatif est affiché
Then je vois :
  | Ligne                      | Montant    |
  | Montant du don (frais inclus) | 100,00 € |
  | Contribution DONACTION     | 10,00 €    |
  | TOTAL DÉBITÉ               | 110,00 €   |
And je vois "L'association reçoit 96,00 € (don - 4% commission)"
And je vois "Reçu fiscal : 96,00 €"
```

### Scénario 3 : Mise à jour en temps réel

```gherkin
Given le formulaire à l'étape 3
And trade_policy.stripe_connect = true
When je change le montant du don de 100€ à 200€
Then tous les calculs se mettent à jour instantanément
And aucun appel API n'est effectué (calcul côté client)
```

### Scénario 4 : Mode Legacy

```gherkin
Given trade_policy.stripe_connect = false
When le récapitulatif est affiché
Then la décomposition détaillée des frais n'est PAS affichée
And seul le total à payer est visible
```

---

## 📐 Spécifications Techniques

### Fichier à créer/modifier

```
donaction-saas/src/routes/sponsorshipForm/helpers/feeCalculator.ts
```

### Fonctions de calcul

```typescript
// feeCalculator.ts

interface FeeCalculation {
  montantDon: number;           // Montant saisi par le donateur
  contribution: number;          // Contribution DONACTION (0-25€)
  commissionPercentage: number;  // Ex: 4
  donorPaysFee: boolean;
}

interface FeeResult {
  montantDonReel: number;        // Ce que l'association reçoit
  commissionPlateforme: number;  // 4% du don
  fraisStripeEstimes: number;    // ~1.5% + 0.25€
  applicationFee: number;        // Commission + Frais Stripe
  totalPreleve: number;          // Total débité au donateur
  montantRecuFiscal: number;     // Montant sur le reçu fiscal
}

export function calculateFees(input: FeeCalculation): FeeResult {
  const { montantDon, contribution, commissionPercentage, donorPaysFee } = input;
  
  // Taux Stripe (Europe)
  const STRIPE_PERCENTAGE = 0.015; // 1.5%
  const STRIPE_FIXED = 0.25;       // 0.25€
  
  const tauxCommission = commissionPercentage / 100;
  
  if (donorPaysFee) {
    // Scénario A : Donateur paie les frais
    const montantDonReel = montantDon;
    const commissionPlateforme = montantDonReel * tauxCommission;
    const baseStripe = montantDonReel + contribution;
    const fraisStripeEstimes = baseStripe * STRIPE_PERCENTAGE + STRIPE_FIXED;
    const applicationFee = commissionPlateforme + fraisStripeEstimes;
    const totalPreleve = montantDonReel + contribution + applicationFee;
    
    return {
      montantDonReel,
      commissionPlateforme,
      fraisStripeEstimes,
      applicationFee,
      totalPreleve,
      montantRecuFiscal: montantDonReel, // 100%
    };
  } else {
    // Scénario B : Frais déduits du don
    const commissionPlateforme = montantDon * tauxCommission;
    const montantDonReel = montantDon - commissionPlateforme;
    const totalPreleve = montantDon + contribution;
    
    return {
      montantDonReel,
      commissionPlateforme,
      fraisStripeEstimes: 0, // Non visible dans ce mode
      applicationFee: commissionPlateforme,
      totalPreleve,
      montantRecuFiscal: montantDonReel, // Net après frais
    };
  }
}
```

### Composant d'affichage

```svelte
<!-- FeeBreakdown.svelte -->
<script lang="ts">
  import { calculateFees, type FeeResult } from '../helpers/feeCalculator';
  import { formatCurrency } from '../helpers/format';
  
  export let montantDon: number;
  export let contribution: number;
  export let commissionPercentage: number;
  export let donorPaysFee: boolean;
  export let isStripeConnect: boolean;
  
  $: fees = calculateFees({
    montantDon,
    contribution,
    commissionPercentage,
    donorPaysFee,
  });
</script>

{#if isStripeConnect}
  <div class="fee-breakdown">
    <div class="line">
      <span>Montant du don</span>
      <span>{formatCurrency(montantDon)}</span>
    </div>
    
    {#if contribution > 0}
      <div class="line">
        <span>Contribution DONACTION</span>
        <span>{formatCurrency(contribution)}</span>
      </div>
    {/if}
    
    <hr />
    
    {#if donorPaysFee}
      <div class="line sub">
        <span>Sous-total</span>
        <span>{formatCurrency(montantDon + contribution)}</span>
      </div>
      <div class="line fee">
        <span>+ Commission plateforme ({commissionPercentage}%)</span>
        <span>{formatCurrency(fees.commissionPlateforme)}</span>
      </div>
      <div class="line fee">
        <span>+ Frais bancaires (~1.5%)</span>
        <span>~{formatCurrency(fees.fraisStripeEstimes)}</span>
      </div>
    {/if}
    
    <hr />
    
    <div class="line total">
      <span>TOTAL DÉBITÉ</span>
      <span>{formatCurrency(fees.totalPreleve)}</span>
    </div>
    
    <div class="summary-box">
      <p>
        ✅ L'association reçoit : <strong>{formatCurrency(fees.montantDonReel)}</strong>
        {#if donorPaysFee}(100% de votre don){:else}(don - {commissionPercentage}%){/if}
      </p>
      <p>
        📄 Reçu fiscal : <strong>{formatCurrency(fees.montantRecuFiscal)}</strong>
      </p>
    </div>
  </div>
{:else}
  <!-- Mode Legacy : affichage simplifié -->
  <div class="legacy-total">
    <span>Total à payer :</span>
    <span>{formatCurrency(montantDon + contribution)}</span>
  </div>
{/if}
```

---

## 🔗 Dépendances

| Type | US | Description |
|------|-----|-------------|
| Requiert | US-FORM-001 | Choix donorPaysFee |
| Bloque | US-FORM-004 | Affichage reçu fiscal |

---

## ✅ Definition of Done

- [ ] Helper `feeCalculator.ts` créé et testé unitairement
- [ ] Composant `FeeBreakdown.svelte` créé et stylisé
- [ ] Mise à jour en temps réel vérifiée
- [ ] Condition de garde `stripe_connect === true` vérifiée
- [ ] Tests avec différentes valeurs (edge cases : 0€, max, décimales)
- [ ] PR approuvée et mergée

---

## 📝 Notes

- Les frais Stripe affichés sont une estimation (le montant exact est calculé par Stripe)
- Utiliser `~` devant les frais Stripe pour indiquer l'approximation
- Prévoir un tooltip explicatif sur la décomposition
