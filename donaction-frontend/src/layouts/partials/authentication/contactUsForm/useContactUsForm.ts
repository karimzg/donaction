import { useRef, useState } from 'react';
import { FeedbackParamsType } from '@/partials/sponsorshipForm/logic/entities';
import { createReCaptchaToken, postContactUs } from '@/core/services/cms';
import { pushToast } from '@/core/store/modules/rootSlice';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { selectSession } from '@/core/store/modules/authSlice';
import { sendGaEvent } from '@/core/helpers/sendGaEvent';

export default function useContactUsForm() {
	const dispatch = useAppDispatch();
	const session = useAppSelector(selectSession);
	const receivedFeedbacks = useRef<Array<FeedbackParamsType>>([]);
	const [config, setConfig] = useState({
		defaultValues: {
			email: session?.data?.email || '',
			object: '',
			msg: '',
		},
		triggerValidation: 1,
		clearValues: 1,
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

			try {
				sendGaEvent({
					category: 'Contact',
					label: 'Contact form submit',
				});
				const formToken = await createReCaptchaToken('CREATE_CONTACT_FORM');
				await postContactUs({ data: { ...config.defaultValues, formToken } });
				dispatch(
					pushToast({
						type: 'success',
						title: 'Email envoyé',
					}),
				);
				setConfig((_) => ({
					..._,
					clearValues: _.clearValues + 1,
					defaultValues: {
						email: session?.data?.email || '',
						object: '',
						msg: '',
					},
				}));
			} catch (e) {
				sendGaEvent({
					category: 'Error Contact',
					label: `Contact form submit --> `,
				});
				dispatch(
					pushToast({
						type: 'error',
						title: 'Une erreur est survenue',
					}),
				);
			}
		});
	}

	const triggerFieldsValidation = () => {
		setConfig((_) => ({
			..._,
			triggerValidation: _.triggerValidation + 1,
		}));
	};

	return { config, submitForm, session };
}
