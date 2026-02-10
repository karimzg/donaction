'use client';

import React, { useCallback } from 'react';
import ImageHtml from '@/components/media/ImageHtml';
import { useAppSelector } from '@/core/store/hooks';
import { selectSession } from '@/core/store/modules/authSlice';
import Link from 'next/link';
import { VscChevronDown } from 'react-icons/vsc';
import DropdownList from '@/components/dropdownList';
import { signOut } from 'next-auth/react';
import { SettingsIcon, DonationsIcon, LogoutIcon, DashboardIcon } from './icons';
import { getDisplayName, getActiveProfile, ROLE_LABELS, ADMIN_ROLES } from './helpers';

export type HeaderComponent =
	| 'USER_DETAIL_NAV'
	| 'USER_DETAIL_DROPDOWN'
	| 'HEADER_DASHBOARD_BTN'
	| 'DESK_DISCONNECTED_BTNS'
	| 'DESK_CONNECTED_BTNS';

const ClientController: React.FC<{ component: HeaderComponent; txtColor: string }> = (props) => {
	const selectedSession = useAppSelector(selectSession);

	const handleLogout = useCallback(() => {
		signOut();
	}, []);

	const getComponent = () => {
		switch (props.component) {
			case 'USER_DETAIL_NAV':
				if (selectedSession.status === 'authenticated') {
					return (
						<ImageHtml
							src={selectedSession?.data?.avatar?.url || selectedSession?.data?.image || ''}
							loading='lazy'
							decoding='async'
							alt='avatar'
							className='img h-[44px] w-[44px] object-cover rounded-full'
							width={44}
							height={44}
							namedtransformation='avatar'
							nosizes={true}
						/>
					);
				}
				return (
					<div className='animate-pulse'>
						<div className='rounded-full bg-gray-300 h-[44px] w-[44px]' />
					</div>
				);

			case 'USER_DETAIL_DROPDOWN': {
				if (selectedSession.status === 'authenticated') {
					const data = selectedSession?.data;
					const displayName = getDisplayName(data);
					const activeProfile = getActiveProfile(
						data?.klubr_membres,
						data?.last_member_profile_used,
					);
					const roleKey = activeProfile?.role;
					const roleLabel = roleKey ? ROLE_LABELS[roleKey] : null;
					const isAdmin = roleKey ? ADMIN_ROLES.has(roleKey) : false;

					return (
						<>
							<ImageHtml
								src={data?.avatar?.url || data?.image || ''}
								loading='lazy'
								decoding='async'
								alt='avatar'
								className='img h-[44px] w-[44px] object-cover rounded-full flex-shrink-0'
								width={44}
								height={44}
								namedtransformation='avatar'
								nosizes={true}
							/>
							<div className='flex flex-col items-start gap-0.5 min-w-0'>
								<strong className='font-primary text-sm leading-tight truncate max-w-[180px]'>
									{displayName}
								</strong>
								<p className='text-xs text-gray-400 truncate max-w-[180px]'>
									{data?.email}
								</p>
								{roleLabel && (
									<span
										className={`user-dropdown__role-badge ${isAdmin ? 'user-dropdown__role-badge--admin' : ''}`}
									>
										{roleLabel}
									</span>
								)}
							</div>
						</>
					);
				}
				return (
					<div className='min-w-[200px]'>
						<div className='animate-pulse flex items-center justify-start gap-3'>
							<div className='rounded-full bg-gray-300 h-[44px] w-[44px] flex-shrink-0' />
							<div className='flex-1 py-1'>
								<div className='space-y-2'>
									<div className='h-2.5 bg-gray-300 rounded w-3/4' />
									<div className='h-2 bg-gray-300 rounded w-1/2' />
								</div>
							</div>
						</div>
					</div>
				);
			}

			case 'HEADER_DASHBOARD_BTN':
				if (selectedSession.status === 'authenticated' && (selectedSession.data?.klubr_membres?.length ?? 0) > 0) {
					return (
						<Link href='/admin' className='header__cta-dashboard'>
							<DashboardIcon className='w-4 h-4' />
							Mon espace club
						</Link>
					);
				}
				return null;

			case 'DESK_DISCONNECTED_BTNS':
				if (selectedSession.status === 'authenticated') {
					return <ClientController component='DESK_CONNECTED_BTNS' txtColor={props.txtColor} />;
				}
				if (selectedSession.status === 'loading') {
					return (
						<div className='animate-pulse flex items-center gap-2'>
							<div className='rounded-full bg-gray-300 h-[44px] w-[44px]' />
						</div>
					);
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
						variant='user'
						toggler={
							<div className='flex items-center gap-2 text-black cursor-pointer'>
								<ClientController txtColor={props.txtColor} component='USER_DETAIL_NAV' />
								<VscChevronDown
									className='stickyHeaderTxtColor'
									style={{ color: props.txtColor }}
								/>
							</div>
						}
						className='text-black'
					>
						<ul className='p-0 w-[300px] user-dropdown' role='menu'>
							<div className='p-4 flex flex-row items-center gap-3'>
								<ClientController txtColor={props.txtColor} component='USER_DETAIL_DROPDOWN' />
							</div>

							<div className='border-t border-gray-100 mx-3 my-1' />

							<li className='user-dropdown__item' role='menuitem'>
								<Link href='/profile' className='user-dropdown__link'>
									<SettingsIcon className='w-5 h-5 text-gray-500' />
									Paramètres
								</Link>
							</li>
							<li className='user-dropdown__item' role='menuitem'>
								<Link href='/mes-dons' className='user-dropdown__link'>
									<DonationsIcon className='w-5 h-5 text-gray-500' />
									Mes dons
								</Link>
							</li>

							<div className='border-t border-gray-100 mx-3 my-1' />

							<li className='user-dropdown__item user-dropdown__item--logout' role='menuitem'>
								<button
									type='button'
									onClick={handleLogout}
									className='user-dropdown__link w-full text-left'
								>
									<LogoutIcon className='w-5 h-5' />
									Se déconnecter
								</button>
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
