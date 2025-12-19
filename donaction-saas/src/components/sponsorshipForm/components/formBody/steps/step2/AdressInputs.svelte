<script lang="ts">
  import { onMount, tick } from 'svelte';
  import {
    DEFAULT_VALUES,
    FORM_CONFIG,
    triggerValidation
  } from '../../../../logic/useSponsorshipForm.svelte';
  import { validator, validatePostalCode, validateRequired } from '../../../../logic/validator';
  import Tooltip from '../../../../../../utils/tooltip/Tooltip.svelte';
  import alertIcon from '../../../../../../assets/icons/alertIcon.svg';

  let inputElement;

  let isEditable = $state(false);

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
    await tick();
    triggerValidation.update((_) => _ + 1);
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

<div class="inputField flex flex-col">
  <label for="place_id">Adresse complète *</label>
  <input
    type="text"
    bind:this={inputElement}
    placeholder="Veuillez remplir votre adresse complète pour remplir les champs d'adresse ci-dessous."
    class="w-full"
    autocomplete="none"
  />
  <small class="error" aria-live="polite"></small>
</div>

<div class="grid-3">
  <div class="inputField flex flex-col">
    <label for="streetNumber">Numéro de rue *</label>
    <input
      id="streetNumber"
      type="text"
      placeholder="08"
      class="w-full"
      disabled={FORM_CONFIG.myLast?.streetNumber === DEFAULT_VALUES.streetNumber || !isEditable}
      bind:value={DEFAULT_VALUES.streetNumber}
      use:validator={{
        validateFunctions: [validateRequired],
        fieldName: 'Numéro de rue'
      }}
    />
    <small class="error" aria-live="polite"></small>
  </div>
  <div class="inputField flex flex-col grid-item-2">
    <label for="streetName">Nom de rue *</label>
    <input
      id="streetName"
      type="text"
      placeholder="rue Victor Hugo"
      class="w-full"
      disabled={FORM_CONFIG.myLast?.streetName === DEFAULT_VALUES.streetName || !isEditable}
      bind:value={DEFAULT_VALUES.streetName}
      use:validator={{
        validateFunctions: [validateRequired],
        fieldName: 'Nom de rue'
      }}
    />
    <small class="error" aria-live="polite"></small>
  </div>
</div>
<div class="grid-3" style="align-items: end">
  <div class="inputField flex flex-col">
    <label for="postalCode">Code postal *</label>
    <input
      id="postalCode"
      type="text"
      placeholder="59800"
      class="w-full"
      disabled={FORM_CONFIG.myLast?.postalCode === DEFAULT_VALUES.postalCode || !isEditable}
      bind:value={DEFAULT_VALUES.postalCode}
      use:validator={{
        validateFunctions: [validateRequired, validatePostalCode],
        fieldName: 'Code postal'
      }}
    />
    <small class="error" aria-live="polite"></small>
  </div>
  <div class="inputField flex flex-col">
    <label for="city">Ville *</label>
    <input
      id="city"
      type="text"
      placeholder="Lille"
      class="w-full"
      disabled={FORM_CONFIG.myLast?.city === DEFAULT_VALUES.city || !isEditable}
      bind:value={DEFAULT_VALUES.city}
      use:validator={{
        validateFunctions: [validateRequired],
        fieldName: 'Ville'
      }}
    />
    <small class="error" aria-live="polite"></small>
  </div>
  <div class="inputField flex flex-col">
    <Tooltip position="md-left-14">
      <div slot="trigger" class="flex gap-1-2 items-center">
        <label for="country">Pays *</label>
        <img width={25} height={25} src={alertIcon} alt={''} />
      </div>
      <div slot="tooltip">
        <p>
          Si vous faites un don en tant que non résidant français, vous ne pouvez bénéficier de la
          réduction d'impôts. Veuillez retourner à l'étape précédente et sélectionner l'option
          correspondante
        </p>
      </div>
    </Tooltip>
    <input
      id="country"
      type="text"
      placeholder="France"
      class="w-full"
      value="France"
      readonly
      aria-readonly="true"
      disabled={true}
    />
    <small class="error" aria-live="polite"></small>
  </div>
</div>

<style lang="scss">
  @use 'index';
</style>
