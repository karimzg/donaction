'use client';
import React from 'react';
import Script from 'next/script';
import { Klub } from '@/core/models/club';
import { KlubProjet } from '@/core/models/klub-project';
import { useSponsorshipForm } from '@/partials/_sponsorshipForm/useSponsorshipForm';

const SponsorshipForm: React.FC<{
	klubrUuid: string;
	projectUuid?: string;
	club: Klub;
	project?: KlubProjet;
}> = (props) => {
	const {} = useSponsorshipForm(props);
	return (
		<>
			<Script
				type={'module'}
				src={`/klubr-web-components/components/KlubrSponsorshipForm.es.js?apiToken=${process.env.NEXT_PUBLIC_KLUBR_SPONSORSHIP_FORM_TOKEN}`}
			/>
			<klubr-sponsorship-form klubrUuid={props.klubrUuid} projectUuid={props.projectUuid}>
				<div slot='stripe-payment-form'></div>
			</klubr-sponsorship-form>
		</>
	);
};

export default SponsorshipForm;
