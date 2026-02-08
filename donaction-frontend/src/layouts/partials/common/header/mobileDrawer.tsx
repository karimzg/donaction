'use client';
import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import DonactionLogo from '@/components/DonactionLogo';
import Image from 'next/image';
import { FaChevronDown } from 'react-icons/fa';
import settings from '../../../../../public/images/icons/settings.svg';
import myDonations from '../../../../../public/images/icons/myDonations.svg';
import logout from '../../../../../public/images/icons/logout.svg';
import { useAppSelector } from '@/core/store/hooks';
import { selectSession } from '@/core/store/modules/authSlice';
import { NavSlugs } from '@/core/models/club';
import ClientController from '@/partials/common/header/clientController';
import { Session } from 'next-auth';
import { usePathname } from 'next/navigation';

const MobileDrawer: React.FC<{
	slugs?: Array<NavSlugs>;
	txtColor: string;
	serverSession: Session | null;
}> = (props) => {
	const selectedSession = useAppSelector(selectSession);
	const pathName = usePathname();
	const [isOpen, setIsOpen] = useState(false);
	const [state, setState] = useState({
		isProfileOpen: false,
		isKlubsOpen: false,
	});

	const openDrawer = useCallback(() => setIsOpen(true), []);
	const closeDrawer = useCallback(() => setIsOpen(false), []);

	// Close drawer on route change
	useEffect(() => {
		setIsOpen(false);
	}, [pathName]);

	return (
		<>
			{/* Hamburger button */}
			<button
				className={`hamburger lg:hidden ${isOpen ? 'hamburger--open' : ''}`}
				onClick={openDrawer}
				aria-label='Ouvrir le menu'
			>
				<span style={{ backgroundColor: props.txtColor || '#000' }} />
				<span style={{ backgroundColor: props.txtColor || '#000' }} />
				<span style={{ backgroundColor: props.txtColor || '#000' }} />
			</button>

			{/* Backdrop overlay */}
			<div
				className={`mobile-drawer__backdrop ${isOpen ? 'mobile-drawer__backdrop--open' : ''} lg:hidden`}
				onClick={closeDrawer}
			/>

			{/* Drawer */}
			<div
				id='MOBILE_DRAWER'
				className={`mobile-drawer w-full fixed top-0 transition-all flex flex-col justify-between h-dvh overflow-y-auto lg:hidden ${
					isOpen ? 'right-0' : '-right-[100%]'
				}`}
				style={{ zIndex: 9999 }}
			>
				<div className='flex items-center justify-between p-4 border-b'>
					<Link href='/' className='w-[142.25px] flex' onClick={closeDrawer}>
						<DonactionLogo />
					</Link>
					<button
						className={`hamburger hamburger--open`}
						onClick={closeDrawer}
						aria-label='Fermer le menu'
					>
						<span style={{ backgroundColor: '#000' }} />
						<span style={{ backgroundColor: '#000' }} />
						<span style={{ backgroundColor: '#000' }} />
					</button>
				</div>

				{/* Profile section (connected only) */}
				{!!props.serverSession && (
					<>
						<div
							onClick={() => setState((_) => ({ ..._, isProfileOpen: !_.isProfileOpen }))}
							className='p-4 flex flex-row items-center gap-4 justify-between text-black cursor-pointer'
						>
							<div className='flex flex-row items-center gap-4'>
								<ClientController txtColor={props.txtColor} component='USER_DETAIL_DROPDOWN' />
							</div>
							<FaChevronDown
								className={`transition-transform ${state.isProfileOpen ? 'rotate-180' : ''}`}
							/>
						</div>
						<div className={`${state.isProfileOpen ? 'block' : 'hidden'}`}>
							<hr className='w-full' />
							<ClientController txtColor={props.txtColor} component='USER_ADMIN_BTN' />
							<ul className='text-black'>
								<li className='px-4 py-1 mt-2 drawer-nav-item'>
									<Link
										href='/profile'
										className='font-medium text-md flex flex-row items-center gap-4'
										onClick={closeDrawer}
									>
										<div className='p-3 rounded-full bg-[#E4E4E5]'>
											<Image width={20} height={20} src={settings} alt='paramètres' />
										</div>
										<p>Paramètres</p>
									</Link>
								</li>
								<li className='px-4 py-1 drawer-nav-item'>
									<Link
										href='/mes-dons'
										className='font-medium text-md flex flex-row items-center gap-4'
										onClick={closeDrawer}
									>
										<div className='p-3 rounded-full bg-[#E4E4E5]'>
											<Image width={20} height={20} src={myDonations} alt='mes-dons' />
										</div>
										<p>Mes dons</p>
									</Link>
								</li>
								<li className='px-4 py-1 mb-2 drawer-nav-item'>
									<Link
										id='LOGOUT_BTN'
										href='#'
										className='font-medium text-md flex flex-row items-center gap-4'
									>
										<div className='p-3 rounded-full bg-[#E4E4E5]'>
											<Image width={20} height={20} src={logout} alt='logout' />
										</div>
										<p>Se Déconnecter</p>
									</Link>
								</li>
							</ul>
						</div>
					</>
				)}

				<hr className='w-full' />

				{/* Navigation links */}
				<div className='w-full p-4 flex flex-col gap-4 items-start font-semibold text-black justify-start flex-1'>
					{process.env.NEXT_PUBLIC_ENVIRONMENT !== 'prod' && (
						<>
							<div
								className='w-full flex items-center justify-between cursor-pointer drawer-nav-item'
								onClick={() => setState((_) => ({ ..._, isKlubsOpen: !_.isKlubsOpen }))}
							>
								<p>Clubs</p>
								<FaChevronDown
									className={`transition-transform ${state.isKlubsOpen ? 'rotate-180' : ''}`}
								/>
							</div>
							<ul className={`${state.isKlubsOpen ? 'block' : 'hidden'} w-full ml-2 -mt-4`}>
								{props.slugs?.map((slug) => (
									<li className='nav-dropdown-item p-2 drawer-nav-item' key={slug.slug}>
										<Link
											href={`/${slug.slug}`}
											className='text-md flex flex-row items-center gap-4 font-normal'
											onClick={closeDrawer}
										>
											<p>{slug.label}</p>
										</Link>
									</li>
								))}
								<li className='p-2 underline font-normal drawer-nav-item'>
									<Link href='/clubs' onClick={closeDrawer}>
										Voir tous les clubs
									</Link>
								</li>
							</ul>
						</>
					)}
					<Link href='/mecenat' className='drawer-nav-item' onClick={closeDrawer}>
						Mécénat
					</Link>
					<Link href='/contact' className='drawer-nav-item' onClick={closeDrawer}>
						Contactez-nous
					</Link>
				</div>

				{/* Bottom CTAs (disconnected only) */}
				{!props.serverSession && (
					<div className='w-full p-4 flex flex-col gap-3'>
						<Link
							href='/new-club'
							className='header__cta-signup text-center w-full py-3 text-base'
							onClick={closeDrawer}
						>
							S'inscrire gratuitement
						</Link>
						<Link
							href='/connexion'
							className='btn btn-outline-primary text-center w-full'
							onClick={closeDrawer}
						>
							Se connecter
						</Link>
					</div>
				)}

				<div className='bg-gray-100 w-full px-4 py-8 mt-[2vh] flex flex-col items-start'>
					<Link href='/conditions-generales-d-utilisation' onClick={closeDrawer}>
						Conditions générales d'utilisation
					</Link>
				</div>
			</div>
		</>
	);
};

export default MobileDrawer;
