import eventBus from '../../../utils/eventBus';
import type { DEFAULT_VALUES as DEFAULT_VALUES_TYPE } from './useSponsorshipForm.svelte';
import {
  DEFAULT_VALUES,
  defVals,
  FORM_CONFIG,
  index,
  isBeingFilled,
  SUBSCRIPTION
} from './useSponsorshipForm.svelte';
import { sendGaEvent } from '../../../utils/sendGaEvent';
import { get } from 'svelte/store';

export let EVENT_CONTEXT = 'KLUBR_SPONSORSHIP_FORM_';

export default function initListeners() {
  eventBus.on(`${EVENT_CONTEXT}resetForm`, (data: boolean) => {
    Object.keys(DEFAULT_VALUES).forEach((_) => {
      DEFAULT_VALUES[_] = defVals[_];
    });
    FORM_CONFIG.donatorUuid = null;
    FORM_CONFIG.donUuid = null;
    FORM_CONFIG.myLast = null;
    FORM_CONFIG.dirty = false;
    FORM_CONFIG.myLasts = null;
    isBeingFilled.set(false);
  });
  eventBus.on(`${EVENT_CONTEXT}populateForm`, (data: typeof DEFAULT_VALUES_TYPE) => {
    sendGaEvent({
      category: 'donation',
      label: `Populate data from parent event`
    });
    Object.keys(data).forEach((_) => {
      DEFAULT_VALUES[_] = data[_];
    });
  });
  eventBus.on(`${EVENT_CONTEXT}myLast`, (data: Array<any>) => {
    sendGaEvent({
      category: 'donation',
      label: `Populate data from parent event myLast`
    });
    FORM_CONFIG.myLasts = data;
    populateForm();
  });
  eventBus.on(`${EVENT_CONTEXT}auth_email`, (data: string) => {
    FORM_CONFIG.authEmail = data;
    DEFAULT_VALUES.email = data;
  });
  eventBus.on(
    `${EVENT_CONTEXT}editForm`,
    (data: { donatorUuid: string | null; projectUuid: string | null; donUuid: string | null }) => {
      sendGaEvent({
        category: 'donation',
        label: `Editing existing donation (uuid: ${data.donUuid})`
      });
      FORM_CONFIG.donatorUuid = data.donatorUuid;
      FORM_CONFIG.donUuid = data.donUuid;
      FORM_CONFIG.projectUuid = data.projectUuid;
      if (data.projectUuid === SUBSCRIPTION.klubr.uuid && !SUBSCRIPTION.project) {
        SUBSCRIPTION.project = {
          uuid: SUBSCRIPTION.klubr.uuid,
          couverture: {
            alternativeText: SUBSCRIPTION.klubr?.logo?.alternativeText,
            url: SUBSCRIPTION.klubr?.logo?.url
          },
          titre: 'Fonctionnement général du klub ',
          fit: 'object-fit: contain;'
        };
      }
    }
  );
  eventBus.on(`${EVENT_CONTEXT}controlForm`, (data: boolean) => {
    sendGaEvent({
      category: 'donation',
      label: `Control form from parent (state: ${data ? 'open' : 'close'})`
    });
    isBeingFilled.set(data);
  });

  window.addEventListener('beforeunload', (event) => {
    if (get(isBeingFilled) && get(index) < 4) {
      event.preventDefault();
      event.returnValue = '';
    }
  });
}

export const populateForm = () => {
  if (!FORM_CONFIG.dirty && Array.isArray(FORM_CONFIG.myLasts)) {
    const individual = FORM_CONFIG.myLasts.find((_) => _.donateurType === 'Particulier');
    const company = FORM_CONFIG.myLasts.find((_) => _.donateurType === 'Organisme');
    const withoutReduction = FORM_CONFIG.myLasts.find((_) => !_.donateurType);

    const getData = () => {
      if (!DEFAULT_VALUES.withTaxReduction) return withoutReduction || individual;
      if (DEFAULT_VALUES.estOrganisme) return company;
      return individual;
    };

    FORM_CONFIG.myLast = {};
    FORM_CONFIG.myLast.siren = getData()?.SIREN || '';
    FORM_CONFIG.myLast.logo = getData()?.logo?.url || '';
    FORM_CONFIG.myLast.streetNumber = getData()?.adresse || '';
    FORM_CONFIG.myLast.streetName = getData()?.adresse2 || '';
    FORM_CONFIG.myLast.postalCode = getData()?.cp || '';
    FORM_CONFIG.myLast.birthdate = getData()?.dateNaissance || '';
    // FORM_CONFIG.myLast.email = getData()?.email || '';
    FORM_CONFIG.myLast.city = getData()?.ville || '';
    FORM_CONFIG.myLast.displayAmount = getData()?.optInAffMontant || true;
    FORM_CONFIG.myLast.displayName = getData()?.optInAffNom || true;
    FORM_CONFIG.myLast.country = getData()?.pays || 'France';
    FORM_CONFIG.myLast.socialReason = getData()?.raisonSocial || '';
    FORM_CONFIG.myLast.civility = getData()?.civilite || 'Monsieur';
    FORM_CONFIG.myLast.tel = getData()?.tel || '';
    FORM_CONFIG.myLast.lastName = getData()?.nom || '';
    FORM_CONFIG.myLast.firstName = getData()?.prenom || '';
    FORM_CONFIG.myLast.legalForm = getData()?.formeJuridique || '';
    FORM_CONFIG.myLast.place_id = getData()?.place_id || null;

    Object.keys(FORM_CONFIG.myLast)?.forEach((_) => {
      DEFAULT_VALUES[_] = FORM_CONFIG.myLast[_];
    });
  }
};
