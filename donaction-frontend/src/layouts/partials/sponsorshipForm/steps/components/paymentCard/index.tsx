'use client';

import React from 'react';
import { ISponsorshipFormConfig } from '@/partials/sponsorshipForm/logic/useSponsorshipForm';
import { PaymentElement } from '@stripe/react-stripe-js';
import SpinnerButton from '@/components/spinnerButton';
import usePaymentCard from '@/partials/sponsorshipForm/steps/components/paymentCard/usePaymentCard';

const PaymentCard: React.FC<{
	config: ISponsorshipFormConfig;
	feedback: (val: boolean) => void;
}> = ({ config, feedback }) => {
	const {
		//
		stripe,
		message,
		elements,
		isLoading,
		handleSubmit,
		paymentElementOptions,
	} = usePaymentCard({
		feedback,
		config,
	});

	return (
		<form className='flex flex-col items-center gap-4' id='payment-form' onSubmit={handleSubmit}>
			<PaymentElement id='payment-element' options={paymentElementOptions} />
			<SpinnerButton
				id='submit'
				type='submit'
				isLoading={isLoading}
				className='btn btn-primary'
				disabled={isLoading || !stripe || !elements}
			>
				Je confirme mon soutien
			</SpinnerButton>
			{message && <div id='payment-message'>{message}</div>}
		</form>
	);
};

export default PaymentCard;
