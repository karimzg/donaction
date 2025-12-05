import { useRef, useState } from 'react';
import { FeedbackParamsType } from '@/partials/sponsorshipForm/logic/entities';
import { postResetPassword } from '@/core/services/auth';
import { useAppDispatch } from '@/core/store/hooks';
import { pushToast } from '@/core/store/modules/rootSlice';
import { useRouter } from 'next/navigation';

export default function useResetPasswordForm(code?: string) {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const receivedFeedbacks = useRef<Array<FeedbackParamsType>>([]);
	const [config, setConfig] = useState({
		defaultValues: {
			password: '',
			passwordConfirmation: '',
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
			postResetPassword({
				code: code || '',
				password: config.defaultValues.password,
				passwordConfirmation: config.defaultValues.passwordConfirmation,
			})
				.then((res) => {
					dispatch(
						pushToast({
							type: 'success',
							title: 'Votre mot de passe a été reinitialisé avec succès!',
						}),
					);
					router.push('/connexion');
				})
				.catch((e) => {
					dispatch(
						pushToast({
							type: 'error',
							title: 'Le lien de réinitialisation du mot de passe est invalide ou a expiré!',
						}),
					);
				});
		});
	}

	const triggerFieldsValidation = () => {
		setConfig((_) => ({
			..._,
			triggerValidation: _.triggerValidation + 1,
		}));
	};

	return {
		submitForm,
		config,
	};
}
