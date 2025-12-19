import { FeedbackParamsType } from '@/partials/sponsorshipForm/logic/entities';
import { useRef, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useAppDispatch } from '@/core/store/hooks';
import { pushToast } from '@/core/store/modules/rootSlice';
import { sendGaEvent } from '@/core/helpers/sendGaEvent';
import { postForgotPassword } from '@/core/services/auth';

export default function useLoginForm(props: { value?: { email: string } }) {
	const dispatch = useAppDispatch();
	const receivedFeedbacks = useRef<Array<FeedbackParamsType>>([]);
	const [config, setConfig] = useState({
		defaultValues: {
			identifier: props.value?.email || '',
			password: '',
		},
		triggerValidation: 1,
		DEFAULT_FEEDBACK: ({ attribute, cast, isValid }: FeedbackParamsType) => {
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

	function submitForm() {
		receivedFeedbacks.current = [];
		triggerFieldsValidation();

		process.nextTick(async () => {
			if (receivedFeedbacks.current.some((feedback) => !feedback.isValid)) return;
			sendGaEvent({
				category: 'login',
				method: 'Email',
				label: 'Credentials login',
			});
			signIn('credentials', {
				redirect: false,
				...config.defaultValues,
			})
				.then((res) => {
					if (res?.ok) {
						if (['/connexion'].includes(location.pathname)) {
							location.reload();
						}
					} else {
						sendGaEvent({
							category: 'Error Auth',
							method: 'Email',
							label: `Credentials login --> ${res?.status}: ${res?.error}`,
						});
						dispatch(
							pushToast({
								type: 'error',
								title: `Votre mot de passe est incorrect`,
							}),
						);
					}
				})
				.catch((error) => {
					console.log(error);
				});
		});
	}

	const forgotPassword = () => {
		postForgotPassword({ email: config.defaultValues.identifier })
			.then((res) => {
				dispatch(
					pushToast({
						type: 'success',
						title: `Un email a été envoyé à ${config.defaultValues.identifier}`,
					}),
				);
			})
			.catch((e) => {
				dispatch(
					pushToast({
						type: 'error',
						title: `Une erreur s'est produite`,
					}),
				);
			});
	};

	const triggerFieldsValidation = () => {
		setConfig((_) => ({
			..._,
			triggerValidation: _.triggerValidation + 1,
		}));
	};

	return {
		config,
		submitForm,
		forgotPassword,
	};
}
