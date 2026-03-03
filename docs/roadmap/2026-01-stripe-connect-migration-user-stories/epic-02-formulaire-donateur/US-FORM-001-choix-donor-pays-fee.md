# US-FORM-001 : Ajouter le choix "Donor Pays Fee" à l'étape 3

> **Epic**: 2 - Formulaire Donateur | **Priorité**: P0 | **Estimation**: 5 points

---

## ⚠️ Condition de Garde

```typescript
// Cette fonctionnalité ne s'active QUE si :
klubr.trade_policy.stripe_connect === true
```

Si `stripe_connect === false`, le comportement Legacy s'applique (pas de choix affiché).

---

## 📋 Description

**En tant que** donateur,
**Je veux** pouvoir choisir si je prends en charge les frais de traitement ou s'ils sont déduits de mon don,
**Afin de** décider en toute transparence comment mon don est réparti.

---

## 🎯 Critères d'Acceptation

### Scénario 1 : Affichage du choix si autorisé

```gherkin
Given un klubr avec trade_policy.stripe_connect = true
And trade_policy.allow_donor_fee_choice = true
When le donateur arrive à l'étape 3 du formulaire
Then il voit 2 options radio :
  | Option | Label                                      | Sélectionné par défaut |
  | A      | Je paie les frais en plus de mon don       | Selon type de don      |
  | B      | J'intègre les frais au montant de mon don  | Selon type de don      |
And chaque option affiche le détail des montants
```

### Scénario 2 : Valeur par défaut selon type de don

```gherkin
Given un klubr avec trade_policy.stripe_connect = true
And allow_donor_fee_choice = true
When le don est pour un PROJET
Then l'option "Je paie les frais" est sélectionnée par défaut (donor_pays_fee_project)

When le don est pour le CLUB (fonctionnement général)
Then l'option sélectionnée par défaut dépend de donor_pays_fee_club
```

### Scénario 3 : Pas de choix si non autorisé

```gherkin
Given un klubr avec trade_policy.stripe_connect = true
And allow_donor_fee_choice = false
When le donateur arrive à l'étape 3
Then aucun choix n'est affiché
And le système applique automatiquement la valeur par défaut
```

### Scénario 4 : Mode Legacy (pas de Stripe Connect)

```gherkin
Given un klubr avec trade_policy.stripe_connect = false
When le donateur arrive à l'étape 3
Then aucun choix "Donor Pays Fee" n'est affiché
And le formulaire fonctionne comme avant (mode Legacy)
```

---

## 📐 Spécifications Techniques

### Fichier à modifier

```
donaction-saas/src/routes/sponsorshipForm/components/step3.svelte
```

### Logique de détermination

```typescript
// step3.svelte
<script lang="ts">
  import { SUBSCRIPTION } from '../logic/useSponsorshipForm.svelte';
  
  // Vérifier si Stripe Connect est activé
  $: isStripeConnect = SUBSCRIPTION.klubr?.trade_policy?.stripe_connect === true;
  
  // Déterminer si c'est un don projet ou club
  $: isProjectDonation = SUBSCRIPTION.project?.uuid 
      && SUBSCRIPTION.project.uuid !== SUBSCRIPTION.klubr?.uuid;
  
  // Récupérer les paramètres de la trade policy
  $: tradePolicy = SUBSCRIPTION.klubr?.trade_policy;
  
  // Valeur par défaut selon le type de don
  $: defaultDonorPaysFee = isProjectDonation 
      ? tradePolicy?.donor_pays_fee_project ?? true
      : tradePolicy?.donor_pays_fee_club ?? false;
  
  // Afficher le choix ?
  $: showFeeChoice = isStripeConnect && (tradePolicy?.allow_donor_fee_choice ?? true);
  
  // État local du choix (initialisé à la valeur par défaut)
  let donorPaysFee = defaultDonorPaysFee;
  
  // Synchroniser avec le store
  $: SUBSCRIPTION.donorPaysFee = donorPaysFee;
</script>

{#if isStripeConnect}
  {#if showFeeChoice}
    <div class="fee-choice-section">
      <h4>💡 Comment souhaitez-vous gérer les frais de traitement ?</h4>
      
      <label class="fee-option" class:selected={donorPaysFee === true}>
        <input type="radio" bind:group={donorPaysFee} value={true} />
        <div class="option-content">
          <strong>Je paie les frais en plus de mon don</strong>
          <p>L'association reçoit 100% de votre don ({formatCurrency(montant)})</p>
          <p class="fee-detail">Frais de traitement : +{formatCurrency(applicationFee)}</p>
          <div class="summary">
            Reçu fiscal : {formatCurrency(montant)} • Total débité : {formatCurrency(total)}
          </div>
        </div>
      </label>
      
      <label class="fee-option" class:selected={donorPaysFee === false}>
        <input type="radio" bind:group={donorPaysFee} value={false} />
        <div class="option-content">
          <strong>J'intègre les frais au montant de mon don</strong>
          <p>L'association reçoit votre don moins les frais ({formatCurrency(netAmount)})</p>
          <p class="fee-detail">Frais de traitement : -{formatCurrency(applicationFee)} (déduits)</p>
          <div class="summary">
            Reçu fiscal : {formatCurrency(netAmount)} • Total débité : {formatCurrency(montant)}
          </div>
        </div>
      </label>
      
      <p class="info">
        ℹ️ Les frais ({commissionPercentage}%) couvrent les coûts bancaires et le fonctionnement de la plateforme DONACTION.
      </p>
    </div>
  {/if}
{/if}
```

### Styles CSS

```css
.fee-choice-section {
  margin: 1.5rem 0;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.fee-option {
  display: block;
  padding: 1rem;
  margin: 0.5rem 0;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.fee-option.selected {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.fee-option .summary {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  font-size: 0.9rem;
}
```

---

## 🔗 Dépendances

| Type | US | Description |
|------|-----|-------------|
| Requiert | US-TP-001 | Nouveaux champs trade_policy |
| Bloque | US-FORM-002 | Décomposition des frais |
| Bloque | US-FORM-003 | Flag PaymentIntent |

---

## ✅ Definition of Done

- [ ] Composant radio créé et stylisé
- [ ] Logique de valeur par défaut implémentée
- [ ] Condition de garde `stripe_connect === true` vérifiée
- [ ] Tests E2E sur les 2 modes (projet/club)
- [ ] Test du mode Legacy (stripe_connect = false)
- [ ] PR approuvée et mergée

---

## 📝 Notes

- Le choix doit être accessible (WCAG 2.1 AA)
- Prévoir une animation subtile lors du changement de sélection
- Les montants doivent se recalculer en temps réel
