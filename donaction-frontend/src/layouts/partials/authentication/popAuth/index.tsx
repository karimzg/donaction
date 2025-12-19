'use client';

import usePopAuth from './usePopAuth';
import GoogleAuth from '@/partials/authentication/googleForm';
import MagicLink from '@/partials/authentication/magicLink/magicLink';
import LoginForm from '@/partials/authentication/loginForm';
import React from 'react';
import './index.scss';
import drawerX from '../../../../../public/images/icons/drawerX.svg';
import Image from 'next/image';
import RegisterForm from '@/partials/authentication/registerForm';

const PopAuth = () => {
	const {
		//
		status,
		isOpen,
		changeForm,
		isLoginForm,
		closePopAuth,
	} = usePopAuth();

	return (
		status === 'unauthenticated' && (
			<div className={`${isOpen ? 'visible' : 'hidden'}`}>
				<div
					className={`popAuth md:w-fit md:h-fit md:rounded-3xl boxBoxShadow p-4 flex flex-col gap-4 items-center justify-center md:max-w-[400px]`}
				>
					<p className='text-3xl mb-6'>{isLoginForm ? 'Se connecter' : 'Créez votre compte'}</p>
					<p className='text-black text-left font-medium'>
						Il existe un compte avec cet email, connectez-vous pour pré-remplir votre don !
					</p>
					<GoogleAuth />
					{/*<MagicLink />*/}
					<div className='w-full flex items-center justify-between'>
						<hr className='w-full border-border' />
						<span className='whitespace-nowrap px-4 text-zinc-400 text-opacity-70'>
							{`${isLoginForm ? 'Connectez-vous' : 'Créez votre compte'} par email`}
						</span>
						<hr className='w-full border-border' />
					</div>
					{isLoginForm ? <LoginForm value={{ email: isOpen }} /> : <></>}
					{/*<div className='w-full flex items-center justify-between md:max-w-[400px]'>*/}
					{/*	<hr className='w-full border-border' />*/}
					{/*	<span className='whitespace-nowrap px-4 text-zinc-400 text-opacity-70'>Ou ?</span>*/}
					{/*	<hr className='w-full border-border' />*/}
					{/*</div>*/}
					{/*<button*/}
					{/*	onClick={changeForm}*/}
					{/*	className={`btn btn-outline-primary flex items-center justify-center gap-2 py-2 px-8 w-full md:max-w-[400px] mb-6`}*/}
					{/*>*/}
					{/*	{isLoginForm ? 'Créez votre compte' : 'Connectez-vous'}*/}
					{/*</button>*/}
				</div>
				<Image className='popAuthX' src={drawerX} alt={'X'} onClick={closePopAuth} />
				<div onClick={closePopAuth} className={'popAuthBackDrop'} />
			</div>
		)
	);
};

export default PopAuth;
