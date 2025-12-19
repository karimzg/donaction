import { get, writable } from 'svelte/store';
import { tick } from 'svelte';
import { handleSubmitStepTwo } from './submit';
import { dispatchToast } from './toaster';
import eventBus from '../../../utils/eventBus';
import { EVENT_CONTEXT } from './initListeners';
import { sendGaEvent } from '../../../utils/sendGaEvent';

const isBeingFilled = writable<boolean>(false);
const isLoading = writable<boolean>(false);
const index = writable<number>(0);
const triggerValidation = writable<number>(0);
const isCguShown = writable<boolean>(false);
const isContributionShown = writable<boolean>(false);

const SUBSCRIPTION: {
  token: null | string;
  klubr: any | string;
  project: any | string;
  allowKlubrContribution: null | boolean;
  allowProjectSelection: boolean;
} = $state({
  token: null,
  klubr: null,
  project: null,
  allowKlubrContribution: false,
  allowProjectSelection: false
});
const FORM_CONFIG: {
  donatorUuid: string | null;
  donUuid: string | null;
  clubUuid: string | null;
  projectUuid: string | null;
  myLasts: Array<any> | null;
  myLast: any;
  authEmail: string | null;
  dirty: boolean;
} = $state({
  donatorUuid: null,
  donUuid: null,
  clubUuid: null,
  projectUuid: null,
  myLasts: null,
  myLast: null,
  authEmail: null,
  dirty: false
});

const defVals = {
  estOrganisme: false,
  withTaxReduction: true,
  montant: NaN,
  contributionAKlubr: NaN,
  socialReason: '',
  siren: '',
  legalForm: '',
  logo: '',
  civility: 'Monsieur',
  firstName: '',
  lastName: '',
  birthdate: '',
  tel: '',
  email: '',
  streetNumber: '',
  streetName: '',
  postalCode: '',
  city: '',
  country: 'France',
  place_id: null,
  displayName: true,
  displayAmount: true,
  acceptConditions1: false,
  acceptConditions2: false
};
const DEFAULT_VALUES = $state({ ...defVals });

async function submitForm(acc: number) {
  if (acc > 0) {
    try {
      triggerValidation.update((_) => _ + 1);
      await tick();
      const err = Array.from(
        document
          .querySelector('klubr-sponsorship-form')
          ?.shadowRoot?.querySelectorAll(`small.error`)
      ).find((_) => _?.innerText?.length > 0);

      if (!err) {
        if (get(index) === 2) {
          isLoading.set(true);
          await handleSubmitStepTwo()
            .then((res) => {
              eventBus.emit(`${EVENT_CONTEXT}klubDonResult`, res);
            })
            .finally(() => isLoading.set(false));
        }
        triggerValidation.set(0);
        index.update((_) => acc + _);
      } else {
        err?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    } catch (e) {
      console.log('ERROR: ', e);
      dispatchToast(e?.error?.message || '', 'DANGER');
    }
  } else {
    if (get(index) === 0) {
      SUBSCRIPTION.project = null;
    } else {
      index.update((_) => acc + _);
    }
  }
}

let mounted = false;
index.subscribe((val) => {
  if (mounted) {
    sendGaEvent({
      category: 'donation',
      label: `Navigating to step ${val + 1}`,
      step: val + 1
    });
  } else {
    mounted = true;
  }
});

isBeingFilled.subscribe((val) => {
  if (mounted) {
    sendGaEvent({
      category: 'donation',
      label: `${val ? 'Opening' : 'Closing'} form, step: ${get(index) + 1}`
    });
    document.body.style.overflow = val ? 'hidden' : 'auto';
  } else {
    mounted = true;
  }
});

export {
  index,
  submitForm,
  defVals,
  triggerValidation,
  isBeingFilled,
  isCguShown,
  isContributionShown,
  DEFAULT_VALUES,
  isLoading,
  FORM_CONFIG,
  SUBSCRIPTION
};
