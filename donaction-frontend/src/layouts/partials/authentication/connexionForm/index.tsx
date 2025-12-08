'use client';

import { getIterableFields } from '@/partials/sponsorshipForm/logic/getIterableFields';
import React from 'react';
import { connexionInfo } from '@/partials/sponsorshipForm/logic/consts';
import useConnexionForm from '@/partials/authentication/connexionForm/useConnexionForm';
import LoginForm from '@/partials/authentication/loginForm';
import RegisterForm from '@/partials/authentication/registerForm';
import { Avatar } from '@/core/services/entities';
import arrowCircleLeft from '../../../../../public/images/icons/arrowCircleLeft.svg';
import Image from 'next/image';

const ConnexionForm: React.FC<{
	value?: { email: string };
	avatars: {
		womenAvatars: Array<Avatar>;
		menAvatars: Array<Avatar>;
	};
}> = (props) => {
	const { connexionConfig, stepBack, connexionType, submitForm } = useConnexionForm(props);
	return (
		<div className='flex flex-wrap gap-x-4 gap-y-0 w-full'>
			<div className={'mb-6'}>
				<div className={'flex gap-2 items-center'}>
					{!!connexionType && (
						<Image
							onClick={stepBack}
							className={'cursor-pointer'}
							src={arrowCircleLeft as string}
							alt='arrow-circle-left'
						/>
					)}
					<h1 className='text-3xl font-semibold'>
						{['LOGIN', null].includes(connexionType) && 'Se connecter'}
						{!connexionType && '/'}
						{['REGISTER', null].includes(connexionType) && 'Créer un compte'}
					</h1>
				</div>
				{connexionType === 'REGISTER' && (
					<small className={'text-[#F7A74F]'}>
						On ne se connait pas encore! Créez votre compte.
					</small>
				)}
				{connexionType === 'LOGIN' && (
					<small className={'text-[#F7A74F]'}>
						On dirait qu'on se connait! Connectez-vous avec votre mot de passe.
					</small>
				)}
			</div>
			{getIterableFields(
				connexionInfo({ identifier: props.value?.email || '' }, connexionType !== null),
				connexionConfig.DEFAULT_FEEDBACK,
				connexionConfig.triggerValidation,
			)}
			{connexionType === 'LOGIN' && (
				<LoginForm hiddenEmail value={{ email: connexionConfig.defaultValues.identifier || '' }} />
			)}
			{connexionType === 'REGISTER' && (
				<RegisterForm
					hiddenEmail
					value={{ email: connexionConfig.defaultValues.identifier || '' }}
					avatars={props.avatars}
				/>
			)}
			{!connexionType && (
				<button
					onClick={submitForm}
					className='btn btn-primary valid md:text-center rounded-xl border-black w-full mx-auto'
				>
					Se connecter/Créer un compte
				</button>
			)}
		</div>
	);
};

export default ConnexionForm;
