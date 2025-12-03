import { Arg0Type, FeedbackParamsType } from '@/partials/sponsorshipForm/logic/entities';
import { Dispatch, SetStateAction } from 'react';
import { ISponsorshipFormConfig } from '@/partials/sponsorshipForm/logic/useSponsorshipForm';
import { postDon, putDon } from '@/core/services/don';
import { KlubDonPost, StatusPayment } from '@/core/models/klub-don';
import { KlubrDonateurPost } from '@/core/models/klubr-donateur';
import { postDonateur, putDonateur } from '@/core/services/donateur';
import { checkUserExistence, uploadCompanyLogo } from '@/core/services/auth';
import { pushToast, setPopAuth } from '@/core/store/modules/rootSlice';
import { createReCaptchaToken } from '@/core/services/cms';
import { sendGaEvent } from '@/core/helpers/sendGaEvent';

interface ISubmitFormParams {
	formData: { [key: string]: Arg0Type };
	setter: Dispatch<SetStateAction<ISponsorshipFormConfig>>;
	getter: ISponsorshipFormConfig;
}

export async function submitFormData(params: ISubmitFormParams) {
	return new Promise(async (resolve, reject) => {
		if (params.getter.formDirty) {
			const formToken = await createReCaptchaToken(
				params.getter.klubrDonUuId ? 'UPDATE_DONATION' : 'CREATE_DONATION',
			)
				.then((res) => res)
				.catch((err) => {
					console.error('Error creating recaptcha token:', err);
					reject(err);
				});
			if (formToken) {
				params.formData = { ...params.formData, formToken };
				submitKlubDon(params)
					.then((res: any) => {
						params.setter((prev) => ({
							...prev,
							klubrDonUuId: res.uuid,
						}));
						handleDonateurCreation(params, res.uuid)
							.then((res) => {
								resolve(res);
							})
							.catch((err) => {
								console.error('Error creating donateur: ', err);
								reject(err);
							});
					})
					.catch((err) => {
						console.error('Error submitting form data:', err);
						reject(err);
					});
			}
		} else {
			resolve(true);
		}
	});
}

async function submitKlubDon(params: ISubmitFormParams) {
	return new Promise((resolve, reject) => {
		const klubDonData = createKlubDonData(
			params.formData,
			params.getter?.club?.uuid,
			params.getter?.selectedProject?.uuid,
		);
		if (params.getter.klubrDonUuId) {
			sendGaEvent({
				category: 'Donations',
				label: `Update KlubDon (${params.getter.klubrDonUuId})`,
			});
			putDon(params.getter.klubrDonUuId, klubDonData)
				.then((res) => {
					resolve(res);
				})
				.catch((error) => {
					sendGaEvent({
						category: 'Error Donations',
						label: `Update KlubDon (${params.getter.klubrDonUuId}) --> ${error?.error?.status}:${error?.error?.message}`,
					});
					reject(error);
				});
		} else {
			sendGaEvent({
				category: 'Donations',
				label: `Create KlubDon`,
			});
			postDon(klubDonData)
				.then((res) => {
					resolve(res);
				})
				.catch((error) => {
					sendGaEvent({
						category: 'Error Donations',
						label: `Create KlubDon --> ${error?.error?.status}:${error?.error?.message}`,
					});
					reject(error);
				});
		}
	});
}

async function handleDonateurCreation(params: ISubmitFormParams, klubDonUuid: string) {
	return new Promise((resolve, reject) => {
		submitDonateur(params, klubDonUuid)
			.then((res: any) => {
				params.setter((_) => ({
					..._,
					klubrDonateurId: res?.uuid,
				}));
				resolve(true);
			})
			.catch((err) => {
				console.log(err);
				reject(err);
			});

		// // TODO: handleUserAssociation in STRAPI ------ /!\ ------
		// // if (donateurResponse) {
		// // 	await handleUserAssociation(formData, donateurResponse.data.data.id);
		// // }
	});
}

async function submitDonateur(params: ISubmitFormParams, klubDonUuid: string) {
	return new Promise((resolve, reject) => {
		const donateurInfo = createDonateurInfo(params.formData, klubDonUuid);
		const uploadProLogo = async (uuid: string, isPost?: boolean) => {
			if (
				params.formData.estOrganisme &&
				((params.formData.logo && (params.formData.logo as string).startsWith('blob:')) || isPost)
			) {
				const form = new FormData();
				form.set('logo', await fetch(params.formData.logo as string).then((r) => r.blob()));
				const resLogo = await uploadCompanyLogo(uuid, form)
					.then((res) => res)
					.catch((err) => {
						reject(err);
					});
				params.setter((_) => ({
					..._,
					defaultValues: {
						..._.defaultValues,
						logo: resLogo.logo.url,
					},
				}));
			}
		};
		if (params.getter.klubrDonateurId) {
			sendGaEvent({
				category: 'Donations',
				label: `Update KlubDonateur (${params.getter.klubrDonateurId})`,
			});
			putDonateur(params.getter.klubrDonateurId, donateurInfo)
				.then(async (res) => {
					await uploadProLogo(params.getter.klubrDonateurId as string);
					resolve(res);
				})
				.catch((err) => {
					sendGaEvent({
						category: 'Error Donations',
						label: `Update KlubDonateur (${params.getter.klubrDonateurId}) --> ${err?.error?.status}:${err?.error?.message}`,
					});
					reject(err);
				});
		} else {
			sendGaEvent({
				category: 'Donations',
				label: `Create KlubDonateur`,
			});
			postDonateur(donateurInfo)
				.then(async (res) => {
					await uploadProLogo(res.uuid as string, true);
					resolve(res);
				})
				.catch((err) => {
					sendGaEvent({
						category: 'Error Donations',
						label: `Create KlubDon --> ${err?.error?.status}:${err?.error?.message}`,
					});
					reject(err);
				});
		}
	});
}

function createKlubDonData(
	formData: { [key: string]: Arg0Type },
	clubUuid?: string,
	clubProject?: string,
): Partial<KlubDonPost> {
	return {
		montant: Number(formData.montant.toString()),
		estOrganisme: Boolean(formData.estOrganisme),
		statusPaiment: 'notDone',
		// TODO: fill deductionFiscale
		deductionFiscale: undefined,
		// TODO: fill contributionAKlubr
		contributionAKlubr: undefined,
		datePaiment: undefined,
		klubr: clubUuid,
		klubDonateur: undefined,
		klub_projet: clubProject,
		// Add other relevant fields from the form
		formToken: String(formData?.formToken),
	};
}

function createDonateurInfo(
	formData: any,
	klubDonUuid?: string,
	klubrDonateurId?: string,
): Partial<KlubrDonateurPost> {
	return {
		donateurType: formData.estOrganisme ? 'Organisme' : 'Particulier',
		civilite: formData.civility,
		nom: formData.lastName,
		prenom: formData.firstName,
		email: formData.email,
		adresse: formData.streetNumber,
		adresse2: formData.streetName,
		tel: formData.tel,
		cp: formData.postalCode,
		ville: formData.city,
		pays: formData.country,
		dateNaissance: formData?.birthdate,
		raisonSocial: formData.estOrganisme ? formData?.socialReason : null,
		SIREN: formData.estOrganisme ? formData?.siren : null,
		formeJuridique: formData.estOrganisme ? formData?.legalForm : null,
		klubDon: klubDonUuid,
		optInAffMontant: formData?.displayAmount,
		optInAffNom: formData?.displayName,
		uuid: klubrDonateurId,
	};
}

// TODO: /// /!\ \\\
// const handleUserAssociation = async (formData: any, donateurId: string) => {
// 	try {
// 		// Check if the user exists
// 		const userResponse = await axios.get(
// 			`${apiUrl}/api/users?filters[$and][0][email][$eq]=${formData.email}`,
// 		);
// 		let userId;
//
// 		if (userResponse.data.length > 0) {
// 			// User exists, update idUtilisateur in Donateur
// 			userId = userResponse.data[0].id;
// 			await axios.put(`${apiUrl}/api/klubr-donateurs/${donateurId}`, {
// 				data: { user: userId },
// 			});
// 		} else {
// 			// User does not exist, create a new user
// 			const newUser = {
// 				email: formData.email,
// 				nom: formData.lastName,
// 				prenom: formData.firstName,
// 				optin: formData.acceptConditions1,
// 				username: formData.firstName,
// 				password: 'testklubr',
// 				status: 'pending',
// 				origin: 'donateur',
// 			};
//
// 			const newUserResponse = await axios.post(`${apiUrl}/api/auth/local/register`, newUser);
// 			userId = newUserResponse.data?.user?.id;
//
// 			// Update the Donateur record with the new user's ID
// 			await axios.put(`${apiUrl}/api/klubr-donateurs/${donateurId}`, {
// 				data: { user: userId },
// 			});
// 		}
// 		incrementStepIndex(1);
// 	} catch (error) {
// 		console.error('Error in handling user association:', error);
// 	}
// };

export function checkExistence(
	{ attribute, isValid }: FeedbackParamsType,
	dispatch: Function,
	emailLatestValue: string,
	status: 'loading' | 'authenticated' | 'unauthenticated',
) {
	if (
		attribute?.name === 'email' &&
		isValid &&
		emailLatestValue !== attribute.value &&
		status === 'unauthenticated'
	) {
		checkUserExistence(String(attribute.value))
			.then((res) => {
				if (res?.provider) {
					sendGaEvent({
						category: 'donation',
						label: 'Ouverture popup auth',
					});
					dispatch(setPopAuth(String(attribute.value)));
				}
			})
			.catch((err) => {
				console.log(err);
				dispatch(
					pushToast({
						type: 'error',
						title: err?.error?.message || "Une erreur s'est produite",
					}),
				);
			});
	}
}

export async function updateKlubrDonStatus(
	status: StatusPayment,
	paymentDate = new Date(),
	uuid: string,
) {
	try {
		const formToken = await createReCaptchaToken('UPDATE_DONATION');
		const data: Partial<KlubDonPost> = {
			formToken,
			statusPaiment: status,
			...(status !== 'pending' && { datePaiment: paymentDate.toISOString() }),
		};
		return await putDon(`${uuid}`, data).catch((error) => {
			console.error('Error updating KlubDon data:', error);
		});
	} catch (error) {
		console.error('Error updating Klubr Don status:', error);
	}
}
