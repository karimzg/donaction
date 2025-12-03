import React from 'react';
import { Appearance, loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { ISponsorshipFormConfig } from '@/partials/sponsorshipForm/logic/useSponsorshipForm';
import { createPaymentIntent } from '@/core/services/don';
import LottieAnimation from '@/components/LottieAnimation';
import loadingJson from '@/../public/animations/loader.json';
import { updateKlubrDonStatus } from '@/partials/sponsorshipForm/logic/requests';
import PaymentCard from '@/partials/sponsorshipForm/steps/components/paymentCard';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const Step4: React.FC<{ config: ISponsorshipFormConfig }> = ({ config }) => {
	const [clientSecret, setClientSecret] = React.useState('');
	React.useEffect(() => {
		createPaymentIntent(Number(config.defaultValues.montant)).then((data) => {
			setClientSecret(data);
		});
	}, []);
	React.useEffect(() => {
		if (config.klubrDonUuId) {
			updateKlubrDonStatus('pending', new Date(), config.klubrDonUuId).then();
		}
	}, [config.klubrDonUuId]);

	const feedback = (isSuccessful: boolean) => {
		config.DEFAULT_FEEDBACK({
			cast: Boolean,
			isValid: isSuccessful,
			attribute: undefined,
			PAYEMENT_FEEDBACK: true,
		});
	};

	const appearance: Appearance = {
		theme: 'stripe',
	};
	const options: StripeElementsOptions = {
		clientSecret,
		appearance,
	};

	return (
		<>
			{clientSecret ? (
				<Elements options={options} stripe={stripePromise}>
					<PaymentCard config={config} feedback={feedback} />
				</Elements>
			) : (
				<LottieAnimation animation={loadingJson} />
			)}
		</>
	);
};

export default Step4;
