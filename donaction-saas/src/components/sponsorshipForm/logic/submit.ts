import { DEFAULT_VALUES, index, FORM_CONFIG } from './useSponsorshipForm.svelte';
import { createReCaptchaToken, putPostDon, putPostDonator, uploadCompanyLogo } from './api';
import { sendGaEvent } from '../../../utils/sendGaEvent';

export async function handleSubmitStepTwo() {
  return new Promise(async (resolve, reject) => {
    try {
      //TODO: CLEAN
      let temp = { ...DEFAULT_VALUES };
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
        label: `Submit step 2`
      });

      const createDonationRes = await createDonation(temp);
      const createDonatorRes = await createDonator(temp);
      resolve({
        createDonationRes,
        createDonatorRes
      });
    } catch (e) {
      reject(e);
    }
  });
}

async function createDonation(temp) {
  return new Promise(async (resolve, reject) => {
    const formToken = await createReCaptchaToken(
      FORM_CONFIG.donUuid ? 'UPDATE_DONATION' : 'CREATE_DONATION'
    )
      .then((res) => res)
      .catch((err) => {
        console.error('Error creating recaptcha token:', err);
        reject(err);
      });

    if (formToken) {
      const reqBody = {
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
        formToken
      };

      putPostDon(reqBody, FORM_CONFIG.donUuid)
        .then((res) => {
          sendGaEvent({
            category: 'donation',
            label: `Update/create Klub Don (uuid: ${res?.uuid})`
          });
          FORM_CONFIG.donUuid = res.uuid;
          resolve(res);
        })
        .catch((err) => {
          sendGaEvent({
            category: 'donation_error',
            label: `Update/create Klub Don (uuid: ${FORM_CONFIG.donUuid})`
          });
          reject(err);
        });
    }
  });
}

async function createDonator(temp) {
  return new Promise(async (resolve, reject) => {
    const keysToBeDeleted = [
      'adresse',
      'adresse2',
      'tel',
      'cp',
      'ville',
      'pays',
      'SIREN',
      'raisonSocial',
      'formeJuridique'
    ];
    const reqBody = {
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
      uuid: FORM_CONFIG.donatorUuid
    };

    if (!temp.withTaxReduction) {
      keysToBeDeleted.forEach((key: string) => {
        delete reqBody[key];
      });
    }

    putPostDonator(reqBody, FORM_CONFIG.donatorUuid)
      .then(async (res) => {
        sendGaEvent({
          category: 'donation',
          label: `Update/create KlubDonateur (uuid: ${res.uuid})`
        });
        FORM_CONFIG.donatorUuid = res.uuid;
        await uploadProLogo(temp);
        resolve(res);
      })
      .catch((err) => {
        sendGaEvent({
          category: 'donation_error',
          label: `Update/create KlubDonateur (uuid: ${FORM_CONFIG.donatorUuid})`
        });
        reject(err);
      });
  });
}

const uploadProLogo = async (temp) => {
  return new Promise(async (resolve, reject) => {
    if (
      temp.withTaxReduction &&
      temp.estOrganisme &&
      temp.logo &&
      (temp.logo as string).startsWith('blob:')
    ) {
      const form = new FormData();
      form.set('logo', await fetch(temp.logo as string).then((r) => r.blob()));
      const resLogo = await uploadCompanyLogo(FORM_CONFIG.donatorUuid as string, form)
        .then((res) => res)
        .catch((err) => {
          reject(err);
        });
      sendGaEvent({
        category: 'donation',
        label: `Upload company logo (uuid: ${resLogo.logo.uuid})`
      });
      DEFAULT_VALUES.logo = resLogo.logo.url;
      resolve(true);
    } else {
      sendGaEvent({
        category: 'donation',
        label: `Upload company logo (uuid donator: ${FORM_CONFIG.donatorUuid})`
      });
      resolve(true);
    }
  });
};

type StatusPayment = 'notDone' | 'pending' | 'success' | 'error';
export async function updateKlubrDonStatus(
  status: StatusPayment,
  paymentDate = new Date(),
  uuid: string
) {
  try {
    const formToken = await createReCaptchaToken('UPDATE_DONATION');
    const data: Record<string, any> = {
      formToken,
      statusPaiment: status,
      ...(status !== 'pending' && { datePaiment: paymentDate.toISOString() })
    };
    return await putPostDon(data, uuid)
      .then((res) => {
        sendGaEvent({
          category: 'donation',
          label: `Update Klub Don status (uuid: ${res?.uuid} || status: ${status})`
        });
        return res;
      })
      .catch((error) => {
        sendGaEvent({
          category: 'donation_error',
          label: `Update Klub Don status (uuid: ${uuid} || status: ${status})`
        });
        console.error('Error updating KlubDon data:', error);
      });
  } catch (error) {
    sendGaEvent({
      category: 'donation_error',
      label: `Update Klub Don status (uuid: ${uuid} || status: ${status})`
    });
    console.error('Error updating Klubr Don status:', error);
  }
}
