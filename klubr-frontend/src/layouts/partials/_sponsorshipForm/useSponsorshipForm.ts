import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { selectSession } from '@/core/store/modules/authSlice';
import { useParams } from 'next/navigation';
import { checkExistence } from '@/partials/_sponsorshipForm/requests';
import { getDonsByKlubOrProjet, getMyLastDonation, getRelaunchDon } from '@/core/services/don';
import { pushToast } from '@/core/store/modules/rootSlice';
import { Klub } from '@/core/models/club';
import { KlubProjet } from '@/core/models/klub-project';
import scrollIntoForm from '@/core/helpers/scrollIntoForm';
import { selectSponsorsList, setSponsorsList } from '@/core/store/modules/sponsorsSlice';
import { incrementProjectProgress } from '@/core/store/modules/projectSlice';

type EventBus = {
	emit(event: any, data: any): void;
	events: Map<any, any>;
	off(event: any, listenerToRemove: any): void;
	on(event: any, listener: any): void;
};

const context = 'KLUBR_SPONSORSHIP_FORM_';

export const useSponsorshipForm = (props: {
	klubrUuid: string;
	projectUuid?: string;
	club: Klub;
	project?: KlubProjet;
}) => {
	const dispatch = useAppDispatch();
	const sponsorsList = useAppSelector(selectSponsorsList);
	const session = useAppSelector(selectSession);
	const statusRef = useRef<'loading' | 'authenticated' | 'unauthenticated'>(session.status);
	const params = useParams();
	const [settings, setSettings] = useState<{
		eventBus: EventBus | null;
		actions: {
			PAYEMENT_FORM: boolean;
			DON_UUID: string | null;
			RELAUNCH_CODE: string | null;
		};
	}>({
		eventBus: null,
		actions: {
			PAYEMENT_FORM: false,
			DON_UUID: null,
			RELAUNCH_CODE: null,
		},
	});

	useEffect(() => {
		loadEventBus();

		window.addEventListener(`${context}LOADED`, (event) => {
			loadEventBus();
		});

		return () => {
			setSettings({
				actions: {
					PAYEMENT_FORM: false,
					DON_UUID: null,
					RELAUNCH_CODE: null,
				},
				eventBus: null,
			});
			window.removeEventListener(`${context}LOADED`, (event) => {
				loadEventBus();
			});
		};
	}, []);

	const loadEventBus = () => {
		const tempEvBus = window.KLUBR_EVENT_BUS as EventBus | null;
		setSettings((_) => ({
			..._,
			eventBus: tempEvBus,
		}));
		if (tempEvBus) {
			// TODO: rest of listeners
			tempEvBus?.on(`${context}emailUpdated`, (value: string) => {
				checkExistence(value, dispatch, statusRef.current);
			});
			tempEvBus?.on(`${context}klubDonResult`, (data: any) => {
				console.log('RECEIVED EVENT', data);
				if (data?.statusPaiment === 'success' && data?.montant && data?.uuid) {
					if (sponsorsList.pagination.currentPage === 1) {
						getDonsByKlubOrProjet(
							props.projectUuid || props.klubrUuid,
							props.projectUuid ? 'byProject' : 'byKlub',
							1,
							8,
						).then((res) => {
							dispatch(setSponsorsList(res));
						});
					}
					if (props.project && props.projectUuid) {
						dispatch(
							incrementProjectProgress({
								inc: Number(data?.montant),
								uuid: props.projectUuid,
							}),
						);
					}
				}
			});
		}
	};

	useEffect(() => {
		const urlParams = new URLSearchParams(location.search);
		setSettings((_) => ({
			..._,
			actions: {
				PAYEMENT_FORM: Boolean(urlParams.get('PAYEMENT_FORM')),
				DON_UUID: urlParams.get('DON_UUID'),
				RELAUNCH_CODE: urlParams.get('RELAUNCH_CODE'),
			},
		}));
	}, [params]);

	useEffect(() => {
		statusRef.current = session.status;
	}, [session]);

	useEffect(() => {
		if (!!settings.eventBus && session.status !== 'loading') {
			if (settings.actions.PAYEMENT_FORM) {
				scrollIntoForm().then(() => {
					(window.KLUBR_EVENT_BUS as EventBus)?.emit(`${context}controlForm`, true);
				});
			}
			if (
				settings.actions.DON_UUID &&
				(session.status === 'authenticated' || settings.actions.RELAUNCH_CODE)
			) {
				getRelaunchDon(
					settings.actions.DON_UUID as string,
					undefined,
					Number(settings.actions.RELAUNCH_CODE),
				)
					.then((res) => {
						if (res?.statusPaiment === 'success') {
							dispatch(
								pushToast({
									type: 'error',
									title: 'Ce don a déjà été payé !',
								}),
							);
							setSettings((_) => ({
								..._,
								actions: {
									..._.actions,
									DON_UUID: null,
								},
							}));
							return;
						} else if (res?.klubr?.slug !== props.club.slug) {
							dispatch(
								pushToast({
									type: 'error',
									title: "Ce don n'est pas destiné à ce club !",
								}),
							);
							setSettings((_) => ({
								..._,
								actions: {
									..._.actions,
									DON_UUID: null,
								},
							}));
							return;
						} else if (
							(!!res?.klub_projet && res?.klub_projet?.slug !== props?.project?.slug) ||
							(!!props?.project && props?.project?.slug !== res?.klub_projet?.slug)
						) {
							dispatch(
								pushToast({
									type: 'error',
									title: "Ce don n'est pas destiné à ce projet !",
								}),
							);
							setSettings((_) => ({
								..._,
								actions: {
									..._.actions,
									DON_UUID: null,
								},
							}));
							return;
						} else if (
							session.status === 'authenticated' &&
							res?.klubDonateur?.email !== session?.data?.email
						) {
							dispatch(
								pushToast({
									type: 'error',
									title: "Ce don n'a pas été créé par vous!",
								}),
							);
							setSettings((_) => ({
								..._,
								actions: {
									..._.actions,
									DON_UUID: null,
								},
							}));
							return;
						} else {
							settings.eventBus?.emit(`${context}populateForm`, {
								montant: res?.montant || NaN,
								siren: res?.klubDonateur?.SIREN || '',
								logo: res?.klubDonateur?.logo?.url || '',
								streetNumber: res?.klubDonateur?.adresse || '',
								streetName: res?.klubDonateur?.adresse2 || '',
								postalCode: res?.klubDonateur?.cp || '',
								birthdate: res?.klubDonateur?.dateNaissance || '',
								email: session?.data?.email || res?.klubDonateur?.email,
								city: res?.klubDonateur?.ville || '',
								displayAmount: res?.klubDonateur?.optInAffMontant || false,
								displayName: res?.klubDonateur?.optInAffNom || false,
								country: res?.klubDonateur?.pays || '',
								socialReason: res?.klubDonateur?.raisonSocial || '',
								civility: res?.klubDonateur?.civilite || 'Monsieur',
								tel: res?.klubDonateur?.tel || '',
								lastName: res?.klubDonateur?.nom || '',
								firstName: res?.klubDonateur?.prenom || '',
								legalForm: res?.klubDonateur?.formeJuridique || '',
								estOrganisme:
									!(
										res?.klubDonateur?.donateurType &&
										res?.klubDonateur?.donateurType === 'Particulier'
									) || false,
								withTaxReduction: res?.withTaxReduction,
								contributionAKlubr: res?.contributionAKlubr,
								place_id: res?.klubDonateur?.place_id,
							});
							settings.eventBus?.emit(`${context}editForm`, {
								donUuid: settings.actions.DON_UUID,
								projectUuid: res?.klub_projet?.uuid || res?.klubr?.uuid,
								donatorUuid: res?.klubDonateur?.uuid,
							});
						}
					})
					.catch((e) => {
						dispatch(
							pushToast({
								type: 'error',
								title: 'Vous ne pouvez pas modifier ce dons !',
							}),
						);
					});
			} else if (session.status === 'authenticated') {
				getMyLastDonation()
					.then((res) => {
						(window.KLUBR_EVENT_BUS as EventBus).emit(`${context}myLast`, res);
						(window.KLUBR_EVENT_BUS as EventBus).emit(`${context}auth_email`, session?.data?.email);
					})
					.catch((err) => {
						console.log(err);
					});
			}
		}
	}, [settings, session]);

	return {};
};
