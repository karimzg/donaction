import React from 'react';
import Footer from '@/partials/common/footer/index';
import Header from '@/partials/common/header/index';
import { getClubsSlugs } from '@/core/services/club';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';

async function MainLayout(props: { children: React.ReactNode }) {
	const slugs = await getClubsSlugs(5, cookies().toString()).catch((error) => {
		console.error('Main Layout : Error fetching clubs slugs', error);
		return [];
	});
	const session = await getServerSession();

	return (
		<div className={'flex flex-col min-h-[100vh] justify-between'}>
			<Header session={session} slugs={slugs} />
			{<main className='flex flex-col items-center'>{props.children}</main>}
			<Footer />
		</div>
	);
}

export default MainLayout;
