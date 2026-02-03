import { Fetch } from '../../../utils/fetch';
import { FORM_CONFIG, SUBSCRIPTION } from './useSponsorshipForm.svelte';

const KLUBR_DONS_ENDPOINT = 'klub-dons';
const KLUBR_DONATEURS_ENDPOINT = 'klubr-donateurs';
const CREATE_KLUB_DON_PAYMENT = '/api/klub-don-payments';
const PUT_POST_KLUBR_DON = (uuid: string | null) => `/api/${KLUBR_DONS_ENDPOINT}/${uuid || ''}`;
const PUT_POST_KLUBR_DONATOR = (uuid: string | null) =>
  `/api/${KLUBR_DONATEURS_ENDPOINT}/${uuid || ''}`;
const UPLOAD_COMPANY_LOGO = (uuid: string) => `/api/medias/klubr-donateur/${uuid}/files`;
const CREATE_PAYMENT_INTENT = `/api/klub-don-payments/create-payment-intent`;
const CHECK_KLUB_DON_PAYMENT = (clientSecret: string, donUuid: string) =>
  `/api/klub-don-payments/check?clientSecret=${clientSecret}&donUuid=${donUuid}`;
const GET_DON_CGU = '/api/cgu';
const GET_PROJECTS_FOR_CLUB = (uuid: string) =>
  `/api/klub-projets/byKlub/${uuid}?sort[0]=createdAt:desc&pagination[page]=1&pagination[pageSize]=20&filters[status][$eq]=published`;

export const createPaymentIntent = (
  price: number,
  idempotencyKey?: string,
  donorPaysFee?: boolean,
): Promise<{ intent: string; reused: boolean }> =>
  Fetch({
    endpoint: CREATE_PAYMENT_INTENT,
    method: 'POST',
    data: {
      price,
      idempotencyKey,
      donorPaysFee,
      metadata: {
        donUuid: FORM_CONFIG.donUuid,
        klubUuid: SUBSCRIPTION.klubr.uuid,
        projectUuid: SUBSCRIPTION.project?.uuid,
        donorUuid: FORM_CONFIG?.donatorUuid,
      },
    },
  });

export const checkKlubDonPayment = (clientSecret: string) =>
  Fetch({
    endpoint: CHECK_KLUB_DON_PAYMENT(clientSecret, FORM_CONFIG.donUuid || ''),
    method: 'GET',
  });

type IReCaptchaFormAction = 'UPDATE_DONATION' | 'CREATE_DONATION' | 'CREATE_DONATION_PAYMENT';
export const createReCaptchaToken = (action: IReCaptchaFormAction): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      grecaptcha.enterprise.ready(async () => {
        const formToken = await grecaptcha.enterprise.execute(
          import.meta.env.VITE_GOOGLE_RECAPTCHA_SITE_KEY,
          { action },
        );
        resolve(formToken);
      });
    } catch (error) {
      // Pass error through for proper error handling (C7: error context)
      reject(error instanceof Error ? error : new Error(`reCAPTCHA failed for action: ${action}`));
    }
  });
};
/** Donation payload for create/update API */
export interface DonPayload {
  montant?: number;
  estOrganisme?: boolean;
  withTaxReduction?: boolean;
  statusPaiment?: string;
  contributionAKlubr?: number;
  donorPaysFee?: boolean;
  datePaiment?: string;
  klubr?: string | null;
  klubDonateur?: string;
  klub_projet?: string | null;
  formToken?: string;
}

/** Donator payload for create/update API */
export interface DonatorPayload {
  donateurType?: 'Organisme' | 'Particulier';
  civilite?: string;
  nom?: string;
  prenom?: string;
  email?: string;
  place_id?: string;
  adresse?: string;
  adresse2?: string;
  tel?: string;
  cp?: string;
  ville?: string;
  pays?: string;
  dateNaissance?: string;
  raisonSocial?: string | null;
  SIREN?: string | null;
  formeJuridique?: string | null;
  klubDon?: string | null;
  optInAffMontant?: boolean;
  optInAffNom?: boolean;
  uuid?: string | null;
}

/** Donation response from API */
export interface DonResponse {
  attestationNumber?: string;
  contributionAKlubr?: number;
  datePaiment: string;
  deductionFiscale: number;
  estOrganisme: boolean;
  withTaxReduction: boolean;
  montant: number;
  statusPaiment: string;
  uuid: string;
}

/** Donator response from API */
export interface DonatorResponse {
  uuid: string;
  logo?: { uuid: string; url: string };
}

export const putPostDon = (
  payload: DonPayload,
  uuid: string | null,
): Promise<{
  attestationNumber?: string;
  contributionAKlubr?: number;
  datePaiment: string;
  deductionFiscale: number;
  estOrganisme: boolean;
  withTaxReduction: boolean;
  montant: number;
  statusPaiment: string;
  uuid: string;
}> =>
  Fetch({
    endpoint: PUT_POST_KLUBR_DON(uuid),
    method: uuid ? 'PUT' : 'POST',
    data: {
      data: payload,
    },
  });

export const putPostDonator = (
  payload: DonatorPayload,
  uuid: string | null,
): Promise<DonatorResponse> =>
  Fetch({
    endpoint: PUT_POST_KLUBR_DONATOR(uuid),
    method: uuid ? 'PUT' : 'POST',
    data: {
      data: payload,
    },
  });

export const uploadCompanyLogo = (uuid: string, data: FormData) =>
  Fetch({
    endpoint: UPLOAD_COMPANY_LOGO(uuid),
    method: 'POST',
    data,
    isBlob: true,
  });

export const getKlubrCGU = () =>
  Fetch({
    endpoint: GET_DON_CGU,
    method: 'GET',
  });

export const getProjectsList = () =>
  Fetch({
    endpoint: GET_PROJECTS_FOR_CLUB(SUBSCRIPTION.klubr.uuid),
    method: 'GET',
  });

/** Payment creation payload */
export interface PaymentPayload {
  klubDon: string;
  montant: number;
  stripePaymentIntentId: string;
  status: string;
}

export const createKlubDonPayment = (data: PaymentPayload) =>
  Fetch({
    endpoint: CREATE_KLUB_DON_PAYMENT,
    method: 'POST',
    data: { data },
  });
