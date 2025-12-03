import { useEffect, useRef, useState } from 'react';
import {
	Arg0Type,
	FeedbackParamsType,
	ISponsorshipFormResult,
} from '@/partials/sponsorshipForm/logic/entities';
import { Klub } from '@/core/models/club';
import { KlubProjet } from '@/core/models/klub-project';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { checkExistence, submitFormData } from '@/partials/sponsorshipForm/logic/requests';
import { pushToast } from '@/core/store/modules/rootSlice';
import { getDon, getMyLastDonation } from '@/core/services/don';
import { selectSession } from '@/core/store/modules/authSlice';
import { getProjetsByKlub } from '@/core/services/projet';
import { useParams } from 'next/navigation';
import { sendGaEvent } from '@/core/helpers/sendGaEvent';

export interface ISponsorshipFormConfig {
	club: Klub;
	stepIndex: number;
	defaultValues: {
		[key in keyof ISponsorshipFormResult]: string | number | boolean;
	};
	triggerValidation: number;
	clearValues?: number;
	DEFAULT_FEEDBACK: ({ attribute, cast, isValid, PAYEMENT_FEEDBACK }: FeedbackParamsType) => void;
	klubrDonUuId: string | null;
	klubrDonateurId: string | null;
	selectedProject: KlubProjet | undefined;
	isProjectDonation: 0 | 1;
	projectSelectionError: boolean;
	formDirty: boolean;
}

export const useSponsorshipForm = (
	club: Klub,
	canChooseProject: boolean,
	selectedProject?: KlubProjet,
) => {
	const session = useAppSelector(selectSession);
	const statusRef = useRef(session.status);
	const dispatch = useAppDispatch();
	const [isBeingFilled, setIsBeingFilled] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState(false);
	const defaultValues = {
		estOrganisme: false,
		montant: NaN,
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
		country: '',
		displayName: false,
		displayAmount: false,
		acceptConditions1: false,
		acceptConditions2: false,
	};
	const donUuid = useRef<string | null>(null);
	let emailLatestValue = '';
	const [config, setConfig] = useState<ISponsorshipFormConfig>({
		club,
		klubrDonUuId: null,
		klubrDonateurId: null,
		stepIndex: 0,
		defaultValues,
		triggerValidation: 1,
		clearValues: 1,
		DEFAULT_FEEDBACK: ({ attribute, cast, isValid, PAYEMENT_FEEDBACK }: FeedbackParamsType) => {
			if (!isBeingFilled) {
				setIsBeingFilled(true);
			}
			if (Boolean(PAYEMENT_FEEDBACK)) {
				incrementStepIndex(1);
			} else {
				receivedFeedbacks.current.push({ attribute, cast, isValid });
				if (attribute) {
					checkExistence(
						{ attribute, cast, isValid },
						dispatch,
						emailLatestValue,
						statusRef.current,
					);
					setConfig((_) => {
						attribute?.name === 'email' && (emailLatestValue = String(attribute.value));
						return {
							..._,
							defaultValues: {
								..._.defaultValues,
								[attribute.name]: cast(attribute.value),
							},
						};
					});
				}
			}
		},
		isProjectDonation: 0,
		selectedProject,
		projectSelectionError: false,
		formDirty: true,
	});
	const receivedFeedbacks = useRef<Array<FeedbackParamsType>>([]);
	const form = useRef<{ [key: string]: Arg0Type }>(config.defaultValues);
	const submitForm = (acc: number) => {
		receivedFeedbacks.current = [];
		triggerFieldsValidation();

		process.nextTick(async () => {
			if (acc > 0) {
				if (receivedFeedbacks.current.some((feedback) => !feedback.isValid)) return;
				const projectSelectionError = Boolean(
					Boolean(config.isProjectDonation) && !config.selectedProject && config.stepIndex === 0,
				);
				setConfig((val) => ({
					...val,
					projectSelectionError,
				}));
				if (projectSelectionError) {
					return;
				}
				updateFormDataFromFeedback();
				if (config.stepIndex === 2) {
					await handleSubmitStepTwo();
				} else {
					incrementStepIndex(acc);
				}
			} else {
				incrementStepIndex(acc);
			}
		});
	};

	const updateFormDataFromFeedback = () => {
		receivedFeedbacks.current.forEach((feedback) => {
			if (feedback.attribute) {
				form.current[feedback.attribute.name] = feedback.attribute.value;
			}
		});
	};

	const handleSubmitStepTwo = async () => {
		setIsLoading(true);
		if (!form.current.estOrganisme) {
			delete form.current.legalForm;
			delete form.current.siren;
			delete form.current.socialReason;
			delete form.current.logo;
		}

		submitFormData({
			formData: form.current,
			setter: setConfig,
			getter: config,
		})
			.then((_) => {
				incrementStepIndex(1);
			})
			.catch((err) => {
				console.log(err);
				dispatch(
					pushToast({
						type: 'error',
						title: err?.error?.message || "Une erreur s'est produite",
					}),
				);
			})
			.finally(() => setIsLoading(false));
	};

	const incrementStepIndex = (acc: number) => {
		setConfig((prev) => {
			sendGaEvent({
				category: 'Form don',
				step: Math.max(0, prev.stepIndex + acc),
				label: `Navigation vers step ${Math.max(0, prev.stepIndex + acc)}`,
			});
			return { ...prev, stepIndex: Math.max(0, prev.stepIndex + acc) };
		});
	};

	const triggerFieldsValidation = () => {
		setConfig((_) => ({
			..._,
			triggerValidation: _.triggerValidation + 1,
		}));
	};

	const projectsSlideFeedback = (data: {
		isProjectDonation: 0 | 1;
		selectedProject: KlubProjet;
	}) => {
		if (!isBeingFilled) {
			setIsBeingFilled(true);
		}
		setConfig((_) => ({
			..._,
			isProjectDonation: data.isProjectDonation,
			selectedProject: data.selectedProject,
			projectSelectionError: Boolean(
				Boolean(data.isProjectDonation) && !data.selectedProject && config.isProjectDonation === 1,
			),
		}));
	};

	useEffect(() => {
		document.body.style.overflow = isBeingFilled ? 'hidden' : 'auto';
		if (!isBeingFilled && config.stepIndex === 4) {
			setConfig((_) => ({
				..._,
				stepIndex: 0,
				isProjectDonation: 0,
				defaultValues,
				klubrDonUuId: null,
				klubrDonateurId: null,
				selectedProject,
				formDirty: true,
			}));
			isAlreadyFilled.current = false;
		}
		return () => {
			document.body.style.overflow = 'auto';
		};
	}, [isBeingFilled]);

	const isAlreadyFilled = useRef(false);

	useEffect(() => {
		statusRef.current = session.status;

		if (
			session.status === 'authenticated' &&
			config.stepIndex === 1 &&
			!donUuid.current &&
			!isAlreadyFilled.current
		) {
			setIsLoading(true);
			getMyLastDonation()
				.then((res) => {
					isAlreadyFilled.current = true;
					setConfig((_) => ({
						..._,
						defaultValues: {
							..._.defaultValues,
							siren: res[0]?.SIREN || _.defaultValues.siren,
							logo: res[0]?.logo?.url || _.defaultValues.logo,
							streetNumber: res[0]?.adresse || _.defaultValues.streetNumber,
							streetName: res[0]?.adresse2 || _.defaultValues.streetName,
							postalCode: res[0]?.cp || _.defaultValues.postalCode,
							birthdate: res[0]?.dateNaissance || _.defaultValues.birthdate,
							email: session?.data?.email || res[0]?.email,
							city: res[0]?.ville || _.defaultValues.city,
							displayAmount: res[0]?.optInAffMontant || _.defaultValues.displayAmount,
							displayName: res[0]?.optInAffNom || _.defaultValues.displayName,
							country: res[0]?.pays || _.defaultValues.country,
							socialReason: res[0]?.raisonSocial || _.defaultValues.socialReason,
							civility: res[0]?.civilite || _.defaultValues.civility,
							tel: res[0]?.tel || _.defaultValues.tel,
							lastName: res[0]?.nom || _.defaultValues.lastName,
							firstName: res[0]?.prenom || _.defaultValues.firstName,
							legalForm: res[0]?.formeJuridique || _.defaultValues.legalForm,
						},
					}));
				})
				.catch((err) => {
					console.log(err, 'aaa');
				})
				.finally(() => setIsLoading(false));
		}
	}, [session, config.stepIndex]);

	const params = useParams();
	useEffect(() => {
		const urlParams = new URLSearchParams(location.search);
		if (urlParams.get('PAYEMENT_FORM')) {
			scrollIntoForm().then(() => {
				setIsBeingFilled(true);
				if (urlParams.get('DON_UUID')) {
					setIsLoading(true);
					donUuid.current = urlParams.get('DON_UUID');
					getDon(donUuid.current as string)
						.then((res) => {
							if (res?.statusPaiment === 'success') {
								dispatch(
									pushToast({
										type: 'error',
										title: 'Ce don a déjà été payé !',
									}),
								);
								donUuid.current = null;
								return;
							}
							if (res?.klubr?.slug !== club.slug) {
								dispatch(
									pushToast({
										type: 'error',
										title: "Ce don n'est pas destiné à ce club !",
									}),
								);
								donUuid.current = null;
								return;
							}
							if (
								(!!res?.klub_projet && res?.klub_projet?.slug !== selectedProject?.slug) ||
								(!!selectedProject && selectedProject?.slug !== res?.klub_projet?.slug)
							) {
								dispatch(
									pushToast({
										type: 'error',
										title: "Ce don n'est pas destiné à ce projet !",
									}),
								);
								donUuid.current = null;
								return;
							}
							if (
								session.status === 'authenticated' &&
								res?.klubDonateur?.email !== session?.data?.email
							) {
								dispatch(
									pushToast({
										type: 'error',
										title: "Ce don n'a pas été créé par vous!",
									}),
								);
								donUuid.current = null;
								return;
							}
							setConfig((_) => ({
								..._,
								defaultValues: {
									..._.defaultValues,
									montant: res?.montant || _.defaultValues.montant,
									siren: res?.klubDonateur?.SIREN || _.defaultValues.siren,
									logo: res?.klubDonateur?.logo?.url || _.defaultValues.logo,
									streetNumber: res?.klubDonateur?.adresse || _.defaultValues.streetNumber,
									streetName: res?.klubDonateur?.adresse2 || _.defaultValues.streetName,
									postalCode: res?.klubDonateur?.cp || _.defaultValues.postalCode,
									birthdate: res?.klubDonateur?.dateNaissance || _.defaultValues.birthdate,
									email: session?.data?.email || res?.klubDonateur?.email,
									city: res?.klubDonateur?.ville || _.defaultValues.city,
									displayAmount:
										res?.klubDonateur?.optInAffMontant || _.defaultValues.displayAmount,
									displayName: res?.klubDonateur?.optInAffNom || _.defaultValues.displayName,
									country: res?.klubDonateur?.pays || _.defaultValues.country,
									socialReason: res?.klubDonateur?.raisonSocial || _.defaultValues.socialReason,
									civility: res?.klubDonateur?.civilite || _.defaultValues.civility,
									tel: res?.klubDonateur?.tel || _.defaultValues.tel,
									lastName: res?.klubDonateur?.nom || _.defaultValues.lastName,
									firstName: res?.klubDonateur?.prenom || _.defaultValues.firstName,
									legalForm: res?.klubDonateur?.formeJuridique || _.defaultValues.legalForm,
									estOrganisme:
										!(
											res?.klubDonateur?.donateurType &&
											res?.klubDonateur?.donateurType === 'Particulier'
										) || _.defaultValues.estOrganisme,
								},
								stepIndex: 0,
								selectedProject: res?.klub_projet,
								klubrDonUuId: donUuid.current,
								klubrDonateurId: res?.klubDonateur?.uuid,
							}));
						})
						.finally(() => setIsLoading(false));
				}
				window.history.replaceState({}, document.title, location.pathname);
			});
		}
	}, [params]);

	const scrollIntoForm = async () => {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				sendGaEvent({
					category: 'Form don',
					label: `Scroll into form`,
				});
				document.getElementById('PAYEMENT_FORM_ID')?.scrollIntoView({
					block: 'center',
					behavior: 'instant',
				});
				resolve(true);
			}, 0);
		});
	};

	const [slides, setSlides] = useState<Array<KlubProjet>>([]);
	const fetchProjectsList = async () => {
		try {
			const projets = await getProjetsByKlub(`${club.uuid}`, 1, 20);
			setSlides(projets.data);
		} catch (error) {
			console.error('Erreur lors de la récupération des projets', error);
		}
	};

	useEffect(() => {
		if (canChooseProject) {
			fetchProjectsList().then();
		}
	}, []);

	const mounted = useRef(false);
	useEffect(() => {
		if (mounted.current) {
			sendGaEvent({
				category: 'Form don',
				label: `${isBeingFilled ? 'Ouverture' : 'Fermeture'} formulaire, step: ${config.stepIndex}`,
			});
		} else {
			mounted.current = true;
		}
	}, [isBeingFilled]);

	return {
		config,
		slides,
		isLoading,
		submitForm,
		isBeingFilled,
		setIsBeingFilled,
		projectsSlideFeedback,
		receivedFeedback: receivedFeedbacks.current,
	};
};
