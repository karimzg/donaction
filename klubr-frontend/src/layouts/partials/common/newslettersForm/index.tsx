'use client';

import React, { useRef, useState } from 'react';
import { FeedbackParamsType } from '@/partials/sponsorshipForm/logic/entities';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { selectSession } from '@/core/store/modules/authSlice';
import { createReCaptchaToken, postNewsletters } from '@/core/services/cms';
import { pushToast } from '@/core/store/modules/rootSlice';
import InputField from '@/partials/sponsorshipForm/steps/components/inputField';
import { validateEmail, validateRequired } from '@/partials/sponsorshipForm/logic/validations';

export default function NewslettersForm() {
	const dispatch = useAppDispatch();
	const session = useAppSelector(selectSession);
	const receivedFeedbacks = useRef<Array<FeedbackParamsType>>([]);
	const [config, setConfig] = useState({
		defaultValues: {
			email: session?.data?.email || '',
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
				const formToken = await createReCaptchaToken('CREATE_NEWSLETTER_FORM');
				await postNewsletters({ data: { ...config.defaultValues, formToken } });
				dispatch(
					pushToast({
						type: 'success',
						title: 'Vous êtes désormais abonné à la newsletter Klubr !',
					}),
				);
			} catch (error: any) {
				if (
					error?.error?.status === 400 &&
					error.error?.message === 'This attribute must be unique'
				) {
					dispatch(
						pushToast({
							type: 'success',
							title: 'Vous êtes déjà abonné !',
						}),
					);
				} else {
					dispatch(
						pushToast({
							type: 'error',
							title: 'Une erreur est survenue',
						}),
					);
				}
			}
		});
	}

	const triggerFieldsValidation = () => {
		setConfig((_) => ({
			..._,
			triggerValidation: _.triggerValidation + 1,
		}));
	};

	return (
		<div className={'mb-4 relative w-full max-w-[600px]'}>
			<InputField
				{...{
					...{
						name: 'email',
						type: 'email',
						defaultValue: String(config.defaultValues.email),
						isRequired: true,
						label: '',
						validation: (arg0, fieldName) =>
							validateRequired(arg0, fieldName) || validateEmail(arg0, fieldName),
						cast: String,
						parentClassName: 'w-full noSmallDefHeight',
						placeholder: 'Saisissez votre e-mail',
					},
					hideError: true,
					className: 'bg-black text-white border-white rounded-xl text-[14px] w-full h-14',
					feedback: config.DEFAULT_FEEDBACK,
					triggerValidation: config.triggerValidation,
					clearValues: config.clearValues,
				}}
			/>
			<InputField
				{...{
					name: 'submit',
					value: 'Je m’abonnne',
					type: 'submit',
					cast: String,
					className: 'buttonInput',
					parentClassName:
						'absolute noMarginInput bg-white text-black right-0 top-0 h-full rounded-xl px-6 flex items-center justify-center',
				}}
				onClick={submitForm}
				className={`w-full py-[8px] mt-4 cursor-pointer`}
			/>
		</div>
	);
}
