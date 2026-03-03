# US-FORM-002 : Affichage dynamique des montants selon `donorPaysFee`

> **Epic**: 2 - Formulaire Donateur | **Priorité**: P0 | **Estimation**: 5 points

---

## ⚠️ Condition de Garde

```typescript
// Ce comportement ne s'applique QUE si :
klubr.trade_policy.stripe_connect === true
// Sinon, afficher le comportement Legacy
```

---

## 📋 Description

**En tant que** donateur,
**Je veux** voir clairement la décomposition des montants selon mon choix de prise en charge des frais,
**Afin de** comprendre combien l'association recevra réellement.

---

## 🎯 Critères d'Acceptation

```gherkin
Feature: Affichage des montants dans le récapitulatif (Step 3)

  Background:
    Given un klubr avec stripe_connect = true
    And je suis à l'étape 3 du formulaire (Récapitulatif)

  # SCÉNARIO A : Donor Pays Fee = TRUE
  
  Scenario: Affichage Scénario A - Frais payés par le donateur
    Given j'ai saisi un don de 100€
    And j'ai choisi une contribution de 10€
    And donorPaysFee = true
    When je visualise le récapitulatif
    Then je vois :
      | Ligne | Montant |
      | Montant de votre don | 100,00 € |
      | Commission plateforme (4%) | 4,00 € |
      | Frais de transaction | 1,96 € |
      | Contribution DONACTION | 10,00 € |
      | ─────────────────────── | ──────── |
      | **Total à payer** | **115,96 €** |
    And je vois le message "L'association recevra 100,00 € (100% de votre don)"
    And le montant du reçu fiscal indique 100,00 €

  # SCÉNARIO B : Donor Pays Fee = FALSE (FORMULE CORRIGÉE)
  
  Scenario: Affichage Scénario B - Frais inclus dans le don
    Given j'ai saisi un don de 100€
    And j'ai choisi une contribution de 10€
    And donorPaysFee = false
    When je visualise le récapitulatif
    Then je vois :
      | Ligne | Montant |
      | Montant de votre don | 100,00 € |
      | Contribution DONACTION | 10,00 € |
      | ─────────────────────── | ──────── |
      | **Total à payer** | **110,00 €** |
    And je vois le message "L'association recevra 94,10 € (après déduction des frais)"
    And le montant du reçu fiscal indique 94,10 €

  Scenario: Mise à jour dynamique lors du changement de choix
    Given donorPaysFee = true
    And je vois "L'association recevra 100,00 €"
    When je change donorPaysFee à false
    Then l'affichage se met à jour immédiatement
    And je vois "L'association recevra 94,10 €"
    And le total à payer passe de 115,96 € à 110,00 €

  Scenario: Tooltip explicatif sur les frais
    Given donorPaysFee = false
    When je survole l'icône info à côté du montant association
    Then un tooltip affiche :
      """
      Décomposition des frais déduits :
      • Commission plateforme (4%) : 4,00 €
      • Frais de transaction : 1,90 €
      Total déduit : 5,90 €
      """
```

---

## 📐 Spécifications Techniques

### Composant Svelte 5

```svelte
<!-- RecapitulatifStep.svelte -->
<script lang="ts">
  import { calculateFees } from '$lib/helpers/fee-calculation-helper';
  import type { FeeCalculationOutput } from '$lib/types';
  
  // Props
  let { 
    montantDon, 
    contribution, 
    donorPaysFee = $bindable(),
    tradePolicy,
    allowDonorFeeChoice 
  } = $props();
  
  // ⚠️ CONDITION DE GARDE
  const isStripeConnect = tradePolicy.stripe_connect === true;
  
  // Calculs réactifs
  const fees = $derived<FeeCalculationOutput>(
    isStripeConnect
      ? calculateFees({ montantDon, contribution, donorPaysFee, tradePolicy })
      : calculateLegacyFees({ montantDon, contribution, tradePolicy })
  );
  
  // Formattage
  const formatCurrency = (cents: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
      .format(cents / 100);
</script>

{#if isStripeConnect}
  <div class="recap-amounts">
    <!-- Montant du don -->
    <div class="line">
      <span>Montant de votre don</span>
      <span>{formatCurrency(montantDon)}</span>
    </div>
    
    {#if donorPaysFee}
      <!-- Scénario A : Détail des frais -->
      <div class="line sub">
        <span>Commission plateforme ({tradePolicy.commissionPercentage * 100}%)</span>
        <span>{formatCurrency(fees.commissionDonaction)}</span>
      </div>
      <div class="line sub">
        <span>Frais de transaction</span>
        <span>{formatCurrency(fees.fraisStripeEstimes)}</span>
      </div>
    {/if}
    
    <!-- Contribution optionnelle -->
    {#if contribution > 0}
      <div class="line">
        <span>Contribution DONACTION</span>
        <span>{formatCurrency(contribution)}</span>
      </div>
    {/if}
    
    <hr />
    
    <!-- Total -->
    <div class="line total">
      <span>Total à payer</span>
      <span>{formatCurrency(fees.totalDonateur)}</span>
    </div>
    
    <!-- Message association -->
    <div class="association-message" class:success={donorPaysFee}>
      {#if donorPaysFee}
        <span class="icon">✅</span>
        L'association recevra <strong>{formatCurrency(fees.netAssociation)}</strong> 
        (100% de votre don)
      {:else}
        <span class="icon">ℹ️</span>
        L'association recevra <strong>{formatCurrency(fees.netAssociation)}</strong>
        <button class="tooltip-trigger" title="Décomposition des frais déduits :
• Commission plateforme (4%) : {formatCurrency(fees.commissionDonaction)}
• Frais de transaction : {formatCurrency(fees.fraisStripeEstimes)}
Total déduit : {formatCurrency(fees.applicationFee)}">
          (après déduction des frais)
        </button>
      {/if}
    </div>
    
    <!-- Reçu fiscal -->
    <div class="receipt-preview">
      📄 Votre reçu fiscal sera de <strong>{formatCurrency(fees.montantRecuFiscal)}</strong>
    </div>
  </div>
{:else}
  <!-- Affichage Legacy -->
  <LegacyRecapitulatif {montantDon} {contribution} />
{/if}

<style>
  .recap-amounts {
    background: var(--color-surface);
    border-radius: 8px;
    padding: 1.5rem;
  }
  
  .line {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
  }
  
  .line.sub {
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    padding-left: 1rem;
  }
  
  .line.total {
    font-weight: bold;
    font-size: 1.2rem;
    border-top: 2px solid var(--color-border);
    padding-top: 1rem;
    margin-top: 0.5rem;
  }
  
  .association-message {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 6px;
    background: var(--color-info-light);
  }
  
  .association-message.success {
    background: var(--color-success-light);
  }
  
  .receipt-preview {
    margin-top: 1rem;
    padding: 0.75rem;
    background: var(--color-surface-alt);
    border-radius: 4px;
    font-size: 0.9rem;
  }
  
  .tooltip-trigger {
    cursor: help;
    text-decoration: underline dotted;
    border: none;
    background: none;
    color: inherit;
  }
</style>
```

### Tests E2E

```typescript
// tests/e2e/donation-form.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Récapitulatif des montants', () => {
  test.beforeEach(async ({ page }) => {
    // Naviguer vers le formulaire avec Stripe Connect activé
    await page.goto('/don/club-test?stripe_connect=true');
    await page.fill('[data-testid="montant"]', '100');
    await page.fill('[data-testid="contribution"]', '10');
    await page.click('[data-testid="next-step"]');
    await page.click('[data-testid="next-step"]');
  });
  
  test('Scénario A - affiche les frais détaillés', async ({ page }) => {
    await page.click('[data-testid="donor-pays-fee-true"]');
    
    await expect(page.locator('[data-testid="commission"]')).toContainText('4,00 €');
    await expect(page.locator('[data-testid="stripe-fees"]')).toContainText('1,96 €');
    await expect(page.locator('[data-testid="total"]')).toContainText('115,96 €');
    await expect(page.locator('[data-testid="net-association"]')).toContainText('100,00 €');
    await expect(page.locator('[data-testid="recu-fiscal"]')).toContainText('100,00 €');
  });
  
  test('Scénario B - affiche le montant net réduit', async ({ page }) => {
    await page.click('[data-testid="donor-pays-fee-false"]');
    
    await expect(page.locator('[data-testid="total"]')).toContainText('110,00 €');
    await expect(page.locator('[data-testid="net-association"]')).toContainText('94,10 €');
    await expect(page.locator('[data-testid="recu-fiscal"]')).toContainText('94,10 €');
  });
  
  test('Mise à jour dynamique lors du changement de choix', async ({ page }) => {
    // Commencer avec Scénario A
    await page.click('[data-testid="donor-pays-fee-true"]');
    await expect(page.locator('[data-testid="total"]')).toContainText('115,96 €');
    
    // Basculer vers Scénario B
    await page.click('[data-testid="donor-pays-fee-false"]');
    await expect(page.locator('[data-testid="total"]')).toContainText('110,00 €');
    
    // La transition doit être fluide (pas de rechargement)
    await expect(page.locator('[data-testid="recap-amounts"]')).toBeVisible();
  });
});
```

---

## 🔗 Dépendances

- **Prérequis**: US-PAY-002 (calculateFees), US-FORM-001 (UI choix frais)
- **Bloque**: US-FORM-004 (transparence frais)

---

## ✅ Definition of Done

- [ ] Composant RecapitulatifStep implémenté
- [ ] Condition de garde `stripe_connect === true` présente
- [ ] Affichage correct pour Scénario A (frais séparés)
- [ ] Affichage correct pour Scénario B (frais inclus, net ~94%)
- [ ] Mise à jour dynamique sans rechargement
- [ ] Tooltip explicatif fonctionnel
- [ ] Tests E2E passants
- [ ] Accessibilité validée (ARIA labels)
- [ ] PR approuvée et mergée
