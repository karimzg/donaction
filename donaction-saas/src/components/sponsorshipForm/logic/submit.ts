import { DEFAULT_VALUES, index, FORM_CONFIG } from './useSponsorshipForm.svelte';
import { createReCaptchaToken, putPostDon, putPostDonator, uploadCompanyLogo } from './api';
import { sendGaEvent } from '../../../utils/sendGaEvent';
import { sanitizeInput } from './validator';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DonationPayload {
  montant: number;
  estOrganisme: boolean;
  withTaxReduction: boolean;
  statusPaiment: string;
  contributionAKlubr: number;
  donorPaysFee: boolean;
  datePaiment: string | undefined;
  klubr: string | null;
  klubDonateur: string | undefined;
  klub_projet: string | null;
  formToken: string;
}

interface DonatorPayload {
  donateurType: 'Organisme' | 'Particulier';
  civilite: string;
  nom: string;
  prenom: string;
  email: string;
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
  klubDon: string | null;
  optInAffMontant?: boolean;
  optInAffNom?: boolean;
  uuid?: string | null;
}

interface DonationResponse {
  uuid: string;
  attestationNumber?: string;
  contributionAKlubr?: number;
  datePaiment: string;
  deductionFiscale: number;
  estOrganisme: boolean;
  withTaxReduction: boolean;
  montant: number;
  statusPaiment: string;
}

interface DonatorResponse {
  uuid: string;
  logo?: { uuid: string; url: string };
}

type StatusPayment = 'notDone' | 'pending' | 'success' | 'error';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Sanitize all string fields in an object before API submission.
 * Provides defense-in-depth against XSS.
 */
function sanitizePayload<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  for (const key of Object.keys(result)) {
    const value = result[key];
    if (typeof value === 'string') {
      (result as Record<string, unknown>)[key] = sanitizeInput(value);
    }
  }
  return result;
}

// ─── Main Functions ───────────────────────────────────────────────────────────

export async function handleSubmitStepTwo(): Promise<{
  createDonationRes: DonationResponse;
  createDonatorRes: DonatorResponse;
}> {
  const temp = { ...DEFAULT_VALUES };

  // Clean payload based on options
  if (!temp.withTaxReduction) {
    temp.estOrganisme = false;
    delete temp.tel;
    delete temp.city;
    delete temp.place_id;
    delete temp.country;
    delete temp.streetNumber;
    delete temp.streetName;
    delete temp.postalCode;
  }
  if (!temp.estOrganisme) {
    delete temp.legalForm;
    delete temp.siren;
    delete temp.socialReason;
    delete temp.logo;
  }

  sendGaEvent({
    category: 'donation',
    label: `Submit step 2`,
  });

  const createDonationRes = await createDonation(temp);
  const createDonatorRes = await createDonator(temp);

  return {
    createDonationRes,
    createDonatorRes,
  };
}

async function createDonation(temp: typeof DEFAULT_VALUES): Promise<DonationResponse> {
  const formToken = await createReCaptchaToken(
    FORM_CONFIG.donUuid ? 'UPDATE_DONATION' : 'CREATE_DONATION',
  );

  const reqBody: DonationPayload = {
    montant: Number(temp.montant.toString()),
    estOrganisme: Boolean(temp.estOrganisme),
    withTaxReduction: Boolean(temp.withTaxReduction),
    statusPaiment: 'notDone',
    contributionAKlubr: Number(temp.contributionAKlubr.toString()),
    donorPaysFee: Boolean(temp.donorPaysFee),
    datePaiment: undefined,
    klubr: FORM_CONFIG.clubUuid,
    klubDonateur: undefined,
    klub_projet:
      FORM_CONFIG.projectUuid === FORM_CONFIG.clubUuid ? null : FORM_CONFIG.projectUuid || null,
    formToken,
  };

  try {
    const res = await putPostDon(reqBody, FORM_CONFIG.donUuid);
    sendGaEvent({
      category: 'donation',
      label: `Update/create Klub Don (uuid: ${res?.uuid})`,
    });
    FORM_CONFIG.donUuid = res.uuid;
    return res;
  } catch (err) {
    sendGaEvent({
      category: 'donation_error',
      label: `Update/create Klub Don (uuid: ${FORM_CONFIG.donUuid})`,
    });
    throw err;
  }
}

async function createDonator(temp: typeof DEFAULT_VALUES): Promise<DonatorResponse> {
  const keysToBeDeleted = [
    'adresse',
    'adresse2',
    'tel',
    'cp',
    'ville',
    'pays',
    'SIREN',
    'raisonSocial',
    'formeJuridique',
  ] as const;

  let reqBody: DonatorPayload = {
    donateurType: temp.estOrganisme ? 'Organisme' : 'Particulier',
    civilite: temp.civility,
    nom: temp.lastName,
    prenom: temp.firstName,
    email: temp.email,
    place_id: temp.place_id,
    adresse: temp.streetNumber,
    adresse2: temp.streetName,
    tel: temp.tel,
    cp: String(temp.postalCode),
    ville: temp.city,
    pays: temp.country,
    dateNaissance: temp?.birthdate,
    raisonSocial: temp.estOrganisme ? temp?.socialReason : null,
    SIREN: temp.estOrganisme ? temp?.siren : null,
    formeJuridique: temp.estOrganisme ? temp?.legalForm : null,
    klubDon: FORM_CONFIG.donUuid,
    optInAffMontant: temp?.displayAmount,
    optInAffNom: temp?.displayName,
    uuid: FORM_CONFIG.donatorUuid,
  };

  if (!temp.withTaxReduction) {
    for (const key of keysToBeDeleted) {
      delete reqBody[key];
    }
  }

  // Sanitize all string fields before API submission (C2: XSS defense-in-depth)
  reqBody = sanitizePayload(reqBody);

  try {
    const res = await putPostDonator(reqBody, FORM_CONFIG.donatorUuid);
    sendGaEvent({
      category: 'donation',
      label: `Update/create KlubDonateur (uuid: ${res.uuid})`,
    });
    FORM_CONFIG.donatorUuid = res.uuid;
    await uploadProLogo(temp);
    return res;
  } catch (err) {
    sendGaEvent({
      category: 'donation_error',
      label: `Update/create KlubDonateur (uuid: ${FORM_CONFIG.donatorUuid})`,
    });
    throw err;
  }
}

async function uploadProLogo(temp: typeof DEFAULT_VALUES): Promise<void> {
  if (
    temp.withTaxReduction &&
    temp.estOrganisme &&
    temp.logo &&
    (temp.logo as string).startsWith('blob:')
  ) {
    const form = new FormData();
    form.set('logo', await fetch(temp.logo as string).then((r) => r.blob()));

    const resLogo = await uploadCompanyLogo(FORM_CONFIG.donatorUuid as string, form);
    sendGaEvent({
      category: 'donation',
      label: `Upload company logo (uuid: ${resLogo.logo.uuid})`,
    });
    DEFAULT_VALUES.logo = resLogo.logo.url;
  } else {
    sendGaEvent({
      category: 'donation',
      label: `Upload company logo (uuid donator: ${FORM_CONFIG.donatorUuid})`,
    });
  }
}

export async function updateKlubrDonStatus(
  status: StatusPayment,
  paymentDate = new Date(),
  uuid: string,
): Promise<DonationResponse | undefined> {
  try {
    const formToken = await createReCaptchaToken('UPDATE_DONATION');
    const data: Partial<DonationPayload> & { formToken: string; statusPaiment: string } = {
      formToken,
      statusPaiment: status,
      ...(status !== 'pending' && { datePaiment: paymentDate.toISOString() }),
    };

    const res = await putPostDon(data, uuid);
    sendGaEvent({
      category: 'donation',
      label: `Update Klub Don status (uuid: ${res?.uuid} || status: ${status})`,
    });
    return res;
  } catch (error) {
    sendGaEvent({
      category: 'donation_error',
      label: `Update Klub Don status (uuid: ${uuid} || status: ${status})`,
    });
    // Re-throw to allow caller to handle
    throw error;
  }
}
