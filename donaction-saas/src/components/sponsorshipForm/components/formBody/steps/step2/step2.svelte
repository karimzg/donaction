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
  import camera from '../../../../../../assets/icons/camera.svg';
  import pen from '../../../../../../assets/icons/pen.svg';
  import AdressInputs from './AdressInputs.svelte';

  const oninput = (event) => {
    if (event?.target?.files && event?.target?.files[0]) {
      DEFAULT_VALUES.logo = URL.createObjectURL(event?.target?.files[0]);
    }
  };
</script>

<div class="step2 flex flex-col gap-1 items-center">
  <p class="title text-center font-bold">Pourquoi saisir ces informations?</p>
  {#if !!DEFAULT_VALUES.withTaxReduction}
    <small class="text-center description">
      Ces informations sont indispensables pour l'édition de votre reçu fiscal, impératif pour
      récupérer <b><small>votre crédit d'impôt</small></b>
      Votre adresse email nous permettra de vous transmettre le reçu.
    </small>
  {:else}
    <small class="text-center description">
      Ces informations sont indispensables pour l'édition de votre attestation de paiement.
    </small>
  {/if}
  <form class="w-full flex flex-col">
    <div class="inputField flex flex-col">
      <label>Email *</label>
      <input
        type="email"
        placeholder="jean.lefebvre@email.fr"
        class="w-full"
        disabled={FORM_CONFIG.authEmail ||
          (FORM_CONFIG.myLast && FORM_CONFIG.myLast.email) ||
          FORM_CONFIG.donatorUuid}
        bind:value={DEFAULT_VALUES.email}
        use:validator={{
          validateFunctions: [validateRequired, validateEmail],
          fieldName: 'E-mail'
        }}
      />
      <small class="error" aria-live="polite"></small>
    </div>

    {#if DEFAULT_VALUES.estOrganisme && DEFAULT_VALUES.withTaxReduction}
      <div class="grid-3">
        <div class="inputField flex flex-col">
          <label for="socialReason">Raison sociale *</label>
          <input
            id="socialReason"
            type="text"
            placeholder="KLUBR"
            class="w-full"
            bind:value={DEFAULT_VALUES.socialReason}
            use:validator={{
              validateFunctions: [validateRequired],
              fieldName: 'Raison sociale'
            }}
          />
          <small class="error" aria-live="polite"></small>
        </div>
        <div class="inputField flex flex-col">
          <label for="siren">Siren *</label>
          <input
            id="siren"
            type="text"
            placeholder="123 456 789"
            class="w-full"
            bind:value={DEFAULT_VALUES.siren}
            use:validator={{
              validateFunctions: [validateRequired, validateSiren],
              fieldName: 'Siren'
            }}
          />
          <small class="error" aria-live="polite"></small>
        </div>
        <div class="inputField flex flex-col">
          <label for="formeJuridique">Forme juridique *</label>
          <input
            id="formeJuridique"
            type="text"
            placeholder="SARL"
            class="w-full"
            bind:value={DEFAULT_VALUES.legalForm}
            use:validator={{
              validateFunctions: [validateRequired],
              fieldName: 'Forme juridique'
            }}
          />
          <small class="error" aria-live="polite"></small>
        </div>
      </div>
      <AdressInputs />
      <div class="proLogoContainer inputField flex flex-col">
        <label for="logo" class="flex flex-col gap-1">
          <span>Logo de votre société (facultatif)</span>
          <span class="picker flex items-center justify-center">
            <img
              width={DEFAULT_VALUES.logo ? 85 : 36}
              height={DEFAULT_VALUES.logo ? 85 : 31}
              class="invert {!!DEFAULT_VALUES.logo}"
              src={DEFAULT_VALUES.logo || camera}
              alt="logo pro"
            />
            {#if DEFAULT_VALUES.logo}
              <span class="pen flex items-center justify-center">
                <img src={pen} alt="edit" />
              </span>
            {/if}
          </span>
        </label>
        <input {oninput} id="logo" type="file" accept="image/*" class="hidden" />
      </div>
      <hr class="w-full" />
    {/if}

    <div class="grid-3">
      <div class="inputField flex flex-col">
        <label for="civilite">Civilité *</label>
        <select bind:value={DEFAULT_VALUES.civility} id="civilite" name="civilite">
          <option value="Monsieur">Monsieur</option>
          <option value="Madame">Madame</option>
        </select>
        <small class="error" aria-live="polite"></small>
      </div>
      <div class="inputField flex flex-col">
        <label for="prenom">Prénom *</label>
        <input
          id="prenom"
          type="text"
          placeholder="Jean"
          class="w-full"
          bind:value={DEFAULT_VALUES.firstName}
          use:validator={{
            validateFunctions: [validateRequired],
            fieldName: 'Prénom'
          }}
        />
        <small class="error" aria-live="polite"></small>
      </div>
      <div class="inputField flex flex-col">
        <label for="nom">Nom *</label>
        <input
          id="nom"
          type="text"
          placeholder="LEFEBVRE"
          class="w-full"
          bind:value={DEFAULT_VALUES.lastName}
          use:validator={{
            validateFunctions: [validateRequired],
            fieldName: 'Nom'
          }}
        />
        <small class="error" aria-live="polite"></small>
      </div>
    </div>
    <div class="grid-3">
      <div class="inputField flex flex-col">
        <label for="birthdate">Date de naissance *</label>
        <input
          id="birthdate"
          type="date"
          class="w-full"
          max={eighteenYearsAgo()}
          min="1901-01-01"
          bind:value={DEFAULT_VALUES.birthdate}
          use:validator={{
            validateFunctions: [validateRequired, validateDate, validateDateMajor],
            fieldName: 'Date de naissance'
          }}
        />
        <small class="error" aria-live="polite"></small>
      </div>
      {#if DEFAULT_VALUES.withTaxReduction}
        <div class="inputField flex flex-col">
          <label for="phoneNumber">Numéro de téléphone *</label>
          <input
            bind:value={DEFAULT_VALUES.tel}
            id="phoneNumber"
            type="tel"
            placeholder="+330700000000"
            class="w-full"
          />
          <small class="error" aria-live="polite"></small>
        </div>
      {/if}
    </div>

    {#if !DEFAULT_VALUES.estOrganisme && !!DEFAULT_VALUES.withTaxReduction}
      <AdressInputs />
    {/if}
  </form>
</div>

<style lang="scss">
  @use 'index';
</style>
