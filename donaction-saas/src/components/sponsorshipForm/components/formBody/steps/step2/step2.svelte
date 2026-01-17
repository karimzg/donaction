<script lang="ts">
  import {
    validateRequired,
    validateEmail,
    validator,
    validateSiren,
    validateDate,
    validateDateMajor,
    validatePostalCode,
    eighteenYearsAgo
  } from '../../../../logic/validator';
  import { DEFAULT_VALUES, FORM_CONFIG } from '../../../../logic/useSponsorshipForm.svelte';
  import AdressInputs from './AdressInputs.svelte';
  import DatePicker from './DatePicker.svelte';
  import LogoUpload from './LogoUpload.svelte';
</script>

<div class="don-step2">
  <!-- Header -->
  <header class="don-step2__header">
    <h1 class="don-step2__title">Pourquoi saisir ces informations ?</h1>
    <p class="don-step2__subtitle">
      {#if DEFAULT_VALUES.withTaxReduction}
        Ces informations sont indispensables pour l'édition de votre <strong>reçu fiscal</strong>, impératif pour récupérer <strong>votre crédit d'impôt</strong>. Votre adresse email nous permettra de vous transmettre le reçu.
      {:else}
        Ces informations sont indispensables pour l'édition de votre <strong>attestation de paiement</strong>.
      {/if}
    </p>
  </header>

  <!-- Form -->
  <form class="don-form">
    <!-- Email -->
    <div class="don-form-group">
      <label class="don-form-label" for="email">Email *</label>
      <input
        id="email"
        type="email"
        class="don-form-input"
        placeholder="jean.lefebvre@email.fr"
        disabled={FORM_CONFIG.authEmail ||
          (FORM_CONFIG.myLast && FORM_CONFIG.myLast.email) ||
          FORM_CONFIG.donatorUuid}
        bind:value={DEFAULT_VALUES.email}
        use:validator={{
          validateFunctions: [validateRequired, validateEmail],
          fieldName: 'E-mail'
        }}
      />
      <small class="don-error" aria-live="polite"></small>
    </div>

    <!-- Company fields (conditional) -->
    {#if DEFAULT_VALUES.estOrganisme && DEFAULT_VALUES.withTaxReduction}
      <div class="don-company-section don-section-animate">
      <div class="don-form-row don-form-row--3">
        <div class="don-form-group">
          <label class="don-form-label" for="socialReason">Raison sociale *</label>
          <input
            id="socialReason"
            type="text"
            class="don-form-input"
            placeholder="KLUBR"
            bind:value={DEFAULT_VALUES.socialReason}
            use:validator={{
              validateFunctions: [validateRequired],
              fieldName: 'Raison sociale'
            }}
          />
          <small class="don-error" aria-live="polite"></small>
        </div>
        <div class="don-form-group">
          <label class="don-form-label" for="siren">Siren *</label>
          <input
            id="siren"
            type="text"
            class="don-form-input"
            placeholder="123 456 789"
            bind:value={DEFAULT_VALUES.siren}
            use:validator={{
              validateFunctions: [validateRequired, validateSiren],
              fieldName: 'Siren'
            }}
          />
          <small class="don-error" aria-live="polite"></small>
        </div>
        <div class="don-form-group">
          <label class="don-form-label" for="formeJuridique">Forme juridique *</label>
          <input
            id="formeJuridique"
            type="text"
            class="don-form-input"
            placeholder="SARL"
            bind:value={DEFAULT_VALUES.legalForm}
            use:validator={{
              validateFunctions: [validateRequired],
              fieldName: 'Forme juridique'
            }}
          />
          <small class="don-error" aria-live="polite"></small>
        </div>
      </div>
      <AdressInputs />
      <div class="don-form-group">
        <label class="don-form-label">Logo de votre société (facultatif)</label>
        <LogoUpload
          bind:value={DEFAULT_VALUES.logo}
          maxSize={2 * 1024 * 1024}
          accept={['image/png', 'image/jpeg', 'image/webp']}
        />
      </div>
      <hr class="w-full" />
      </div>
    {/if}

    <!-- Civility, First name, Last name -->
    <div class="don-form-row don-form-row--3">
      <div class="don-form-group">
        <label class="don-form-label" for="civilite">Civilité *</label>
        <select class="don-form-select" bind:value={DEFAULT_VALUES.civility} id="civilite" name="civilite">
          <option value="Monsieur">Monsieur</option>
          <option value="Madame">Madame</option>
        </select>
        <small class="don-error" aria-live="polite"></small>
      </div>
      <div class="don-form-group">
        <label class="don-form-label" for="prenom">Prénom *</label>
        <input
          id="prenom"
          type="text"
          class="don-form-input"
          placeholder="Jean"
          bind:value={DEFAULT_VALUES.firstName}
          use:validator={{
            validateFunctions: [validateRequired],
            fieldName: 'Prénom'
          }}
        />
        <small class="don-error" aria-live="polite"></small>
      </div>
      <div class="don-form-group">
        <label class="don-form-label" for="nom">Nom *</label>
        <input
          id="nom"
          type="text"
          class="don-form-input"
          placeholder="LEFEBVRE"
          bind:value={DEFAULT_VALUES.lastName}
          use:validator={{
            validateFunctions: [validateRequired],
            fieldName: 'Nom'
          }}
        />
        <small class="don-error" aria-live="polite"></small>
      </div>
    </div>

    <!-- Birthdate + Phone -->
    <div class="don-form-row don-form-row--2">
      <div class="don-form-group">
        <label class="don-form-label" for="birthdate">Date de naissance *</label>
        <DatePicker
          bind:value={DEFAULT_VALUES.birthdate}
          max={eighteenYearsAgo()}
          min="1901-01-01"
          required
        />
      </div>
      {#if DEFAULT_VALUES.withTaxReduction}
        <div class="don-form-group">
          <label class="don-form-label" for="phoneNumber">Numéro de téléphone</label>
          <input
            id="phoneNumber"
            type="tel"
            class="don-form-input"
            placeholder="+330700000000"
            bind:value={DEFAULT_VALUES.tel}
          />
          <small class="don-error" aria-live="polite"></small>
        </div>
      {/if}
    </div>

    <!-- Address (if tax reduction and not company) -->
    {#if !DEFAULT_VALUES.estOrganisme && DEFAULT_VALUES.withTaxReduction}
      <AdressInputs />
    {/if}
  </form>
</div>

<style lang="scss">
  @use 'index';
</style>
