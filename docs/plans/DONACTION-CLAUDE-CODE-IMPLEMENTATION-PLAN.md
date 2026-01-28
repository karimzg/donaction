# DONACTION-SAAS - Plan de Refactoring UI/UX Complet

> **Version**: 1.0.0 | **Date**: 2025-01-15
> **Objectif**: Refactorer l'UI/UX du formulaire de don en conservant intégralement la logique métier existante

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble du projet](#1-vue-densemble-du-projet)
2. [Règles critiques - Ce qui peut/ne peut pas être modifié](#2-règles-critiques)
3. [Architecture des fichiers](#3-architecture-des-fichiers)
4. [Plan par fichier - Step 1](#4-step-1---choix-du-montant)
5. [Plan par fichier - Step 2](#5-step-2---informations-personnelles)
6. [Plan par fichier - Step 3](#6-step-3---récapitulatif)
7. [Composants partagés](#7-composants-partagés)
8. [Styles globaux](#8-styles-globaux)
9. [Checklist de validation](#9-checklist-de-validation)

---

## 1. VUE D'ENSEMBLE DU PROJET

### Structure actuelle
```
donaction-saas/src/components/sponsorshipForm/
├── index.svelte                    # Composant principal (web component)
├── index.scss                      # Styles du container principal
├── components/
│   ├── breadcrumb/
│   │   ├── Breadcrumb.svelte
│   │   └── index.scss
│   ├── formBanner/
│   │   ├── FormBanners.svelte      # Triangles décoratifs avec couleurs du club
│   │   └── index.scss
│   ├── formBody/
│   │   ├── FormBody.svelte         # Router des steps
│   │   ├── index.scss
│   │   └── steps/
│   │       ├── step1/              # Choix du montant
│   │       ├── step2/              # Informations personnelles
│   │       ├── step3/              # Récapitulatif
│   │       ├── step4/              # Paiement Stripe
│   │       └── step5/              # Confirmation
│   ├── formNavigation/
│   │   ├── FormNavigation.svelte
│   │   └── index.scss
│   └── contribution/
│       ├── Contribution.svelte     # Écran soutien plateforme (slider Lottie)
│       └── index.scss
├── logic/
│   ├── useSponsorshipForm.svelte.ts  # État global ($state, stores)
│   ├── fee-calculation-helper.ts     # Calculs des frais Stripe Connect
│   ├── utils.ts                      # Fonctions utilitaires
│   ├── api.ts                        # Appels API
│   ├── stripe.ts                     # Intégration Stripe
│   ├── submit.ts                     # Soumission du formulaire
│   └── validator.ts                  # Validations
└── styles/
    └── main.scss                     # Styles globaux
```

### Système de thème dynamique (CONSERVER)
Le formulaire utilise les couleurs du club via `SUBSCRIPTION.klubr.klubr_house`:
```svelte
<!-- Dans FormBanners.svelte -->
bg1={SUBSCRIPTION.klubr?.klubr_house?.primary_color || '#FFFFFF'}
bg2={SUBSCRIPTION.klubr?.klubr_house?.secondary_color || '#000000'}

<!-- Dans step1.svelte (sélection projet) -->
style="border-color: {SUBSCRIPTION.klubr.klubr_house.primary_color}"
```

**IMPORTANT**: Cette logique de couleurs dynamiques DOIT être conservée. Les nouvelles classes CSS doivent utiliser des CSS variables qui seront alimentées par ces couleurs.

---

## 2. RÈGLES CRITIQUES

### ✅ CE QUE CLAUDE CODE PEUT MODIFIER

| Catégorie | Exemples | Notes |
|-----------|----------|-------|
| **Structure HTML** | Réorganiser les `<div>`, ajouter des sections | Garder les slots intacts |
| **Classes CSS** | Ajouter/remplacer des classes | Utiliser le nouveau design system |
| **Fichiers SCSS** | Modifier `index.scss` de chaque step | Documenter les suppressions |
| **Textes/Labels** | Microcopy, titres, placeholders | Garder le sens original |
| **Emojis/Icônes** | Ajouter des emojis pour améliorer l'UX | - |
| **Animations CSS** | Transitions, hover states | Garder les Lottie existantes |
| **Ordre des éléments** | Réorganiser visuellement | Ne pas casser le flow logique |

### ❌ CE QUE CLAUDE CODE NE DOIT PAS MODIFIER

| Catégorie | Fichiers concernés | Raison |
|-----------|-------------------|--------|
| **Variables $state** | `useSponsorshipForm.svelte.ts` | Logique métier |
| **Stores writable** | `isBeingFilled`, `index`, etc. | State management |
| **Calculs de frais** | `fee-calculation-helper.ts`, `utils.ts` | Logique financière |
| **Appels API** | `api.ts`, `submit.ts` | Backend integration |
| **Validations** | `validator.ts` | Règles métier |
| **Bindings Svelte** | `bind:value`, `on:click`, etc. | Réactivité |
| **Props de composants** | `$props()`, paramètres | Interface des composants |
| **Stripe integration** | `stripe.ts`, `step4.svelte` | Paiement |
| **Lottie animations** | `LottieAnimation`, segments | Animations existantes |
| **Event bus** | `eventBus`, `initListeners.ts` | Communication |
| **reCAPTCHA/Maps** | Scripts externes | Sécurité/fonctionnalité |

### ⚠️ POINTS D'ATTENTION SPÉCIAUX

1. **Couleurs du club** : Toujours utiliser `SUBSCRIPTION.klubr?.klubr_house?.primary_color` et `secondary_color`
2. **Shadow DOM** : Le composant est un web component, les styles sont scoped
3. **Swiper.js** : Le carousel de sélection de projet utilise Swiper, ne pas modifier
4. **Slots** : Les slots `stripe-payment-form` et `c-g-u` sont utilisés par le parent

---

## 3. ARCHITECTURE DES FICHIERS

### Nouveaux fichiers à créer

```
donaction-saas/src/styles/
├── main.scss                  # MODIFIER (ajouter variables)
└── _design-tokens.scss        # CRÉER (variables CSS du design system)
```

### Fichiers à modifier

| Fichier | Action | Priorité |
|---------|--------|----------|
| `src/styles/main.scss` | Ajouter import design-tokens + nouvelles classes | 🔴 Haute |
| `components/breadcrumb/index.scss` | Refactorer styles | 🟡 Moyenne |
| `components/formBody/steps/step1/step1.svelte` | Restructurer HTML | 🔴 Haute |
| `components/formBody/steps/step1/index.scss` | Refactorer + nettoyer | 🔴 Haute |
| `components/formBody/steps/step2/step2.svelte` | Restructurer HTML | 🔴 Haute |
| `components/formBody/steps/step2/index.scss` | Refactorer + nettoyer | 🔴 Haute |
| `components/formBody/steps/step3/step3.svelte` | REFONTE MAJEURE | 🔴 Haute |
| `components/formBody/steps/step3/index.scss` | REFONTE MAJEURE | 🔴 Haute |
| `components/contribution/Contribution.svelte` | Améliorer emoji | 🟡 Moyenne |
| `components/contribution/index.scss` | Améliorer styles | 🟡 Moyenne |

---

## 4. STEP 1 - CHOIX DU MONTANT

### 4.1 Fichier: `step1/step1.svelte`

#### État actuel de la logique (NE PAS MODIFIER)
```typescript
// Ces éléments DOIVENT rester intacts:
import { triggerValidation, DEFAULT_VALUES, SUBSCRIPTION, isBeingFilled, FORM_CONFIG } from '../../../../logic/useSponsorshipForm.svelte';
import { calculateTaxReduction } from '../../../../logic/utils';

let amounts = $derived(DEFAULT_VALUES.estOrganisme ? [100, 200, 500, 1000] : [10, 50, 100, 200]);

const checkIsOrganization = () => { /* CONSERVER */ };
const checkWithTaxReduction = () => { /* CONSERVER */ };
const selectProject = (project: any) => { /* CONSERVER */ };
const saveSelection = (event: any) => { /* CONSERVER */ };

// Swiper logic - CONSERVER INTÉGRALEMENT
const swiperInstaller = (node: any) => { /* ... */ };
const paginate = (acc: 1 | -1) => { /* ... */ };
```

#### Modifications HTML à effectuer

**AVANT** (structure actuelle simplifiée):
```svelte
<form class="step1 flex flex-col" style="gap: 1rem">
  {#if !SUBSCRIPTION.project && SUBSCRIPTION.allowProjectSelection}
    <!-- Sélection projet avec Swiper - NE PAS TOUCHER -->
  {:else}
    <div class="clubProjectContainer">
      <p>Contribuez au développement de</p>
      <p class="title">{SUBSCRIPTION.klubr.denomination}</p>
      <img ... />
    </div>
    
    <div class="amountPicker">
      <p>Je souhaite aider le projet à hauteur de :</p>
      <div class="amounts">
        {#each amounts as amount}
          <div class="amount {DEFAULT_VALUES.montant === amount}" onclick={...}>
            {amount} €
          </div>
        {/each}
      </div>
    </div>
    
    <div class="freeAmount">
      <p>Montant libre</p>
      <input bind:value={DEFAULT_VALUES.montant} ... />
    </div>
    
    <Tooltip><!-- Envoi justificatifs --></Tooltip>
    
    <div class="enTantQue">
      <p>Souhaitez-vous bénéficier d'une réduction d'impôt...</p>
      <div class="choice" onclick={checkWithTaxReduction}>
        <span>Non</span>
        <span>Oui</span>
        <span class="selector"></span>
      </div>
    </div>
    
    {#if DEFAULT_VALUES.withTaxReduction}
      <!-- Particulier/Entreprise + Coût après réduction -->
    {/if}
  {/if}
</form>
```

**APRÈS** (nouvelle structure):
```svelte
<form class="don-step1">
  {#if !SUBSCRIPTION.project && SUBSCRIPTION.allowProjectSelection}
    <!-- Sélection projet avec Swiper - CONSERVER TEL QUEL -->
  {:else}
    <!-- Header contextuel -->
    <header class="don-step1__header">
      <p class="don-step1__subtitle">Contribuez au développement de</p>
      <h1 class="don-step1__title">{SUBSCRIPTION.klubr.denomination}</h1>
      <div class="don-step1__logo">
        <span class="don-logo-text">don</span>
        <span class="don-logo-accent">action</span>
      </div>
    </header>

    <!-- Section Montant -->
    <section class="don-section">
      <h2 class="don-section__label">Je souhaite aider le projet à hauteur de :</h2>
      
      <!-- Boutons montants -->
      <div class="don-amount-grid">
        {#each amounts as amount}
          <button 
            type="button"
            class="don-btn-amount"
            class:don-btn-amount--selected={DEFAULT_VALUES.montant === amount}
            onclick={() => (DEFAULT_VALUES.montant = amount) && isBeingFilled.set(true)}
          >
            {amount} €
          </button>
        {/each}
      </div>

      <!-- Montant libre -->
      <div class="don-custom-amount">
        <label class="don-custom-amount__label">Montant libre</label>
        <div class="don-custom-amount__input">
          <input
            type="number"
            min="10"
            max="100000"
            placeholder="--,--"
            class="don-form-input don-form-input--centered"
            bind:value={DEFAULT_VALUES.montant}
          />
          <span class="don-custom-amount__currency">€</span>
        </div>
      </div>
      <small class="don-error">
        {$triggerValidation > 0 ? /* validation existante */ : ''}
      </small>

      <!-- Info justificatifs -->
      <div class="don-info-row">
        <Tooltip>
          <div slot="trigger" class="don-info-trigger">
            <span class="don-info-icon">📄</span>
            <span class="don-info-text">Envoi immédiat des justificatifs</span>
            <img width={25} height={25} src={alertIcon} alt="" />
          </div>
          <div slot="tooltip">
            <!-- CONSERVER le contenu existant -->
          </div>
        </Tooltip>
      </div>
    </section>

    <!-- Section Réduction fiscale -->
    <section class="don-section">
      <h2 class="don-section__label">
        Souhaitez-vous bénéficier d'une réduction d'impôt "mécénat" pour ce don ?
      </h2>
      
      <div class="don-toggle-group">
        <button 
          type="button"
          class="don-toggle-btn"
          class:don-toggle-btn--selected={!DEFAULT_VALUES.withTaxReduction}
          onclick={checkWithTaxReduction}
        >Non</button>
        <button 
          type="button"
          class="don-toggle-btn"
          class:don-toggle-btn--selected={DEFAULT_VALUES.withTaxReduction}
          onclick={checkWithTaxReduction}
        >Oui</button>
      </div>

      {#if DEFAULT_VALUES.withTaxReduction}
        <div class="don-tax-options">
          <h3 class="don-section__sublabel">Je soutiens en tant que :</h3>
          
          <div class="don-toggle-group">
            <button 
              type="button"
              class="don-toggle-btn"
              class:don-toggle-btn--selected={!DEFAULT_VALUES.estOrganisme}
              onclick={checkIsOrganization}
            >Particulier</button>
            <button 
              type="button"
              class="don-toggle-btn"
              class:don-toggle-btn--selected={DEFAULT_VALUES.estOrganisme}
              onclick={checkIsOrganization}
            >Entreprise</button>
          </div>

          <!-- Coût après réduction -->
          <div class="don-real-cost">
            <Tooltip>
              <div slot="trigger" class="don-real-cost__trigger">
                <span class="don-real-cost__label">Coût après réduction d'impôts</span>
                <img width={25} height={25} src={alertIcon} alt="" />
              </div>
              <div slot="tooltip">
                <!-- CONSERVER le contenu existant -->
              </div>
            </Tooltip>
            <div class="don-real-cost__value">
              {calculateTaxReduction(DEFAULT_VALUES.montant, DEFAULT_VALUES.estOrganisme)} €
            </div>
            <div class="don-real-cost__detail">
              ({DEFAULT_VALUES.estOrganisme ? '60%' : '66%'} de réduction fiscale)
            </div>
          </div>
        </div>
      {/if}
    </section>
  {/if}
</form>
```

### 4.2 Fichier: `step1/index.scss`

#### CSS à SUPPRIMER (devenu inutile)
```scss
// SUPPRIMER ces styles car remplacés par le design system:
.step1 {
  align-items: center;  // Remplacé par flexbox dans nouvelle classe
  
  .clubProjectContainer { ... }  // Remplacé par don-step1__header
  
  .enTantQue {
    .choice {
      // Tout ce bloc est remplacé par don-toggle-group
      cursor: pointer;
      position: relative;
      font-size: 14px;
      border-radius: 6px;
      padding: .5rem 1rem;
      background-color: #f4f4f4;
      
      .selector { ... }  // Animation toggle remplacée
    }
  }
  
  .amountPicker {
    .amounts {
      .amount { ... }  // Remplacé par don-btn-amount
    }
  }
  
  .freeAmount { ... }  // Remplacé par don-custom-amount
  
  .afterTax { ... }  // Remplacé par don-real-cost
}
```

#### CSS à CONSERVER
```scss
// CONSERVER ces styles (sélection projet avec Swiper):
.step1 {
  .projectSelectionContainer {
    width: 100%;
    
    .swiperContainer { ... }  // CONSERVER
  }
}
```

#### CSS à AJOUTER
```scss
@use '../../../../../../styles/main';
@use '../../../../../../styles/_design-tokens';

// Conserver uniquement pour la sélection de projet Swiper
.step1 {
  .projectSelectionContainer {
    width: 100%;
    // ... styles Swiper existants
  }
}

// Nouveaux styles
.don-step1 {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--don-spacing-xl);
  width: 100%;
}

.don-step1__header {
  text-align: center;
  margin-bottom: var(--don-spacing-lg);
}

.don-step1__subtitle {
  font-size: var(--don-font-size-md);
  color: var(--don-color-text-muted);
  margin: 0 0 var(--don-spacing-xs) 0;
}

.don-step1__title {
  font-size: var(--don-font-size-3xl);
  font-weight: var(--don-font-weight-bold);
  color: var(--don-color-text-primary);
  margin: 0 0 var(--don-spacing-lg) 0;
}

.don-step1__logo {
  font-size: var(--don-font-size-base);
}

.don-logo-text {
  color: var(--don-color-text-primary);
  font-weight: var(--don-font-weight-medium);
}

.don-logo-accent {
  color: var(--don-color-accent);
  font-weight: var(--don-font-weight-medium);
}

// Section générique
.don-section {
  background-color: var(--don-color-bg-card);
  border-radius: var(--don-radius-3xl);
  padding: var(--don-spacing-3xl);
  margin-bottom: var(--don-spacing-2xl);
  box-shadow: var(--don-shadow-card);
  width: 100%;
}

.don-section__label {
  font-size: var(--don-font-size-md);
  font-weight: var(--don-font-weight-semibold);
  color: var(--don-color-text-primary);
  text-align: center;
  margin: 0 0 var(--don-spacing-xl) 0;
}

.don-section__sublabel {
  font-size: var(--don-font-size-base);
  font-weight: var(--don-font-weight-medium);
  color: var(--don-color-text-secondary);
  text-align: center;
  margin: 0 0 var(--don-spacing-lg) 0;
}

// Boutons montant
.don-amount-grid {
  display: flex;
  justify-content: center;
  gap: var(--don-spacing-lg);
  margin-bottom: var(--don-spacing-2xl);
  flex-wrap: wrap;
}

.don-btn-amount {
  padding: var(--don-spacing-xl) var(--don-spacing-3xl);
  font-size: var(--don-font-size-lg);
  font-weight: var(--don-font-weight-medium);
  font-family: inherit;
  border: var(--don-border-width-thick) solid var(--don-color-border);
  border-radius: var(--don-radius-xl);
  background-color: var(--don-color-bg-card);
  cursor: pointer;
  transition: all var(--don-transition-fast);
  min-width: 70px;
  color: var(--don-color-text-primary);

  &:hover {
    border-color: var(--don-color-text-muted);
  }

  &--selected {
    background-color: var(--don-color-primary);
    border-color: var(--don-color-primary);
    color: var(--don-color-text-inverse);
  }

  @media screen and (max-width: 768px) {
    font-size: var(--don-font-size-base);
    min-width: 60px;
    padding: var(--don-spacing-lg) var(--don-spacing-xl);
  }
}

// Montant libre
.don-custom-amount {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--don-spacing-lg);
  margin-bottom: var(--don-spacing-xl);
}

.don-custom-amount__label {
  font-size: var(--don-font-size-base);
  font-weight: var(--don-font-weight-medium);
  color: var(--don-color-text-secondary);
}

.don-custom-amount__input {
  display: flex;
  align-items: center;
  gap: var(--don-spacing-sm);
}

.don-custom-amount__currency {
  font-size: var(--don-font-size-lg);
  color: var(--don-color-text-muted);
}

// Toggle group
.don-toggle-group {
  display: flex;
  justify-content: center;
  gap: 0;
  background-color: var(--don-color-bg-disabled);
  border-radius: var(--don-radius-xl);
  padding: var(--don-spacing-xs);
  width: fit-content;
  margin: 0 auto;
}

.don-toggle-btn {
  padding: var(--don-spacing-lg) var(--don-spacing-3xl);
  font-size: var(--don-font-size-base);
  font-weight: var(--don-font-weight-medium);
  font-family: inherit;
  border: none;
  border-radius: var(--don-radius-lg);
  background-color: transparent;
  color: var(--don-color-text-muted);
  cursor: pointer;
  transition: all var(--don-transition-fast);

  &--selected {
    background-color: var(--don-color-bg-card);
    color: var(--don-color-text-primary);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
}

// Options fiscales
.don-tax-options {
  margin-top: var(--don-spacing-3xl);
  padding-top: var(--don-spacing-3xl);
  border-top: 1px solid var(--don-color-border);
}

// Coût réel
.don-real-cost {
  margin-top: var(--don-spacing-3xl);
  text-align: center;
}

.don-real-cost__trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--don-spacing-sm);
  margin-bottom: var(--don-spacing-md);
}

.don-real-cost__label {
  font-size: var(--don-font-size-base);
  color: var(--don-color-text-muted);
}

.don-real-cost__value {
  display: inline-block;
  padding: var(--don-spacing-md) var(--don-spacing-3xl);
  background-color: var(--don-color-primary);
  color: var(--don-color-text-inverse);
  border-radius: var(--don-radius-lg);
  font-size: var(--don-font-size-xl);
  font-weight: var(--don-font-weight-semibold);
}

.don-real-cost__detail {
  font-size: var(--don-font-size-sm);
  color: var(--don-color-text-placeholder);
  margin-top: var(--don-spacing-md);
}

// Info row
.don-info-row {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--don-spacing-lg);
  background-color: var(--don-color-bg-subtle);
  border-radius: var(--don-radius-lg);
}

.don-info-trigger {
  display: flex;
  align-items: center;
  gap: var(--don-spacing-md);
}

.don-info-icon {
  font-size: var(--don-font-size-lg);
}

.don-info-text {
  font-size: var(--don-font-size-sm);
  color: var(--don-color-text-muted);
}

// Erreur
.don-error {
  display: block;
  font-size: var(--don-font-size-sm) !important;
  color: red;
  text-align: center;
  min-height: 18px;
}
```

---

## 5. STEP 2 - INFORMATIONS PERSONNELLES

### 5.1 Fichier: `step2/step2.svelte`

#### Logique à CONSERVER intégralement
```typescript
// NE PAS MODIFIER:
import { validateRequired, validateEmail, validator, validateSiren, validateDate, validateDateMajor, validatePostalCode, eighteenYearsAgo } from '../../../../logic/validator';
import { DEFAULT_VALUES, FORM_CONFIG } from '../../../../logic/useSponsorshipForm.svelte';
import AdressInputs from './AdressInputs.svelte';

const oninput = (event) => { /* CONSERVER */ };
```

#### Modifications HTML à effectuer

**Structure cible**:
```svelte
<div class="don-step2">
  <!-- Header explicatif -->
  <header class="don-step2__header">
    <h1 class="don-step2__title">Pourquoi saisir ces informations ?</h1>
    <p class="don-step2__subtitle">
      {#if DEFAULT_VALUES.withTaxReduction}
        Ces informations sont indispensables pour l'édition de votre 
        <strong>reçu fiscal</strong>, impératif pour récupérer 
        <strong>votre crédit d'impôt</strong>. 
        Votre adresse email nous permettra de vous transmettre le reçu.
      {:else}
        Ces informations sont indispensables pour l'édition de votre 
        <strong>attestation de paiement</strong>.
      {/if}
    </p>
  </header>

  <!-- Formulaire -->
  <form class="don-form">
    <!-- Email -->
    <div class="don-form-group">
      <label class="don-form-label" for="email">Email *</label>
      <input
        id="email"
        type="email"
        class="don-form-input"
        placeholder="jean.lefebvre@email.fr"
        disabled={FORM_CONFIG.authEmail || (FORM_CONFIG.myLast && FORM_CONFIG.myLast.email) || FORM_CONFIG.donatorUuid}
        bind:value={DEFAULT_VALUES.email}
        use:validator={{ validateFunctions: [validateRequired, validateEmail], fieldName: 'E-mail' }}
      />
      <small class="don-error" aria-live="polite"></small>
    </div>

    <!-- Champs entreprise (conditionnels) -->
    {#if DEFAULT_VALUES.estOrganisme && DEFAULT_VALUES.withTaxReduction}
      <div class="don-form-row don-form-row--3">
        <div class="don-form-group">
          <label class="don-form-label" for="socialReason">Raison sociale *</label>
          <input id="socialReason" type="text" class="don-form-input" placeholder="KLUBR"
            bind:value={DEFAULT_VALUES.socialReason}
            use:validator={{ validateFunctions: [validateRequired], fieldName: 'Raison sociale' }}
          />
          <small class="don-error" aria-live="polite"></small>
        </div>
        <!-- SIREN et Forme juridique... -->
      </div>
      <AdressInputs />
      <!-- Logo entreprise... -->
    {/if}

    <!-- Civilité, Prénom, Nom -->
    <div class="don-form-row don-form-row--3">
      <div class="don-form-group">
        <label class="don-form-label" for="civilite">Civilité *</label>
        <select id="civilite" class="don-form-select" bind:value={DEFAULT_VALUES.civility}>
          <option value="Monsieur">Monsieur</option>
          <option value="Madame">Madame</option>
        </select>
        <small class="don-error" aria-live="polite"></small>
      </div>
      <!-- Prénom et Nom... -->
    </div>

    <!-- Date de naissance + Téléphone -->
    <div class="don-form-row don-form-row--2">
      <div class="don-form-group">
        <label class="don-form-label" for="birthdate">Date de naissance *</label>
        <input id="birthdate" type="date" class="don-form-input"
          max={eighteenYearsAgo()} min="1901-01-01"
          bind:value={DEFAULT_VALUES.birthdate}
          use:validator={{ validateFunctions: [validateRequired, validateDate, validateDateMajor], fieldName: 'Date de naissance' }}
        />
        <small class="don-error" aria-live="polite"></small>
      </div>
      {#if DEFAULT_VALUES.withTaxReduction}
        <div class="don-form-group">
          <label class="don-form-label" for="phoneNumber">Numéro de téléphone</label>
          <input id="phoneNumber" type="tel" class="don-form-input" placeholder="+330700000000"
            bind:value={DEFAULT_VALUES.tel}
          />
          <small class="don-error" aria-live="polite"></small>
        </div>
      {/if}
    </div>

    <!-- Adresse (si réduction fiscale et pas entreprise) -->
    {#if !DEFAULT_VALUES.estOrganisme && DEFAULT_VALUES.withTaxReduction}
      <AdressInputs />
    {/if}
  </form>
</div>
```

### 5.2 Fichier: `step2/index.scss`

#### CSS à SUPPRIMER
```scss
// SUPPRIMER (remplacé par don-form-*):
.step2 {
  width: 100%;

  small { &.description { ... } }

  form {
    .inputField { ... }  // Remplacé par don-form-group
    .grid-3 { ... }      // Remplacé par don-form-row--3
  }
}
```

#### CSS à CONSERVER
```scss
// CONSERVER (logo entreprise):
.step2 {
  .proLogoContainer { ... }
}
```

#### CSS à AJOUTER
```scss
@use '../../../../../../styles/main';
@use '../../../../../../styles/_design-tokens';

.don-step2 {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--don-spacing-xl);
}

.don-step2__header {
  text-align: center;
  margin-bottom: var(--don-spacing-lg);
}

.don-step2__title {
  font-size: var(--don-font-size-2xl);
  font-weight: var(--don-font-weight-bold);
  color: var(--don-color-text-primary);
  margin: 0 0 var(--don-spacing-lg) 0;
}

.don-step2__subtitle {
  font-size: var(--don-font-size-base);
  color: var(--don-color-text-muted);
  line-height: var(--don-line-height-relaxed);
  max-width: 600px;
  margin: 0 auto;
}

// Formulaire
.don-form {
  display: flex;
  flex-direction: column;
  gap: var(--don-spacing-xl);
}

.don-form-group {
  display: flex;
  flex-direction: column;
  gap: var(--don-spacing-sm);
}

.don-form-label {
  font-size: var(--don-font-size-sm);
  font-weight: var(--don-font-weight-medium);
  color: var(--don-color-text-secondary);
}

.don-form-input,
.don-form-select {
  width: 100%;
  padding: var(--don-spacing-lg) var(--don-spacing-xl);
  font-size: var(--don-font-size-md);
  font-family: inherit;
  border: var(--don-border-width) solid var(--don-color-border-input);
  border-radius: var(--don-radius-xl);
  background-color: var(--don-color-bg-input);
  color: var(--don-color-text-primary);
  outline: none;
  transition: border-color var(--don-transition-fast);
  box-sizing: border-box;

  &:focus {
    border-color: var(--don-color-accent);
  }

  &::placeholder {
    color: var(--don-color-text-placeholder);
  }

  &:disabled {
    background-color: var(--don-color-bg-subtle);
    color: var(--don-color-text-disabled);
    cursor: not-allowed;
  }
}

.don-form-input--centered {
  text-align: center;
  width: 120px;
}

.don-form-row {
  display: grid;
  gap: var(--don-spacing-xl);
}

.don-form-row--2 {
  grid-template-columns: 1fr 1fr;
  
  @media screen and (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.don-form-row--3 {
  grid-template-columns: 1fr 1fr 1fr;
  
  @media screen and (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}
```

---

## 6. STEP 3 - RÉCAPITULATIF (REFONTE MAJEURE)

### 6.1 Fichier: `step3/step3.svelte`

#### Logique à CONSERVER intégralement
```typescript
// NE PAS MODIFIER ces imports et variables:
import { DEFAULT_VALUES, isCguShown, isContributionShown, SUBSCRIPTION } from '../../../../logic/useSponsorshipForm.svelte';
import { validator, validateTrue } from '../../../../logic/validator';
import { getKlubrCGU } from '../../../../logic/api';
import { calculateTaxReduction, formatCurrency } from '../../../../logic/utils';
import { calculateFees, type FeeCalculationOutput } from '../../../../logic/fee-calculation-helper';

// Variables dérivées - CONSERVER:
const tradePolicy = $derived(SUBSCRIPTION.klubr?.trade_policy);
const isStripeConnect = $derived(tradePolicy?.stripe_connect === true);
const allowDonorFeeChoice = $derived(tradePolicy?.allow_donor_fee_choice ?? true);
const showFeeChoice = $derived(isStripeConnect && allowDonorFeeChoice);
const isProjectDonation = $derived(...);
const defaultDonorPaysFee = $derived(...);
const commissionPercentage = $derived(tradePolicy?.commissionPercentage ?? 4);
const fees = $derived<FeeCalculationOutput>(calculateFees({...}));
const baseTotal = $derived(...);

// onMount - CONSERVER:
onMount(() => {
  if (isNaN(DEFAULT_VALUES.contributionAKlubr)) { ... }
  if (isStripeConnect) { DEFAULT_VALUES.donorPaysFee = defaultDonorPaysFee; }
  getKlubrCGU().then((res) => { ... });
});
```

#### Structure HTML COMPLÈTEMENT refactorée

```svelte
{#if $isCguShown}
  <!-- CGU - CONSERVER TEL QUEL -->
{:else if $isContributionShown && SUBSCRIPTION.allowKlubrContribution}
  <Contribution />
{:else}
  <div class="don-step3">
    <!-- En-tête avec montant -->
    <header class="don-step3__header">
      <div class="don-header-badge">
        <span>🎁</span> Votre don
      </div>
      <div class="don-header-amount">{formatCurrency(DEFAULT_VALUES.montant)}</div>
      <div class="don-header-for">pour</div>
      <div class="don-header-association">{SUBSCRIPTION.klubr?.denomination}</div>
      {#if SUBSCRIPTION.project && SUBSCRIPTION.project.uuid !== SUBSCRIPTION.klubr?.uuid}
        <div class="don-project-badge">🎯 {SUBSCRIPTION.project.titre}</div>
      {/if}
    </header>

    <!-- SECTION 1: Choix des frais (NOUVEAU DESIGN) -->
    {#if showFeeChoice}
      <section class="don-section">
        <h2 class="don-section__title">
          <span class="don-section__icon">💡</span>
          Comment maximiser votre impact ?
        </h2>

        <div class="don-options-grid">
          <!-- Option 1: Je couvre les frais -->
          <button
            type="button"
            class="don-option-card"
            class:don-option-card--selected={DEFAULT_VALUES.donorPaysFee === true}
            onclick={() => (DEFAULT_VALUES.donorPaysFee = true)}
          >
            {#if DEFAULT_VALUES.donorPaysFee === true}
              <div class="don-option-card__check">✓</div>
            {/if}
            <div class="don-option-card__badge">✨ Recommandé</div>
            <h3 class="don-option-card__title">Je couvre les frais</h3>
            <p class="don-option-card__desc">
              L'association reçoit <strong>100%</strong> de votre don
            </p>
            <div class="don-option-card__metrics">
              <div class="don-option-card__metric">
                <span>Association reçoit</span>
                <span class="don-metric--highlight">{formatCurrency(DEFAULT_VALUES.montant)}</span>
              </div>
              <div class="don-option-card__metric">
                <span>Vous payez</span>
                <span>{formatCurrency(DEFAULT_VALUES.montant + fees.commissionDonaction + fees.fraisStripeEstimes)}</span>
              </div>
              {#if DEFAULT_VALUES.withTaxReduction}
                <div class="don-option-card__metric">
                  <span>Reçu fiscal</span>
                  <span>{formatCurrency(DEFAULT_VALUES.montant)}</span>
                </div>
              {/if}
            </div>
          </button>

          <!-- Option 2: Frais inclus -->
          <button
            type="button"
            class="don-option-card"
            class:don-option-card--selected={DEFAULT_VALUES.donorPaysFee === false}
            onclick={() => (DEFAULT_VALUES.donorPaysFee = false)}
          >
            {#if DEFAULT_VALUES.donorPaysFee === false}
              <div class="don-option-card__check">✓</div>
            {/if}
            <h3 class="don-option-card__title">Frais inclus dans le don</h3>
            <p class="don-option-card__desc">
              Les frais sont déduits du montant reçu
            </p>
            <div class="don-option-card__metrics">
              <div class="don-option-card__metric">
                <span>Association reçoit</span>
                <span>{formatCurrency(DEFAULT_VALUES.montant - fees.applicationFee)}</span>
              </div>
              <div class="don-option-card__metric">
                <span>Vous payez</span>
                <span>{formatCurrency(DEFAULT_VALUES.montant)}</span>
              </div>
              {#if DEFAULT_VALUES.withTaxReduction}
                <div class="don-option-card__metric">
                  <span>Reçu fiscal</span>
                  <span>{formatCurrency(DEFAULT_VALUES.montant - fees.applicationFee)}</span>
                </div>
              {/if}
            </div>
          </button>
        </div>

        <!-- Détails des frais -->
        <button type="button" class="don-details-toggle" onclick={() => showFeeDetails = !showFeeDetails}>
          <span>{showFeeDetails ? '−' : '+'}</span>
          En savoir plus sur les frais
        </button>
        
        {#if showFeeDetails}
          <div class="don-fee-details">
            <p class="don-fee-details__title">Détail des frais ({formatCurrency(fees.applicationFee)}) :</p>
            <div class="don-fee-details__line">
              <span>Commission plateforme ({commissionPercentage}%)</span>
              <span>{formatCurrency(fees.commissionDonaction)}</span>
            </div>
            <div class="don-fee-details__line">
              <span>Frais de transaction</span>
              <span>~{formatCurrency(fees.fraisStripeEstimes)}</span>
            </div>
            <p class="don-fee-details__note">
              Ces frais permettent à DONACTION de fonctionner et garantissent la sécurité de votre paiement.
            </p>
          </div>
        {/if}
      </section>
    {/if}

    <!-- SECTION 2: Récapitulatif -->
    <section class="don-section">
      <h2 class="don-section__title">
        <span class="don-section__icon">📊</span>
        Récapitulatif
      </h2>

      <div class="don-summary-layout">
        <!-- Lignes récap -->
        <div class="don-summary-lines">
          <!-- Don principal -->
          <div class="don-summary-line">
            <div class="don-summary-line__left">
              <span class="don-summary-line__icon">🎁</span>
              <span>Don à {SUBSCRIPTION.klubr?.denomination}</span>
            </div>
            <span class="don-summary-line__amount">{formatCurrency(DEFAULT_VALUES.montant)}</span>
          </div>

          <!-- Frais (si donor pays fee) -->
          {#if isStripeConnect && DEFAULT_VALUES.donorPaysFee}
            <div class="don-summary-line don-summary-line--fees">
              <div class="don-summary-line__left">
                <span class="don-summary-line__icon">💳</span>
                <span>Frais de traitement</span>
              </div>
              <span class="don-summary-line__amount--fees">+{formatCurrency(fees.commissionDonaction + fees.fraisStripeEstimes)}</span>
            </div>
          {/if}

          <!-- Soutien plateforme -->
          {#if SUBSCRIPTION.allowKlubrContribution}
            <div class="don-support-row">
              <div class="don-support-row__left">
                <span class="don-summary-line__icon">💛</span>
                <div class="don-support-row__text">
                  <span>Soutien à la plateforme</span>
                  <span class="don-support-row__note">Non déductible des impôts</span>
                </div>
              </div>
              <div class="don-support-row__right">
                <span class="don-support-row__value">{formatCurrency(DEFAULT_VALUES.contributionAKlubr)}</span>
                <button 
                  type="button"
                  class="don-support-row__edit"
                  onclick={() => isContributionShown.set(true)}
                >
                  Modifier
                </button>
              </div>
            </div>
          {/if}

          <!-- Séparateur -->
          <div class="don-summary-divider"></div>

          <!-- Total -->
          <div class="don-summary-line don-summary-line--total">
            <span>Total à payer</span>
            <span class="don-summary-line__total">{formatCurrency(fees.totalDonateur)}</span>
          </div>
        </div>

        <!-- Carte impact -->
        <div class="don-impact-card">
          <div class="don-impact-card__icon">🏆</div>
          <div class="don-impact-card__label">L'association recevra</div>
          <div class="don-impact-card__value">{formatCurrency(fees.netAssociation)}</div>
          {#if DEFAULT_VALUES.donorPaysFee}
            <div class="don-impact-card__badge">100% de votre don !</div>
          {/if}
        </div>
      </div>

      <!-- Section fiscale -->
      {#if DEFAULT_VALUES.withTaxReduction}
        <div class="don-tax-section">
          <div class="don-tax-flow">
            <div class="don-tax-item">
              <span class="don-tax-item__icon">📄</span>
              <span class="don-tax-item__label">Reçu fiscal</span>
              <span class="don-tax-item__value">{formatCurrency(fees.montantRecuFiscal)}</span>
            </div>
            <span class="don-tax-arrow">→</span>
            <div class="don-tax-item">
              <span class="don-tax-item__icon">💰</span>
              <span class="don-tax-item__label">Réduction ({DEFAULT_VALUES.estOrganisme ? '60' : '66'}%)</span>
              <span class="don-tax-item__value">{formatCurrency(fees.montantRecuFiscal * (DEFAULT_VALUES.estOrganisme ? 0.6 : 0.66))}</span>
            </div>
            <span class="don-tax-arrow">→</span>
            <div class="don-tax-item don-tax-item--final">
              <span class="don-tax-item__label">Coût réel</span>
              <span class="don-tax-item__value--final">
                {calculateTaxReduction(fees.montantRecuFiscal, DEFAULT_VALUES.estOrganisme)} €
              </span>
            </div>
          </div>
          {#if SUBSCRIPTION.allowKlubrContribution && DEFAULT_VALUES.contributionAKlubr > 0}
            <p class="don-tax-note">
              * Le soutien à la plateforme ({formatCurrency(DEFAULT_VALUES.contributionAKlubr)}) n'est pas déductible
            </p>
          {/if}
        </div>
      {/if}
    </section>

    <!-- Documents -->
    <section class="don-docs-section">
      <h3 class="don-docs-title">📬 Vous recevrez immédiatement</h3>
      <div class="don-docs-grid">
        <div class="don-doc-card">
          <span class="don-doc-card__icon">📋</span>
          <span>Attestation de don</span>
        </div>
        {#if DEFAULT_VALUES.withTaxReduction}
          <div class="don-doc-card">
            <span class="don-doc-card__icon">🧾</span>
            <span>Reçu fiscal Cerfa</span>
          </div>
        {/if}
      </div>
    </section>

    <!-- CGU et acceptations - CONSERVER LA LOGIQUE EXISTANTE -->
    <Tooltip><!-- Envoi justificatifs - CONSERVER --></Tooltip>
    
    <img src={DEFAULT_VALUES.withTaxReduction ? att_recu : att} ... />
    
    <div class="checkboxes">
      <!-- CONSERVER les checkboxes existantes avec leurs validateurs -->
    </div>
  </div>
{/if}
```

#### Variable locale à AJOUTER dans le script
```typescript
// AJOUTER cette variable pour le toggle des détails de frais:
let showFeeDetails = $state(false);
```

### 6.2 Fichier: `step3/index.scss`

#### CSS à SUPPRIMER ENTIÈREMENT
```scss
// SUPPRIMER tout le contenu existant de .step3 sauf :
// - .klubrCGU (si présent, le garder)
// - Styles des checkboxes d'acceptation

// À SUPPRIMER:
.step3 {
  margin: 2.5rem;  // Remplacé
  
  .recap { ... }  // Remplacé par don-header-*
  .recapList { ... }  // Remplacé par don-summary-*
  .association-message { ... }  // Remplacé par don-impact-card
  .receipt-preview { ... }  // Supprimé (intégré dans tax-section)
  .feeChoiceSection { ... }  // Remplacé par don-section + don-options-grid
  .feeChoiceTitle { ... }
  .feeOption { ... }  // Remplacé par don-option-card
  .optionContent { ... }
  .optionDescription { ... }
  .feeDetail { ... }
  .optionSummary { ... }
}
```

#### Nouveau CSS complet pour step3/index.scss
```scss
@use '../../../../../../styles/main';
@use '../../../../../../styles/_design-tokens';

// Styles CGU à conserver si présents
.klubrCGU {
  // ... conserver les styles existants
}

// Nouveau design Step 3
.don-step3 {
  display: flex;
  flex-direction: column;
  gap: var(--don-spacing-2xl);
  padding: var(--don-spacing-lg) 0;
}

// Header
.don-step3__header {
  text-align: center;
  margin-bottom: var(--don-spacing-lg);
}

.don-header-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--don-spacing-sm);
  padding: var(--don-spacing-sm) var(--don-spacing-xl);
  background-color: var(--don-color-accent-light);
  color: var(--don-color-accent);
  border-radius: var(--don-radius-full);
  font-size: var(--don-font-size-sm);
  font-weight: var(--don-font-weight-medium);
  margin-bottom: var(--don-spacing-lg);
}

.don-header-amount {
  font-size: var(--don-font-size-5xl);
  font-weight: var(--don-font-weight-bold);
  color: var(--don-color-text-primary);
  letter-spacing: -1px;
}

.don-header-for {
  font-size: var(--don-font-size-md);
  color: var(--don-color-text-placeholder);
  margin: var(--don-spacing-xs) 0;
}

.don-header-association {
  font-size: var(--don-font-size-xl);
  font-weight: var(--don-font-weight-medium);
  color: var(--don-color-text-secondary);
}

.don-project-badge {
  display: inline-block;
  margin-top: var(--don-spacing-lg);
  padding: var(--don-spacing-sm) var(--don-spacing-xl);
  background-color: var(--don-color-success-light);
  color: var(--don-color-success-dark);
  border-radius: var(--don-radius-md);
  font-size: var(--don-font-size-sm);
  font-weight: var(--don-font-weight-medium);
}

// Section
.don-section {
  background-color: var(--don-color-bg-card);
  border-radius: var(--don-radius-3xl);
  padding: var(--don-spacing-3xl);
  box-shadow: var(--don-shadow-card);
}

.don-section__title {
  font-size: var(--don-font-size-lg);
  font-weight: var(--don-font-weight-semibold);
  color: var(--don-color-text-primary);
  margin: 0 0 var(--don-spacing-2xl) 0;
  display: flex;
  align-items: center;
  gap: var(--don-spacing-md);
}

.don-section__icon {
  font-size: var(--don-font-size-xl);
}

// Options grid
.don-options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--don-spacing-xl);
  margin-bottom: var(--don-spacing-xl);

  @media screen and (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.don-option-card {
  position: relative;
  padding: var(--don-spacing-2xl);
  border-radius: var(--don-radius-2xl);
  border: var(--don-border-width-thick) solid var(--don-color-border);
  background-color: var(--don-color-bg-card);
  cursor: pointer;
  text-align: left;
  transition: all var(--don-transition-normal);
  font-family: inherit;

  &:hover {
    border-color: var(--don-color-text-muted);
  }

  &--selected {
    border-color: var(--don-color-accent-border);
    background-color: var(--don-color-accent-light);
    box-shadow: var(--don-shadow-lg);
  }
}

.don-option-card__check {
  position: absolute;
  top: var(--don-spacing-lg);
  right: var(--don-spacing-lg);
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--don-color-accent);
  color: var(--don-color-text-inverse);
  border-radius: var(--don-radius-full);
  font-size: var(--don-font-size-sm);
  font-weight: var(--don-font-weight-semibold);
}

.don-option-card__badge {
  display: inline-block;
  font-size: var(--don-font-size-xs);
  font-weight: var(--don-font-weight-semibold);
  color: #D97706;
  background-color: #FEF3C7;
  padding: 3px var(--don-spacing-md);
  border-radius: var(--don-radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: var(--don-spacing-lg);
}

.don-option-card__title {
  font-size: var(--don-font-size-md);
  font-weight: var(--don-font-weight-semibold);
  color: var(--don-color-text-primary);
  margin: 0 0 var(--don-spacing-sm) 0;
}

.don-option-card__desc {
  font-size: var(--don-font-size-sm);
  color: var(--don-color-text-muted);
  margin: 0 0 var(--don-spacing-xl) 0;
  line-height: var(--don-line-height-normal);
}

.don-option-card__metrics {
  border-top: var(--don-border-width) solid var(--don-color-border);
  padding-top: var(--don-spacing-lg);
}

.don-option-card__metric {
  display: flex;
  justify-content: space-between;
  font-size: var(--don-font-size-sm);
  color: var(--don-color-text-muted);
  margin-bottom: var(--don-spacing-sm);
}

.don-metric--highlight {
  color: var(--don-color-success);
  font-weight: var(--don-font-weight-semibold);
}

// Details toggle
.don-details-toggle {
  display: flex;
  align-items: center;
  gap: var(--don-spacing-sm);
  background: none;
  border: none;
  color: var(--don-color-text-muted);
  font-size: var(--don-font-size-sm);
  cursor: pointer;
  padding: var(--don-spacing-md) 0;
  margin: 0 auto;
  font-family: inherit;
}

.don-fee-details {
  background-color: var(--don-color-bg-subtle);
  border-radius: var(--don-radius-lg);
  padding: var(--don-spacing-xl);
  margin-top: var(--don-spacing-md);
  font-size: var(--don-font-size-sm);
}

.don-fee-details__title {
  margin: 0 0 var(--don-spacing-lg) 0;
  font-weight: var(--don-font-weight-medium);
  color: var(--don-color-text-secondary);
}

.don-fee-details__line {
  display: flex;
  justify-content: space-between;
  color: var(--don-color-text-muted);
  margin-bottom: var(--don-spacing-xs);
}

.don-fee-details__note {
  margin: var(--don-spacing-lg) 0 0 0;
  font-size: var(--don-font-size-sm);
  color: var(--don-color-text-placeholder);
  font-style: italic;
}

// Summary layout
.don-summary-layout {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--don-spacing-3xl);
  align-items: start;

  @media screen and (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.don-summary-lines {
  display: flex;
  flex-direction: column;
  gap: var(--don-spacing-lg);
}

.don-summary-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--don-font-size-base);
}

.don-summary-line__left {
  display: flex;
  align-items: center;
  gap: var(--don-spacing-lg);
  color: var(--don-color-text-secondary);
}

.don-summary-line__icon {
  font-size: var(--don-font-size-lg);
}

.don-summary-line__amount {
  font-weight: var(--don-font-weight-medium);
  color: var(--don-color-text-primary);
}

.don-summary-line--fees {
  font-size: var(--don-font-size-sm);
  color: var(--don-color-text-placeholder);
  padding-left: calc(var(--don-spacing-lg) + var(--don-font-size-lg));
}

.don-summary-line__amount--fees {
  font-style: italic;
}

.don-summary-line--total {
  font-size: var(--don-font-size-md);
  font-weight: var(--don-font-weight-semibold);
  color: var(--don-color-text-primary);
}

.don-summary-line__total {
  font-size: var(--don-font-size-2xl);
  font-weight: var(--don-font-weight-bold);
}

.don-summary-divider {
  height: 1px;
  background-color: var(--don-color-border);
  margin: var(--don-spacing-md) 0;
}

// Support row
.don-support-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--don-font-size-base);
  background-color: var(--don-color-warning-light);
  margin: 0 calc(var(--don-spacing-xl) * -1);
  padding: var(--don-spacing-lg) var(--don-spacing-xl);
  border-radius: var(--don-radius-lg);
}

.don-support-row__left {
  display: flex;
  align-items: center;
  gap: var(--don-spacing-lg);
}

.don-support-row__text {
  display: flex;
  flex-direction: column;
}

.don-support-row__note {
  font-size: 11px;
  color: var(--don-color-warning);
  margin-top: 2px;
}

.don-support-row__right {
  display: flex;
  align-items: center;
  gap: var(--don-spacing-lg);
}

.don-support-row__value {
  font-weight: var(--don-font-weight-semibold);
  color: var(--don-color-warning-dark);
}

.don-support-row__edit {
  padding: var(--don-spacing-xs) var(--don-spacing-lg);
  background-color: #FEF3C7;
  border: var(--don-border-width) solid var(--don-color-warning-border);
  border-radius: var(--don-radius-md);
  font-size: var(--don-font-size-sm);
  color: var(--don-color-warning-dark);
  cursor: pointer;
  font-weight: var(--don-font-weight-medium);
  font-family: inherit;
}

// Impact card
.don-impact-card {
  background-color: var(--don-color-success);
  color: var(--don-color-text-inverse);
  border-radius: var(--don-radius-2xl);
  padding: var(--don-spacing-2xl);
  text-align: center;
  min-width: 150px;

  @media screen and (max-width: 768px) {
    order: -1;
  }
}

.don-impact-card__icon {
  font-size: var(--don-font-size-3xl);
  margin-bottom: var(--don-spacing-md);
}

.don-impact-card__label {
  font-size: 11px;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--don-spacing-xs);
}

.don-impact-card__value {
  font-size: 26px;
  font-weight: var(--don-font-weight-bold);
  letter-spacing: -0.5px;
}

.don-impact-card__badge {
  margin-top: var(--don-spacing-md);
  font-size: 11px;
  background-color: rgba(255, 255, 255, 0.2);
  padding: var(--don-spacing-xs) var(--don-spacing-lg);
  border-radius: var(--don-radius-sm);
  font-weight: var(--don-font-weight-medium);
}

// Tax section
.don-tax-section {
  margin-top: var(--don-spacing-2xl);
  padding: var(--don-spacing-xl);
  background-color: var(--don-color-success-light);
  border-radius: var(--don-radius-xl);
}

.don-tax-flow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--don-spacing-lg);
}

.don-tax-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.don-tax-item__icon {
  font-size: var(--don-font-size-xl);
  margin-bottom: 2px;
}

.don-tax-item__label {
  font-size: var(--don-font-size-xs);
  color: var(--don-color-success-dark);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.don-tax-item__value {
  font-size: var(--don-font-size-lg);
  font-weight: var(--don-font-weight-semibold);
  color: var(--don-color-success-dark);
}

.don-tax-arrow {
  color: #86EFAC;
  font-size: var(--don-font-size-xl);
  font-weight: 300;
}

.don-tax-item--final {
  background-color: #DCFCE7;
  padding: var(--don-spacing-md) var(--don-spacing-xl);
  border-radius: var(--don-radius-lg);
}

.don-tax-item__value--final {
  font-size: var(--don-font-size-2xl);
  font-weight: var(--don-font-weight-bold);
  color: var(--don-color-success);
}

.don-tax-note {
  margin: var(--don-spacing-lg) 0 0 0;
  font-size: 11px;
  color: var(--don-color-text-muted);
  text-align: center;
  font-style: italic;
}

// Documents
.don-docs-section {
  margin-bottom: var(--don-spacing-lg);
}

.don-docs-title {
  font-size: var(--don-font-size-sm);
  font-weight: var(--don-font-weight-medium);
  color: var(--don-color-text-muted);
  margin: 0 0 var(--don-spacing-lg) 0;
}

.don-docs-grid {
  display: flex;
  gap: var(--don-spacing-lg);

  @media screen and (max-width: 768px) {
    flex-direction: column;
  }
}

.don-doc-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--don-spacing-lg);
  padding: var(--don-spacing-xl);
  background-color: var(--don-color-bg-card);
  border-radius: var(--don-radius-xl);
  box-shadow: var(--don-shadow-xs);
  font-size: var(--don-font-size-sm);
  color: var(--don-color-text-secondary);
  font-weight: var(--don-font-weight-medium);
}

.don-doc-card__icon {
  font-size: var(--don-font-size-xl);
}

// Checkboxes (conserver structure existante, améliorer styles)
.checkboxes {
  display: flex;
  flex-direction: column;
  gap: var(--don-spacing-lg);
  margin-top: var(--don-spacing-xl);
}
```

---

## 7. COMPOSANTS PARTAGÉS

### 7.1 Contribution.svelte - Amélioration Emoji

#### Modifier la fonction `getEmoji` pour avoir plus de niveaux
Dans le fichier `contribution/Contribution.svelte`, la logique Lottie existante doit être **conservée** mais on peut ajouter une fonction helper pour l'affichage emoji si on veut remplacer Lottie :

```typescript
// OPTION: Ajouter cette fonction si on veut un emoji simple au lieu de Lottie
function getEmojiForAmount(amount: number): string {
  if (amount === 0) return '😢';
  if (amount <= 5) return '🙂';
  if (amount <= 10) return '😊';
  if (amount <= 15) return '😄';
  if (amount <= 20) return '🥰';
  return '🤩';
}
```

**IMPORTANT**: La logique Lottie actuelle (`lottieSegments`, `segmentIndex`, `goToFrame`) est sophistiquée et fonctionne bien. Ne la remplacer que si explicitement demandé.

### 7.2 Breadcrumb - Amélioration légère

Le composant Breadcrumb actuel est fonctionnel. Améliorer uniquement les styles dans `breadcrumb/index.scss`:

```scss
// Remplacer le contenu par:
@use '../../../../styles/_design-tokens';

.breadcrumbContainer {
  font-family: var(--don-font-family);
  align-self: start;
  width: 100%;
  font-size: var(--don-font-size-sm);
  display: flex;
  padding: 0 var(--don-spacing-3xl) var(--don-spacing-3xl);
  max-width: 90%;
  flex-wrap: wrap;
  align-items: center;
  justify-content: start;
  gap: var(--don-spacing-md);
  color: var(--don-color-text-placeholder);
  margin-bottom: var(--don-spacing-md);

  &.true {
    display: flex;
  }

  &.false {
    display: flex;
    @media screen and (max-width: 768px) {
      display: none;
    }
  }

  p {
    all: unset;
    transition: color var(--don-transition-normal);

    &.active {
      color: var(--don-color-text-primary);
      font-weight: var(--don-font-weight-semibold);
    }
  }

  @media screen and (max-width: 768px) {
    padding: var(--don-spacing-lg) var(--don-spacing-3xl) var(--don-spacing-md);
    line-height: 1;
  }
}
```

---

## 8. STYLES GLOBAUX

### 8.1 Créer `src/styles/_design-tokens.scss`

```scss
// DONACTION Design Tokens
// Ce fichier définit toutes les variables CSS du design system

:root {
  // Couleurs de marque
  --don-color-primary: #111827;
  --don-color-primary-hover: #1F2937;
  --don-color-accent: #3B82F6;
  --don-color-accent-light: #EFF6FF;
  --don-color-accent-border: #3B82F6;
  
  // Couleurs sémantiques
  --don-color-success: #059669;
  --don-color-success-light: #F0FDF4;
  --don-color-success-dark: #15803D;
  
  --don-color-warning: #F59E0B;
  --don-color-warning-light: #FFFBEB;
  --don-color-warning-dark: #92400E;
  --don-color-warning-border: #FCD34D;
  
  // Neutres
  --don-color-bg-page: #FAFBFC;
  --don-color-bg-card: #FFFFFF;
  --don-color-bg-subtle: #F9FAFB;
  --don-color-bg-input: #FFFFFF;
  --don-color-bg-disabled: #F3F4F6;
  
  --don-color-border: #E5E7EB;
  --don-color-border-light: #F3F4F6;
  --don-color-border-input: #D1D5DB;
  
  --don-color-text-primary: #111827;
  --don-color-text-secondary: #374151;
  --don-color-text-muted: #6B7280;
  --don-color-text-placeholder: #9CA3AF;
  --don-color-text-disabled: #9CA3AF;
  --don-color-text-inverse: #FFFFFF;
  
  // Typographie
  --don-font-family: 'Maven-Pro-Regular', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  
  --don-font-size-xs: 10px;
  --don-font-size-sm: 12px;
  --don-font-size-base: 14px;
  --don-font-size-md: 15px;
  --don-font-size-lg: 16px;
  --don-font-size-xl: 18px;
  --don-font-size-2xl: 20px;
  --don-font-size-3xl: 24px;
  --don-font-size-4xl: 28px;
  --don-font-size-5xl: 42px;
  
  --don-font-weight-normal: 400;
  --don-font-weight-medium: 500;
  --don-font-weight-semibold: 600;
  --don-font-weight-bold: 700;
  
  --don-line-height-tight: 1;
  --don-line-height-snug: 1.25;
  --don-line-height-normal: 1.4;
  --don-line-height-relaxed: 1.6;
  
  // Espacements
  --don-spacing-xs: 4px;
  --don-spacing-sm: 6px;
  --don-spacing-md: 8px;
  --don-spacing-lg: 12px;
  --don-spacing-xl: 16px;
  --don-spacing-2xl: 20px;
  --don-spacing-3xl: 24px;
  --don-spacing-4xl: 28px;
  --don-spacing-5xl: 32px;
  
  // Bordures
  --don-radius-sm: 4px;
  --don-radius-md: 6px;
  --don-radius-lg: 8px;
  --don-radius-xl: 10px;
  --don-radius-2xl: 12px;
  --don-radius-3xl: 16px;
  --don-radius-full: 9999px;
  
  --don-border-width: 1px;
  --don-border-width-thick: 2px;
  
  // Ombres
  --don-shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
  --don-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
  --don-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --don-shadow-lg: 0 4px 12px rgba(59, 130, 246, 0.12);
  --don-shadow-card: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  
  // Transitions
  --don-transition-fast: 0.15s ease;
  --don-transition-normal: 0.2s ease;
  --don-transition-slow: 0.3s ease;
}
```

### 8.2 Modifier `src/styles/main.scss`

Ajouter en haut du fichier:
```scss
@use './_design-tokens';  // AJOUTER cette ligne

@use "../assets/fonts/index";

// ... reste du fichier inchangé
```

---

## 9. CHECKLIST DE VALIDATION

### Tests fonctionnels (après chaque modification)

#### Step 1
- [ ] Boutons de montant cliquables et sélection visible
- [ ] Montant libre modifiable
- [ ] Toggle Oui/Non fonctionne
- [ ] Toggle Particulier/Entreprise fonctionne (si Oui sélectionné)
- [ ] Coût après réduction s'affiche correctement
- [ ] Validation du montant (min 10€, max 100000€)
- [ ] Sélection de projet fonctionne (si activé)

#### Step 2
- [ ] Tous les champs sont remplissables
- [ ] Validations fonctionnent (email, date, SIREN...)
- [ ] Champs conditionnels apparaissent/disparaissent correctement
- [ ] Autocomplétion d'adresse fonctionne

#### Step 3
- [ ] Les 2 options de frais sont cliquables
- [ ] Les calculs sont corrects:
  - Option 1 (donor pays fee): Association reçoit 100% du don
  - Option 2 (frais inclus): Association reçoit don - frais
- [ ] Soutien plateforme modifiable
- [ ] Bouton "Modifier" ouvre l'écran Contribution
- [ ] Total s'affiche correctement
- [ ] Section fiscale montre les bons montants
- [ ] Checkboxes CGU fonctionnent
- [ ] Navigation vers Step 4 fonctionne

### Tests visuels
- [ ] Couleurs du club appliquées (triangles décoratifs)
- [ ] Responsive mobile (< 768px)
- [ ] Animations fluides
- [ ] Pas de coupure de texte
- [ ] Contraste suffisant

### Tests de non-régression
- [ ] Step 4 (Stripe) fonctionne toujours
- [ ] Step 5 (Confirmation) s'affiche
- [ ] Emails partent correctement
- [ ] Données sauvegardées en base

---

## 📝 NOTES FINALES POUR CLAUDE CODE

1. **Toujours tester** après chaque modification de fichier
2. **Ne jamais modifier** les fichiers dans `/logic/` sauf indication explicite
3. **Préserver les imports** existants dans chaque fichier
4. **Utiliser les classes CSS** du design system plutôt que des styles inline
5. **Conserver les slots** et leur structure
6. **Le thème dynamique** (couleurs du club) doit continuer à fonctionner via `SUBSCRIPTION.klubr.klubr_house`

Bonne implémentation ! 🚀
