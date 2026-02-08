'use client';

import React, { useEffect } from 'react';
import ImageHtml from '@/components/media/ImageHtml';
import { useAppSelector } from '@/core/store/hooks';
import { selectSession } from '@/core/store/modules/authSlice';
import Link from 'next/link';
import Image from 'next/image';
import switchSvg from '../../../../../public/images/icons/switch.svg';
import { VscChevronDown } from 'react-icons/vsc';
import settings from '../../../../../public/images/icons/settings.svg';
import myDonations from '../../../../../public/images/icons/myDonations.svg';
import logout from '../../../../../public/images/icons/logout.svg';
import DropdownList from '@/components/dropdownList';
import { initListeners, removeListeners } from '@/partials/common/header/listeners';

const ClientController: React.FC<{ component: string; txtColor: string }> = (props) => {
	const selectedSession = useAppSelector(selectSession);

	useEffect(() => {
		initListeners();

		return () => {
			removeListeners();
		};
	}, []);


	const getComponent = () => {
		switch (props.component) {
			case 'USER_DETAIL_NAV':
				if (selectedSession.status === 'authenticated') {
					return (
						<>
							<ImageHtml
								src={selectedSession?.data?.avatar?.url || selectedSession?.data?.image || ''}
								loading='lazy'
								decoding='async'
								alt='avatar'
								className='img h-[36px] w-[36px] object-cover rounded-full'
								width={36}
								height={36}
								namedtransformation='avatar'
								nosizes={true}
							/>
						</>
					);
				}
				return (
					<div className='min-w-[150px]'>
						<div className='animate-pulse flex items-center justify-start gap-2'>
							<div className='rounded-full bg-gray-300 h-[36px] w-[36px]'></div>
						</div>
					</div>
				);

			case 'USER_DETAIL_DROPDOWN':
				if (selectedSession.status === 'authenticated') {
					return (
						<>
							<ImageHtml
								src={selectedSession?.data?.avatar?.url || selectedSession?.data?.image || ''}
								loading='lazy'
								decoding='async'
								alt='avatar'
								className='img h-[36px] w-[36px] object-cover rounded-full'
								width={36}
								height={36}
								namedtransformation='avatar'
								nosizes={true}
							/>
							<div className='flex flex-col items-start gap-0'>
								<strong className='font-primary'>{selectedSession?.data?.nom}</strong>
								<p className='text-sm text-gray-500'>{selectedSession?.data?.email}</p>
							</div>
						</>
					);
				}
				return (
					<div className='min-w-[200px]'>
						<div className='animate-pulse flex items-center justify-start gap-2'>
							<div className='rounded-full bg-gray-300 h-[36px] w-[36px]'></div>
							<div className='flex-1 py-1 mx-0'>
								<div className='space-y-3'>
									<div className='grid grid-cols-3 gap-4'>
										<div className='h-2 bg-gray-300 rounded col-span-2'></div>
										<div className='h-2 bg-gray-300 rounded col-span-1'></div>
									</div>
									<div className='h-2 bg-gray-300 rounded'></div>
								</div>
							</div>
						</div>
					</div>
				);

			case 'USER_ADMIN_BTN':
				if (selectedSession.status === 'authenticated') {
					return selectedSession?.data && selectedSession?.data?.klubr_membres?.length > 0 ? (
						<>
							<Link
								href='/admin'
								className='m-2 py-4 rounded-xl font-medium flex items-center justify-center gap-2 bg-[#E4E4E5] text-black'
							>
								<Image src={switchSvg} alt='Mon espace club' />
								<p>Mon Espace Club</p>
							</Link>
							<hr className='w-full' />
						</>
					) : (
						<></>
					);
				}
				return (
					<>
						<div className='min-w-[200px] p-2'>
							<div className='animate-pulse flex items-center justify-start gap-2'>
								<div className='bg-gray-300 rounded-xl w-full h-[60px]'></div>
							</div>
						</div>
						<hr className='w-full' />
					</>
				);

			case 'DESK_DISCONNECTED_BTNS':
				if (selectedSession.status === 'authenticated') {
					return <ClientController component='DESK_CONNECTED_BTNS' txtColor={props.txtColor} />;
				}
				return (
					<div className='flex items-center gap-6'>
						<Link
							href='/connexion'
							className='header__cta-signin stickyHeaderTxtColor'
							style={{ color: props.txtColor }}
						>
							Se connecter
						</Link>
						<Link href='/new-club' className='header__cta-signup'>
							S'inscrire
						</Link>
					</div>
				);

			case 'DESK_CONNECTED_BTNS':
				return (
					<DropdownList
						listPosition='right-0'
						toggler={
							<div className='flex items-center gap-2 text-black cursor-pointer'>
								<ClientController txtColor={props.txtColor} component='USER_DETAIL_NAV' />
								<VscChevronDown
									className='stickyHeaderTxtColor'
									style={{ color: props.txtColor }}
								/>
							</div>
						}
						className='text-black user-dropdown-enter'
					>
						<ul className='p-0 w-[300px]'>
							<div className='p-4 flex flex-row items-center gap-4' id='USER_DETAIL_DROPDOWN'>
								<ClientController txtColor={props.txtColor} component='USER_DETAIL_DROPDOWN' />
							</div>
							<hr className='w-full' />
							<div data-id='USER_ADMIN_BTN'>
								<ClientController txtColor={props.txtColor} component='USER_ADMIN_BTN' />
							</div>
							<li className='px-4 py-1 mt-2'>
								<Link
									href='/profile'
									className='font-medium text-md flex flex-row items-center gap-4'
								>
									<div className='p-3 rounded-full bg-[#E4E4E5]'>
										<Image width={20} height={20} src={settings} alt='paramètres' />
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
										<Image width={20} height={20} src={myDonations} alt='mes-dons' />
									</div>
									<p>Mes dons</p>
								</Link>
							</li>
							<li className='px-4 py-1 mb-2'>
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
					</DropdownList>
				);

			default:
				return <></>;
		}
	};

	return getComponent();
};

export default ClientController;
