'use client';
import useResetPasswordForm from '@/partials/authentication/resetPasswordForm/useResetPasswordForm';
import React from 'react';
import { getIterableFields } from '@/partials/sponsorshipForm/logic/getIterableFields';
import { resetPasswordInfo } from '@/partials/sponsorshipForm/logic/consts';

const ResetPasswordForm = ({ code }: { code?: string }) => {
	const { config, submitForm } = useResetPasswordForm(code);

	return (
		<div className='flex flex-wrap gap-x-4 gap-y-0 w-full'>
			<div className={'mb-6'}>
				<h1 className='text-3xl font-semibold'>Réinitialiser votre mot de passe</h1>
			</div>
			{getIterableFields(
				resetPasswordInfo(config.defaultValues),
				config.DEFAULT_FEEDBACK,
				config.triggerValidation,
			)}
			<button
				onClick={submitForm}
				className='btn btn-primary valid md:text-center rounded-xl border-black w-full mx-auto'
			>
				Confirmer
			</button>
		</div>
	);
};

export default ResetPasswordForm;
