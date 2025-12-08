import React from 'react';
import Image from 'next/image';
import congrats from '../../../../../public/images/icons/congrats.svg';

export default async function Page() {
	return (
		<div className='flex flex-col items-center justify-center gap-16 text-black w-full min-h-[25rem] bg-white z-0 mb-20 mt-10 p-4'>
			<Image className='block mx-auto' src={congrats as string} alt='Félicitations' />
			<div className={'flex flex-col gap-2 items-center h-full'}>
				<h2 className={'text-center text-xl font-semibold'}>
					Votre demande d'inscription de votre club a bien été envoyée !
				</h2>
				<h3 className={'text-center text-md text-[#A0A0A0]'}>
					Veuillez vérifier votre boîte mail pour finaliser la création de votre club. Merci !
				</h3>
			</div>
		</div>
	);
}

// export const revalidate = 3600;
