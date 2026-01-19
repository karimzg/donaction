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
  <small class="address-helper">Les champs ci-dessous se rempliront automatiquement</small>
  <small class="don-error" aria-live="polite"></small>
</div>

<div class="don-form-row don-form-row--address">
  <div class="don-form-group">
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
  <div class="don-form-group">
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
        <div slot="trigger">
          <span class="don-tooltip-trigger" aria-label="Plus d'informations">?</span>
        </div>
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

<style lang="scss">
  @use 'index';
</style>
