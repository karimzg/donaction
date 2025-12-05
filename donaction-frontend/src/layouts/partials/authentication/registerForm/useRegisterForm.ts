import { FeedbackParamsType } from '@/partials/sponsorshipForm/logic/entities';
import { useRef, useState } from 'react';
import { signIn } from 'next-auth/react';
import { register } from '@/core/services/auth';
import { useRouter } from 'next/navigation';
import { pushToast } from '@/core/store/modules/rootSlice';
import { useAppDispatch } from '@/core/store/hooks';
import { sendGaEvent } from '@/core/helpers/sendGaEvent';

export default function useRegisterForm(value?: { email: string }) {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const [avatarError, setAvatarError] = useState(false);
	const receivedFeedbacks = useRef<Array<FeedbackParamsType>>([]);
	const [isPopUpOpen, setIsPopOpen] = useState(false);
	const [config, setConfig] = useState({
		defaultValues: {
			email: value?.email || '',
			password: '',
			confirmPassword: '',
			avatar: NaN,
			acceptConditions: false,
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
			if (isNaN(config.defaultValues.avatar)) {
				setAvatarError(true);
				return;
			}
			if (receivedFeedbacks.current.some((feedback) => !feedback.isValid)) return;
			sendGaEvent({
				category: 'Auth',
				label: `Credentials register`,
			});
			register(config.defaultValues)
				.then(() => {
					signIn('credentials', {
						redirect: false,
						identifier: config.defaultValues.email,
						password: config.defaultValues.password,
					}).then((res) => {
						if (res?.ok) {
							if (['/connexion'].includes(location.pathname)) {
								location.reload();
							}
						} else {
							dispatch(
								pushToast({
									type: 'error',
									title: `Une erreur est survenue`,
								}),
							);
						}
					});
				})
				.catch((error) => {
					sendGaEvent({
						category: 'Error Auth',
						label: `Credentials register --> ${error?.error?.status}: ${error?.error?.message}`,
					});
					if (error?.error?.message) {
						dispatch(
							pushToast({
								type: 'error',
								title: error?.error?.message,
							}),
						);
					}
				});
		});
	}

	const selectAvatar = (id: number) => {
		setAvatarError(false);
		setConfig((_) => ({
			..._,
			defaultValues: {
				..._.defaultValues,
				avatar: id,
			},
		}));
	};

	const controlPopUp = () => {
		setIsPopOpen((_) => !_);
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
		avatarError,
		selectAvatar,
		isPopUpOpen,
		controlPopUp,
	};
}
