'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import KlubrLogo from '@/components/KlubrLogo';
import Image from 'next/image';
import drawerX from '../../../../../public/images/icons/drawerX.svg';
import { FaChevronDown } from 'react-icons/fa';
import settings from '../../../../../public/images/icons/settings.svg';
import myDonations from '../../../../../public/images/icons/myDonations.svg';
import logout from '../../../../../public/images/icons/logout.svg';
import { useAppSelector } from '@/core/store/hooks';
import { selectSession } from '@/core/store/modules/authSlice';
import { NavSlugs } from '@/core/models/club';
import ClientController from '@/partials/common/header/clientController';
import { Session } from 'next-auth';

const MobileDrawer: React.FC<{
	slugs?: Array<NavSlugs>;
	txtColor: string;
	serverSession: Session | null;
}> = (props) => {
	const selectedSession = useAppSelector(selectSession);
	const [state, setState] = useState({
		isProfileOpen: false,
		isKlubsOpen: false,
	});

	return (
		<>
			<div
				id='MOBILE_DRAWER'
				className='mobile-nav w-full fixed top-0 -right-[100%] bg-white transition-all flex flex-col justify-between h-dvh overflow-y-auto lg:hidden'
			>
				<div className='flex items-center justify-between p-4 border-b'>
					<Link href='/' className={'w-[142.25px] flex'}>
						<KlubrLogo></KlubrLogo>
					</Link>
					<button id={'MOBILE_DRAWER_CLOSER'} aria-label='drawer toggler'>
						<Image src={drawerX} alt={'X'} />
					</button>
				</div>
				{!!props.serverSession && (
					<>
						<div
							onClick={() => setState((_) => ({ ..._, isProfileOpen: !_.isProfileOpen }))}
							className='p-4 flex flex-row items-center gap-4 justify-between text-black'
						>
							<div className={'flex flex-row items-center gap-4'}>
								<ClientController txtColor={props.txtColor} component={'USER_DETAIL_DROPDOWN'} />
							</div>
							<FaChevronDown className={state.isProfileOpen ? 'rotate-180' : ''} />
						</div>
						<div className={`${state.isProfileOpen ? 'block' : 'hidden'}`}>
							<hr className={` w-full`} />
							<ClientController txtColor={props.txtColor} component={'USER_ADMIN_BTN'} />
							<ClientController txtColor={props.txtColor} component={'USER_CLUB_BTN'} />
							<ul className={'text-black'}>
								<li className='px-4 py-1 mt-2'>
									<Link
										href='/profile'
										className='font-medium text-md flex flex-row items-center gap-4'
									>
										<div className='p-3 rounded-full bg-[#E4E4E5]'>
											<Image width={20} height={20} src={settings} alt={'paramètres'} />
										</div>

										<p>Paramètres</p>
									</Link>
								</li>
								<li className='px-4 py-1'>
									<Link
										href='/mes-dons'
										className='font-medium text-md flex flex-row items-center gap-4'
									>
										<div className='p-3 rounded-full bg-[#E4E4E5]'>
											<Image width={20} height={20} src={myDonations} alt={'mes-dons'} />
										</div>

										<p>Mes dons</p>
									</Link>
								</li>
								<li className='px-4 py-1 mb-2'>
									<Link
										id={'LOGOUT_BTN'}
										href='#'
										className='font-medium text-md flex flex-row items-center gap-4'
									>
										<div className='p-3 rounded-full bg-[#E4E4E5]'>
											<Image width={20} height={20} src={logout} alt={'logout'} />
										</div>

										<p>Se Déconnecter</p>
									</Link>
								</li>
							</ul>
						</div>
					</>
				)}
				<hr className='w-full' />
				<div className='w-full p-4 flex flex-col gap-4 items-start font-semibold text-black justify-start flex-1'>
					{process.env.NEXT_PUBLIC_ENVIRONMENT !== 'prod' && (
						<>
							<div
								className='w-full flex items-center justify-between cursor-pointer'
								onClick={() => setState((_) => ({ ..._, isKlubsOpen: !_.isKlubsOpen }))}
							>
								<p>Clubs</p>
								<FaChevronDown className={state.isKlubsOpen ? 'rotate-180' : ''} />
							</div>
							<ul className={`${state.isKlubsOpen ? 'block' : 'hidden'} w-full ml-2 -mt-4`}>
								{props.slugs?.map((slug) => (
									<li className='nav-dropdown-item p-2' key={slug.slug}>
										<Link
											href={`/${slug.slug}`}
											className='text-md flex flex-row items-center gap-4 font-normal'
										>
											<p>{slug.label}</p>
										</Link>
									</li>
								))}
								<li className={'p-2 underline font-normal'}>
									<Link href={`/clubs`}>Voir tous les clubs</Link>
								</li>
							</ul>
						</>
					)}
					<Link href='/mecenat'>Mécénat</Link>
					<Link href='/contact'>Contactez-nous</Link>
				</div>
				{!props.serverSession && (
					<div className='w-full p-4'>
						{process.env.NEXT_PUBLIC_ENVIRONMENT !== 'prod' && (
							<Link
								href={'/new-club'}
								className={`btn text-center w-full mb-4 text-[#F7A74F] border-[1px] border-[#F7A74F]`}
							>
								Inscrire mon Club
							</Link>
						)}
						<Link href={'/admin'} className={`btn btn-outline-primary text-center w-full mb-4`}>
							Mon Espace Club
						</Link>
						<Link href={'/connexion'} className={`btn text-center btn-primary w-full`}>
							Se connecter
						</Link>
					</div>
				)}
				<div className='bg-gray-100 w-full px-4 py-8 mt-[2vh] flex flex-col items-start'>
					<Link href='/conditions-generales-d-utilisation'>Conditions générales d'utilisation</Link>
				</div>
			</div>
		</>
	);
};

export default MobileDrawer;
