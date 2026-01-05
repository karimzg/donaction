import { useEffect, useRef, useState } from 'react';
import { FeedbackParamsType } from '@/partials/sponsorshipForm/logic/entities';
import { pushToast } from '@/core/store/modules/rootSlice';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { selectSession } from '@/core/store/modules/authSlice';
import { sendGaEvent } from '@/core/helpers/sendGaEvent';
import { useRouter } from 'next/navigation';
import { createKlubrByMember, createUpdateKlubrMember, getKlubrMember } from '@/core/services/club';
import GetClientCookie from '@/core/helpers/getClientCookie';
import { createReCaptchaToken } from '@/core/services/cms';

export default function useNewClubForm() {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const session = useAppSelector(selectSession);
	const [progress, setProgress] = useState(0);
	const receivedFeedbacks = useRef<Array<FeedbackParamsType>>([]);
	const [isPopUpOpen, setIsPopOpen] = useState(false);
	const [config, setConfig] = useState({
		stepIndex: 0,
		defaultValues: {
			nom: '',
			prenom: '',
			birthDate: '',
			tel: '',
			email: '',
			clubName: '',
			acronyme: '',
			adresse: '',
			legalStatus: '',
			sportType: '',
			acceptConditions1: false,
			acceptConditions2: false,
		},
		triggerValidation: 1,
		clearValues: 1,
		DEFAULT_FEEDBACK: ({ attribute, cast, isValid }: FeedbackParamsType) => {
			updateProgress(isValid, attribute?.name);
			receivedFeedbacks.current.push({ attribute, cast, isValid });
			if (attribute) {
				setConfig((_) => ({
					..._,
					defaultValues: {
						..._.defaultValues,
						[attribute.name]: cast(attribute.value),
					},
				}));
			}
		},
	});

	useEffect(() => {
		const cookie = GetClientCookie('klubrCreationDirigeant') || undefined;
		const urlParams = new URLSearchParams(location.search);

		if (cookie || urlParams.get('member-uuid')) {
			getKlubrMember((urlParams.get('member-uuid') || cookie) as string)
				.then((res) => {
					setConfig((_) => ({
						..._,
						defaultValues: {
							..._.defaultValues,
							nom: res?.nom || '',
							prenom: res?.prenom || '',
							tel: res?.tel || '',
							birthDate: res?.birthDate || '',
							email: res?.email || '',
						},
					}));
					triggerFieldsValidation();
				})
				.catch((e) => {
					document.cookie = `klubrCreationDirigeant=${cookie}; path=/; max-age=0; Secure; SameSite=Strict`;
				});
		}
	}, []);

	const record: Record<string, number> = {
		nom: 0,
		prenom: 0,
		birthDate: 0,
		tel: 0,
		email: 0,
		clubName: 0,
		acronyme: 0,
		adresse: 0,
		legalStatus: 0,
		sportType: 0,
		acceptConditions1: 0,
		acceptConditions2: 0,
	};

	function updateProgress(isValid: boolean, attribute?: string) {
		if (attribute && !isNaN(record[attribute])) {
			record[attribute] = isValid ? 1 : 0;
		}
		const sum = Object.keys(record).reduce((acc, curr) => {
			return acc + record[curr];
		}, 0);

		setProgress((sum / Object.keys(record).length) * 100);
	}

	function back() {
		setConfig((_) => ({ ..._, stepIndex: 0 }));
	}

	const defaultValuesRef = useRef({ ...config.defaultValues });
	useEffect(() => {
		defaultValuesRef.current = { ...config.defaultValues };
	}, [config]);

	function submitForm() {
		receivedFeedbacks.current = [];
		triggerFieldsValidation();

		process.nextTick(async () => {
			if (receivedFeedbacks.current.some((feedback) => !feedback.isValid)) return;

			try {
				const cookie = GetClientCookie('klubrCreationDirigeant') || undefined;
				if (config.stepIndex === 0) {
					const urlParams = new URLSearchParams(location.search);
					const formToken = await createReCaptchaToken(
						urlParams.get('member-uuid') || cookie ? 'UPDATE_KLUBR_MEMBER' : 'CREATE_KLUBR_MEMBER',
					);
					const res = await createUpdateKlubrMember(
						{
							nom: defaultValuesRef.current.nom,
							prenom: defaultValuesRef.current.prenom,
							email: defaultValuesRef.current.email,
							tel: defaultValuesRef.current.tel,
							birthDate: defaultValuesRef.current.birthDate,
							formToken,
						},
						urlParams.get('member-uuid') || cookie,
					);
					if (!cookie) {
						document.cookie = `klubrCreationDirigeant=${res.uuid}; path=/; max-age=${7 * 24 * 60 * 60}; Secure; SameSite=Strict`;
					}
					setConfig((_) => ({ ..._, stepIndex: 1 }));
					return;
				}
				if (cookie) {
					const service = new google.maps.places.PlacesService(document.createElement('div'));
					service.getDetails(
						{ placeId: defaultValuesRef.current?.adresse || '' },
						async (place, status) => {
							try {
								if (status === google.maps.places.PlacesServiceStatus.OK) {
									const formToken = await createReCaptchaToken('CREATE_KLUBR_BY_MEMBER');
									const urlParams = new URLSearchParams(location.search);
									const res = await createKlubrByMember(
										{
											denomination: defaultValuesRef.current.clubName,
											acronyme: defaultValuesRef.current.acronyme,
											sportType: defaultValuesRef.current.sportType,
											legalStatus: defaultValuesRef.current.legalStatus,
											federationLink: urlParams.get('FEDERATION_LINK') || undefined,
											googlePlace: place,
											formToken,
										},
										cookie,
									);
									document.cookie = `klubrCreationDirigeant=${cookie}; path=/; max-age=0; Secure; SameSite=Strict`;
                                    const emailParam = res?.emailSent === false ? '&emailSent=failed' : '';
                                    router.push(`/new-club/congratulations?clubUuid=${res?.uuid}${emailParam}`);
								} else {
									console.log(status);
									dispatch(
										pushToast({
											type: 'error',
											title: 'Erreur google places',
										}),
									);
								}
							} catch (e) {
								catchError(e);
							}
						},
					);
				}
			} catch (e) {
				catchError(e);
			}
		});
	}

	const catchError = (e: any) => {
		let message = 'Une erreur est survenue';
		if (e?.error?.details?.message === 'This attribute must be unique') {
			message = 'Il existe déjà un club avec ce nom';
		} else if (e?.error?.message) {
			message = e?.error?.message || 'Le membre est déjà lié à un autre club';
		}
		sendGaEvent({
			category: 'Error Club Creation',
			label: `Create club form submit --> `,
		});
		dispatch(
			pushToast({
				type: 'error',
				title: message,
			}),
		);
	};

	const triggerFieldsValidation = () => {
		setConfig((_) => ({
			..._,
			triggerValidation: _.triggerValidation + 1,
		}));
	};

	const controlPopUp = () => {
		setIsPopOpen((_) => !_);
	};

	return { config, submitForm, session, progress, back, isPopUpOpen, controlPopUp };
}
