'use client';

import { getIterableFields } from '@/partials/sponsorshipForm/logic/getIterableFields';
import React from 'react';
import { loginInfo } from '@/partials/sponsorshipForm/logic/consts';
import useLoginForm from '@/partials/authentication/loginForm/useLoginForm';

const LoginForm: React.FC<{ value?: { email: string }; hiddenEmail?: boolean }> = (props) => {
	const { config, forgotPassword, submitForm } = useLoginForm(props);
	return (
		<div className='flex flex-wrap gap-x-4 gap-y-0 w-full'>
			{getIterableFields(
				loginInfo(
					{
						identifier: props.value?.email || '',
						password: '',
					},
					props.hiddenEmail,
				),
				config.DEFAULT_FEEDBACK,
				config.triggerValidation,
			)}
			<button onClick={forgotPassword} className={'text-sm font-semibold mb-2 -mt-2 ml-auto'}>
				Mot de passe oublié ?
			</button>
			<button
				onClick={submitForm}
				className='btn btn-primary valid md:text-center rounded-xl border-black w-full mx-auto'
			>
				Se connecter
			</button>
		</div>
	);
};

export default LoginForm;
