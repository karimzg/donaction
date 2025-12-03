import { getClubsSlugs } from '@/core/services/club';
import Header from '@/partials/common/header/index';
import Footer from '@/partials/common/footer';
import React from 'react';
import LottieAnimation from '@/components/LottieAnimation';
import forbidden403 from '../../../public/animations/403.json';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import {cookies} from "next/headers";

export default async function page() {
	const slugs = await getClubsSlugs(5, cookies().toString()).catch((error) => {
		console.error('Page NotFound : Error fetching clubs slugs', error?.config);
		return [];
	});
	const primaryColor = '#FFFFFF';
	const secondaryColor = '#000000';
	const headerTextColor = '#000000';

	const session = await getServerSession();
	return (
		<>
			<Header
				session={session}
				slugs={slugs}
				bg1={secondaryColor}
				bg2={primaryColor}
				txtColor={headerTextColor}
			/>
			<main className='flex flex-col items-center w-full min-h-[25rem] bg-white z-0 mb-20'>
				<div className={'mx-4 max-w-[300px]'}>
					<LottieAnimation animation={forbidden403} />
				</div>
				<h1 className='font-bold text-[70px] text-black leading-normal mx-4'>Oops !</h1>
				<p className='text-xl mx-4 text-center'>Vous n'êtes pas autorisé à accéder à cette page</p>
				<Link href='/' className='btn btn-primary mt-10 mx-4'>
					Retour à la page d'accueil
				</Link>
			</main>
			<Footer bg1={secondaryColor} bg2={primaryColor} />
		</>
	);
}
