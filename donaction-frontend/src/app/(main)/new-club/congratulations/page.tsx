import React from 'react';
import Image from 'next/image';
import congrats from '../../../../../public/images/icons/congrats.svg';

type PageProps = {
	searchParams: Promise<{ clubUuid?: string; emailSent?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
	const { emailSent } = await searchParams;
	const emailFailed = emailSent === 'failed';

	return (
		<div className='flex flex-col items-center justify-center gap-16 text-black w-full min-h-[25rem] bg-white z-0 mb-20 mt-10 p-4'>
			<Image className='block mx-auto' src={congrats as string} alt='Félicitations' />
			<div className={'flex flex-col gap-2 items-center h-full'}>
				<h2 className={'text-center text-xl font-semibold'}>
					Votre demande d'inscription de votre club a bien été envoyée !
				</h2>
				{emailFailed ? (
					<h3 className={'text-center text-md text-[#E57373] font-medium'}>
						L'email de confirmation n'a pas pu être envoyé. Contactez le support sur{' '}
						<a href='mailto:hello@donaction.fr' className='underline'>
							hello@donaction.fr
						</a>{' '}
						pour obtenir le code d'accès à votre club.
					</h3>
				) : (
					<h3 className={'text-center text-md text-[#A0A0A0]'}>
						Veuillez vérifier votre boîte mail pour finaliser la création de votre club. Merci !
					</h3>
				)}
			</div>
		</div>
	);
}

// export const revalidate = 3600;
