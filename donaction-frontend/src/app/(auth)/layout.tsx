import { getClubsSlugs } from '@/core/services/club';
import Header from '@/partials/common/header/index';
import Footer from '@/partials/common/footer';
import React from 'react';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
	const slugs = await getClubsSlugs(5, cookies().toString()).catch((error) => {
		console.error('Auth Layout : Error fetching clubs slugs', error?.config);
		return [];
	});
	const session = await getServerSession();
	return (
		<>
			<Header session={session} slugs={slugs} />
			{<main className='flex flex-col items-center'>{children}</main>}
			<Footer />
		</>
	);
};

export default AuthLayout;
