import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import {
	selectSponsorsFetchConfig,
	selectSponsorsList,
	setSponsorsList,
} from '@/core/store/modules/sponsorsSlice';
import { FormEvent, useEffect, useState } from 'react';
import { useElements, useStripe } from '@stripe/react-stripe-js';
import { updateKlubrDonStatus } from '@/partials/sponsorshipForm/logic/requests';
import { StripePaymentElementOptions } from '@stripe/stripe-js';
import { createKlubDonPayment, getDonsByKlubOrProjet } from '@/core/services/don';
import { ISponsorshipFormConfig } from '@/partials/sponsorshipForm/logic/useSponsorshipForm';
import { incrementProjectProgress } from '@/core/store/modules/projectSlice';
import { pushToast } from '@/core/store/modules/rootSlice';
import { createReCaptchaToken } from '@/core/services/cms';
import { sendGaEvent } from '@/core/helpers/sendGaEvent';

export default function usePaymentCard({
	feedback,
	config,
}: {
	feedback: (val: boolean) => void;
	config: ISponsorshipFormConfig;
}) {
	const dispatch = useAppDispatch();
	const sponsorsList = useAppSelector(selectSponsorsList);
	const sponsorsFetchConfig = useAppSelector(selectSponsorsFetchConfig);
	const [message, setMessage] = useState<string>('');
	const [isLoading, setIsLoading] = useState(false);
	const stripe = useStripe();
	const elements = useElements();

	useEffect(() => {
		/***
		 * This is needed if a reload is triggered
		 * */
		if (!stripe) {
			return;
		}

		const clientSecret = new URLSearchParams(window.location.search).get(
			'payment_intent_client_secret',
		);

		if (!clientSecret) {
			return;
		}

		stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
			switch (paymentIntent?.status) {
				case 'succeeded':
					setMessage('Payment succeeded!');
					feedback(true);
					break;
				case 'processing':
					setMessage('Your payment is processing.');
					break;
				case 'requires_payment_method':
					setMessage('Your payment was not successful, please try again.');
					break;
				default:
					feedback(false);
					setMessage('Something went wrong.');
					break;
			}
		});
	}, [stripe]);

	const handleSubmit = async (event: FormEvent) => {
		try {
			setIsLoading(true);
			event.preventDefault();
			if (!stripe || !elements) {
				return;
			}
			sendGaEvent({
				category: 'Donations',
				label: `Payment (${String(config?.klubrDonUuId)})`,
			});
			const result = await stripe.confirmPayment({
				elements,
				confirmParams: {},
				redirect: 'if_required', // Optional, controls redirect behavior after payment
			});
			const error = result?.error;
			if (error) {
				sendGaEvent({
					category: 'Error Donations',
					label: `Payment (${String(config?.klubrDonUuId)}) --> ${error?.type || 'error'}:${error?.message || 'An unexpected error occurred.'}`,
				});
				if (error.type === 'card_error' || error.type === 'validation_error') {
					setMessage(error.message || '');
					dispatch(
						pushToast({
							type: 'error',
							title: error.message || '',
						}),
					);
				} else {
					setMessage('An unexpected error occurred.');
					dispatch(
						pushToast({
							type: 'error',
							title: 'An unexpected error occurred.',
						}),
					);
				}
				await updateKlubrDonStatus('error', new Date(), String(config?.klubrDonUuId)).then();
				const formToken = await createReCaptchaToken('CREATE_DONATION_PAYMENT');
				await createKlubDonPayment({
					formToken,
					amount: error?.payment_intent?.amount,
					client_secret: error?.payment_intent?.client_secret,
					currency: error?.payment_intent?.currency,
					payment_method: error?.payment_method?.id,
					created: error?.payment_intent?.created,
					intent_id: error?.payment_intent?.id,
					status: error?.payment_intent?.status,
					error_code: error?.code,
					klub_don: config.klubrDonUuId,
				});
			} else {
				if (result.paymentIntent?.client_secret) {
					await stripe
						.retrievePaymentIntent(result.paymentIntent?.client_secret)
						.then(async ({ paymentIntent, error }) => {
							try {
								const formToken = await createReCaptchaToken('CREATE_DONATION_PAYMENT');
								await createKlubDonPayment({
									formToken,
									amount: paymentIntent?.amount,
									client_secret: paymentIntent?.client_secret,
									currency: paymentIntent?.currency,
									payment_method: paymentIntent?.payment_method,
									created: paymentIntent?.created,
									intent_id: paymentIntent?.id,
									status: paymentIntent?.status,
									klub_don: config.klubrDonUuId,
								});
								await updateKlubrDonStatus(
									paymentIntent?.status === 'succeeded' ? 'success' : 'error',
									new Date(),
									String(config?.klubrDonUuId || ''),
								);
								if (sponsorsList.pagination.currentPage === 1) {
									const result = await getDonsByKlubOrProjet(
										sponsorsFetchConfig.uuid || '',
										sponsorsFetchConfig.byKlubOrProject || 'byKlub',
										1,
										8,
									);
									dispatch(setSponsorsList(result));
								}
								if (config.selectedProject && config.selectedProject.uuid) {
									dispatch(
										incrementProjectProgress({
											inc: Number(config.defaultValues.montant),
											uuid: config.selectedProject.uuid,
										}),
									);
								}
								switch (paymentIntent?.status) {
									case 'succeeded':
										feedback(true);
										setMessage('Payment succeeded!');
										break;
									case 'processing':
										setMessage('Your payment is processing.');
										break;
									case 'requires_payment_method':
										setMessage('Your payment was not successful, please try again.');
										break;
									default:
										feedback(false);
										setMessage('Something went wrong.');
										break;
								}
							} catch (e) {
								dispatch(
									pushToast({
										type: 'error',
										title: 'An unexpected error occurred.',
									}),
								);
							}
						})
						.catch((e) => {
							sendGaEvent({
								category: 'Error Donations',
								label: `Payment (${String(config?.klubrDonUuId)}) --> Intent error`,
							});
							dispatch(
								pushToast({
									type: 'error',
									title: 'An unexpected error occurred.',
								}),
							);
						});
				}
			}

			setIsLoading(false);
		} catch (e) {
			console.log('Error payment', e);
			setIsLoading(false);
		}
	};

	const paymentElementOptions: StripePaymentElementOptions = {
		layout: 'tabs',
		fields: {
			billingDetails: {
				name: 'auto',
			},
		},
	};

	return {
		paymentElementOptions,
		message,
		isLoading,
		stripe,
		elements,
		handleSubmit,
	};
}
