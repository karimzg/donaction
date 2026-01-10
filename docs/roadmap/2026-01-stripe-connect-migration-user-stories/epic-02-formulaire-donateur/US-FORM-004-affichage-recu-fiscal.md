# US-FORM-004 : Afficher le montant du reçu fiscal selon le mode choisi

> **Epic**: 2 - Formulaire Donateur | **Priorité**: P1 | **Estimation**: 2 points

---

## ⚠️ Condition de Garde

```typescript
// Cette fonctionnalité ne s'active QUE si :
klubr.trade_policy.stripe_connect === true
```

---

## 📋 Description

**En tant que** donateur souhaitant bénéficier d'une réduction fiscale,
**Je veux** voir clairement le montant qui figurera sur mon reçu fiscal,
**Afin de** connaître le montant exact de ma déduction d'impôt.

---

## 🎯 Critères d'Acceptation

### Scénario 1 : Affichage avec Donor Pays Fee = TRUE

```gherkin
Given un don de 100€
And trade_policy.stripe_connect = true
And donorPaysFee = true
And le donateur est un particulier
When le récapitulatif est affiché
Then je vois :
  | Élément                    | Valeur      |
  | Montant reçu fiscal        | 100,00 €    |
  | Réduction d'impôts (66%)   | 66,00 €     |
  | Coût réel du don           | 49,90 €     |
And le coût réel = Total débité - Réduction
```

### Scénario 2 : Affichage avec Donor Pays Fee = FALSE

```gherkin
Given un don de 100€
And trade_policy.stripe_connect = true
And donorPaysFee = false
And commissionPercentage = 4%
When le récapitulatif est affiché
Then je vois :
  | Élément                    | Valeur      |
  | Montant reçu fiscal        | 96,00 €     |
  | Réduction d'impôts (66%)   | 63,36 €     |
  | Coût réel du don           | 46,64 €     |
```

### Scénario 3 : Donateur Organisme (entreprise)

```gherkin
Given un don de 500€ par un organisme
And trade_policy.stripe_connect = true
And donorPaysFee = true
When le récapitulatif est affiché
Then le taux de réduction affiché est 60% (et non 66%)
And je vois "Réduction d'impôts (60%) : 300,00 €"
```

### Scénario 4 : Sans réduction fiscale

```gherkin
Given un donateur qui a choisi withTaxReduction = false
When le récapitulatif est affiché
Then la section réduction fiscale n'est PAS affichée
And seul le montant reçu fiscal est visible
```

---

## 📐 Spécifications Techniques

### Composant à créer

```
donaction-saas/src/routes/sponsorshipForm/components/TaxReductionSummary.svelte
```

### Implémentation

```svelte
<!-- TaxReductionSummary.svelte -->
<script lang="ts">
  import { formatCurrency } from '../helpers/format';
  
  export let montantRecuFiscal: number;
  export let totalDebite: number;
  export let isOrganisme: boolean;
  export let withTaxReduction: boolean;
  export let isStripeConnect: boolean;
  
  // Taux de réduction fiscale
  const TAUX_PARTICULIER = 0.66;
  const TAUX_ORGANISME = 0.60;
  
  $: tauxReduction = isOrganisme ? TAUX_ORGANISME : TAUX_PARTICULIER;
  $: montantReduction = montantRecuFiscal * tauxReduction;
  $: coutReel = totalDebite - montantReduction;
</script>

{#if isStripeConnect}
  <div class="tax-summary">
    <div class="receipt-amount">
      <span class="icon">📄</span>
      <div>
        <strong>Reçu fiscal</strong>
        <span class="amount">{formatCurrency(montantRecuFiscal)}</span>
      </div>
    </div>
    
    {#if withTaxReduction}
      <div class="reduction-details">
        <div class="line">
          <span>Réduction d'impôts ({(tauxReduction * 100).toFixed(0)}%)</span>
          <span class="positive">-{formatCurrency(montantReduction)}</span>
        </div>
        <div class="line highlight">
          <span>Coût réel de votre don</span>
          <span class="final">{formatCurrency(coutReel)}</span>
        </div>
      </div>
      
      <p class="info">
        {#if isOrganisme}
          Article 238 bis du CGI - Réduction d'impôt sur les sociétés
        {:else}
          Article 200 du CGI - Réduction d'impôt sur le revenu
        {/if}
      </p>
    {/if}
  </div>
{/if}

<style>
  .tax-summary {
    margin-top: 1rem;
    padding: 1rem;
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    border-radius: 8px;
    border: 1px solid #86efac;
  }
  
  .receipt-amount {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .receipt-amount .amount {
    font-size: 1.25rem;
    font-weight: 700;
    color: #16a34a;
  }
  
  .reduction-details {
    background: white;
    padding: 0.75rem;
    border-radius: 6px;
    margin-bottom: 0.75rem;
  }
  
  .line {
    display: flex;
    justify-content: space-between;
    padding: 0.25rem 0;
  }
  
  .line.highlight {
    border-top: 1px dashed #d1d5db;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    font-weight: 600;
  }
  
  .positive {
    color: #16a34a;
  }
  
  .final {
    font-size: 1.1rem;
    color: #15803d;
  }
  
  .info {
    font-size: 0.8rem;
    color: #6b7280;
    text-align: center;
  }
</style>
```

---

## 🔗 Dépendances

| Type | US | Description |
|------|-----|-------------|
| Requiert | US-FORM-002 | Calcul montantRecuFiscal |

---

## ✅ Definition of Done

- [ ] Composant `TaxReductionSummary.svelte` créé
- [ ] Affichage conditionnel selon `withTaxReduction`
- [ ] Taux différenciés particulier/organisme
- [ ] Condition de garde `stripe_connect === true` vérifiée
- [ ] Tests visuels (screenshots) validés
- [ ] PR approuvée et mergée

---

## 📝 Notes

- Le design doit mettre en valeur le faible coût réel du don
- Utiliser des couleurs vertes positives pour la réduction
- Prévoir un tooltip explicatif sur les articles du CGI
