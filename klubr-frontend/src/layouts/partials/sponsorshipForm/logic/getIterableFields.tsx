import { FeedbackParamsType, FieldInterface } from '@/partials/sponsorshipForm/logic/entities';
import InputField from '@/partials/sponsorshipForm/steps/components/inputField';
import React from 'react';

export const getIterableFields = (
	fields: { [key: string]: FieldInterface },
	feedback?: (params: FeedbackParamsType) => void,
	triggerValidation?: number,
	clearValues?: number,
) => {
	return Object.values(fields).map((field) => (
		<InputField
			{...{
				...field,
				feedback,
				triggerValidation,
				clearValues,
			}}
			key={field.name}
		/>
	));
};
