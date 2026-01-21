<script lang="ts">
  import { onMount, tick } from 'svelte';
  import {
    DEFAULT_VALUES,
    FORM_CONFIG,
    triggerValidation
  } from '../../../../logic/useSponsorshipForm.svelte';
  import { validator, validatePostalCode, validateRequired } from '../../../../logic/validator';
  import Tooltip from '../../../../../../utils/tooltip/Tooltip.svelte';

  let inputElement;

  let isEditable = $state(false);
  let justUnlocked = $state(false);

  const handlePlaceChange = async (selectedPlace) => {
    const gdKeys = [
      { gKey: 'street_number', dKey: 'streetNumber' },
      { gKey: 'route', dKey: 'streetName' },
      { gKey: 'locality', dKey: 'city' },
      { gKey: 'country', dKey: 'country' },
      { gKey: 'postal_code', dKey: 'postalCode' }
    ];
    gdKeys.forEach((key) => {
      const adressItem = selectedPlace?.address_components?.find((_) =>
        _?.types?.includes(key.gKey)
      );
      DEFAULT_VALUES[key.dKey] = adressItem?.long_name || '';
    });
    DEFAULT_VALUES.place_id = selectedPlace?.place_id;
    isEditable = true;
    justUnlocked = true;
    await tick();
    triggerValidation.update((_) => _ + 1);
    // Reset animation flag after animation completes
    setTimeout(() => { justUnlocked = false; }, 500);
  };

  onMount(async () => {
    const autocomplete = new google.maps.places.Autocomplete(inputElement, {
      types: ['address'],
      componentRestrictions: { country: 'fr' }
    });

    autocomplete.addListener('place_changed', () => {
      const selectedPlace = autocomplete.getPlace();
      handlePlaceChange(selectedPlace);
    });

    if (DEFAULT_VALUES.place_id) {
      isEditable = true;
      const service = new google.maps.places.PlacesService(document.createElement('div'));
      service.getDetails({ placeId: DEFAULT_VALUES.place_id || '' }, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          let res = place?.formatted_address || place?.name || '';

          res = place?.formatted_address;
          inputElement.value = res;
        }
      });
    }

    // navigator.userAgent.includes('Chrome') ? 'none' : 'off'
    setTimeout(() => {
      inputElement.setAttribute('autocomplete', 'none');
      inputElement.setAttribute('autocorrect', 'off');
      inputElement.setAttribute('autocapitalize', 'none');
      inputElement.setAttribute('spellcheck', 'false');
    }, 200);
  });

  // TODO: input disabled after first input
</script>

<div class="don-form-group address-field">
  <label class="don-form-label" for="place_id">Adresse complète *</label>
  <input
    type="text"
    bind:this={inputElement}
    placeholder="Commencez à taper votre adresse..."
    class="don-form-input"
    autocomplete="none"
  />
  <small class="don-error" aria-live="polite"></small>
</div>

<!-- Auto-fill section: visually distinct, non-editable fields -->
<div class="don-autofill-section" class:don-autofill-section--active={isEditable}>
  <header class="don-autofill-section__header">
    <svg class="don-autofill-section__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 12 15 16 10"/>
    </svg>
    <span class="don-autofill-section__title">Champs remplis automatiquement</span>
  </header>

  <div class="don-autofill-section__content">
    <!-- N° + Nom de rue on same row (desktop) -->
    <div class="don-form-row don-form-row--street">
      <div class="don-form-group don-form-group--street-number">
        <label class="don-form-label" for="streetNumber">N° *</label>
        <input
          id="streetNumber"
          type="text"
          placeholder="08"
          class="don-form-input"
          class:address-unlock={justUnlocked}
          disabled={FORM_CONFIG.myLast?.streetNumber === DEFAULT_VALUES.streetNumber || !isEditable}
          bind:value={DEFAULT_VALUES.streetNumber}
          use:validator={{
            validateFunctions: [validateRequired],
            fieldName: 'Numéro de rue'
          }}
        />
        <small class="don-error" aria-live="polite"></small>
      </div>
      <div class="don-form-group don-form-group--street-name">
        <label class="don-form-label" for="streetName">Nom de rue *</label>
        <input
          id="streetName"
          type="text"
          placeholder="rue Victor Hugo"
          class="don-form-input"
          class:address-unlock={justUnlocked}
          disabled={FORM_CONFIG.myLast?.streetName === DEFAULT_VALUES.streetName || !isEditable}
          bind:value={DEFAULT_VALUES.streetName}
          use:validator={{
            validateFunctions: [validateRequired],
            fieldName: 'Nom de rue'
          }}
        />
        <small class="don-error" aria-live="polite"></small>
      </div>
    </div>

    <!-- Code postal, Ville, Pays -->
    <div class="don-form-row don-form-row--3">
      <div class="don-form-group">
        <label class="don-form-label" for="postalCode">Code postal *</label>
        <input
          id="postalCode"
          type="text"
          placeholder="59800"
          class="don-form-input"
          class:address-unlock={justUnlocked}
          disabled={FORM_CONFIG.myLast?.postalCode === DEFAULT_VALUES.postalCode || !isEditable}
          bind:value={DEFAULT_VALUES.postalCode}
          use:validator={{
            validateFunctions: [validateRequired, validatePostalCode],
            fieldName: 'Code postal'
          }}
        />
        <small class="don-error" aria-live="polite"></small>
      </div>
      <div class="don-form-group">
        <label class="don-form-label" for="city">Ville *</label>
        <input
          id="city"
          type="text"
          placeholder="Lille"
          class="don-form-input"
          class:address-unlock={justUnlocked}
          disabled={FORM_CONFIG.myLast?.city === DEFAULT_VALUES.city || !isEditable}
          bind:value={DEFAULT_VALUES.city}
          use:validator={{
            validateFunctions: [validateRequired],
            fieldName: 'Ville'
          }}
        />
        <small class="don-error" aria-live="polite"></small>
      </div>
      <div class="don-form-group">
        <div class="don-label-with-tooltip">
          <label class="don-form-label" for="country">Pays *</label>
          <Tooltip position="md-left-14">
            <span slot="trigger" class="don-tooltip-trigger" aria-label="Plus d'informations">?</span>
            <div slot="tooltip">
              <p>
                Si vous faites un don en tant que non résidant français, vous ne pouvez bénéficier de la
                réduction d'impôts. Veuillez retourner à l'étape précédente et sélectionner l'option
                correspondante
              </p>
            </div>
          </Tooltip>
        </div>
        <input
          id="country"
          type="text"
          placeholder="France"
          class="don-form-input"
          value="France"
          readonly
          aria-readonly="true"
          disabled={true}
        />
        <small class="don-error" aria-live="polite"></small>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  @use 'index';

  // Auto-fill section - visually distinct card for non-editable fields
  .don-autofill-section {
    background: var(--don-color-bg-subtle, #F9FAFB);
    border: 1px dashed var(--don-color-border, #E5E7EB);
    border-radius: var(--don-radius-xl, 16px);
    padding: var(--don-spacing-lg, 16px);
    margin-top: var(--don-spacing-sm, 8px);
    transition: border-color 200ms ease, background-color 200ms ease;

    &--active {
      border-style: solid;
      border-color: var(--don-color-border-input, #D1D5DB);
      background: var(--don-color-bg-card, #FFFFFF);
    }
  }

  .don-autofill-section__header {
    display: flex;
    align-items: center;
    gap: var(--don-spacing-sm, 8px);
    margin-bottom: var(--don-spacing-lg, 16px);
    padding-bottom: var(--don-spacing-md, 12px);
    border-bottom: 1px solid var(--don-color-border, #E5E7EB);
  }

  .don-autofill-section__icon {
    color: var(--don-color-text-muted, #9CA3AF);
    flex-shrink: 0;
  }

  .don-autofill-section__title {
    font-size: var(--don-font-size-sm, 13px);
    font-weight: var(--don-font-weight-medium, 500);
    color: var(--don-color-text-muted, #6B7280);
    letter-spacing: 0.01em;
  }

  .don-autofill-section__content {
    display: flex;
    flex-direction: column;
    gap: var(--don-spacing-xl, 24px);
  }

  // Street row - N° (100px max) + Nom de rue (fills remaining)
  .don-form-row--street {
    display: flex;
    gap: var(--don-spacing-xl, 24px);

    :global(.don-form-group--street-number) {
      flex: 0 0 100px;
      max-width: 100px;
    }

    :global(.don-form-group--street-name) {
      flex: 1;
      min-width: 0;
    }

    @media screen and (max-width: 480px) {
      flex-direction: column;

      :global(.don-form-group--street-number) {
        flex: 0 0 auto;
        max-width: 100%;
        width: 100%;
      }
    }
  }
</style>
