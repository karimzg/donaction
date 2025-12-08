import { useRef, useState } from 'react';
import { FeedbackParamsType } from '@/partials/sponsorshipForm/logic/entities';
import { checkUserExistence } from '@/core/services/auth';

export default function useConnexionForm(props: { value?: { email: string } }) {
	const [connexionType, setConexionType] = useState<null | 'LOGIN' | 'REGISTER'>(null);
	const receivedFeedbacks = useRef<Array<FeedbackParamsType>>([]);
	const [connexionConfig, setConnexionConfig] = useState({
		defaultValues: {
			identifier: props.value?.email || '',
		},
		triggerValidation: 1,
		DEFAULT_FEEDBACK: ({ attribute, cast, isValid }: FeedbackParamsType) => {
			receivedFeedbacks.current.push({ attribute, cast, isValid });
			if (attribute) {
				setConnexionConfig((_) => ({
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
			checkUserExistence(String(connexionConfig.defaultValues.identifier)).then((res) => {
				if (res?.provider === 'google') {
					(document.querySelector('#googleSignInBtn') as HTMLButtonElement)?.click();
					return;
				}
				setConexionType(!!res?.provider ? 'LOGIN' : 'REGISTER');
			});
		});
	}

	const stepBack = () => {
		setConexionType(null);
	};

	const triggerFieldsValidation = () => {
		setConnexionConfig((_) => ({
			..._,
			triggerValidation: _.triggerValidation + 1,
		}));
	};

	return {
		stepBack,
		submitForm,
		connexionType,
		connexionConfig,
	};
}
