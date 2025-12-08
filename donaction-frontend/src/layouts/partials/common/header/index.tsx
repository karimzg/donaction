import React from 'react';
import { NavSlugs } from '@/core/models/club';
import KlubrLogo from '@/components/KlubrLogo';
import Link from 'next/link';
import DropdownList from '@/components/dropdownList';
import { VscChevronDown } from 'react-icons/vsc';
import { Session } from 'next-auth';
import ClientController from '@/partials/common/header/clientController';
import PreviewMode from '@/partials/common/previewMode';
import MobileDrawer from '@/partials/common/header/mobileDrawer';
import UseSticky from '@/partials/common/header/sticky';

interface IHeader {
	bg1?: string;
	bg2?: string;
	txtColor?: string;
	session: Session | null;
	slugs?: Array<NavSlugs>;
}

const Header: React.FC<IHeader> = (props) => {
	return (
		<>
			<header id={'HEADER_TAG'} className='w-full z-50'>
				<ClientController txtColor={props.txtColor || '#000'} component={'INIT'} />
				<nav
					className={
						'p-4 w-full flex flex-row items-center justify-between xl:max-w-screen-xl lg:max-w-screen-lg md:max-w-screen-md max-w-screen-sm mx-auto'
					}
				>
					<Link href='/' className={'w-[142.25px] md:w-[185px] flex'}>
						<KlubrLogo></KlubrLogo>
					</Link>
					<PreviewMode session={props.session} />

					<button id={'MOBILE_DRAWER_OPENER'} className='lg:hidden' aria-label='drawer toggler'>
						<svg
							width='23'
							height='18'
							viewBox='0 0 23 18'
							fill='none'
							className={'stickyHeaderTxtColor'}
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								d='M2 2H21'
								stroke={props.txtColor || '#FFFFFF'}
								strokeWidth='3'
								strokeLinecap='round'
							/>
							<path
								d='M2 9H21'
								stroke={props.txtColor || '#FFFFFF'}
								strokeWidth='3'
								strokeLinecap='round'
							/>
							<path
								d='M2 16H21'
								stroke={props.txtColor || '#FFFFFF'}
								strokeWidth='3'
								strokeLinecap='round'
							/>
						</svg>
					</button>

					<div className={'w-full flex-row items-center justify-between lg:flex hidden'}>
						<ul className={'ml-10 flex items-center gap-10'}>
							<li>
								<Link
									href='/mecenat'
									className='stickyHeaderTxtColor'
									style={{ color: props.txtColor || '#000' }}
								>
									Le mécénat
								</Link>
							</li>
							{!!props?.slugs &&
								props?.slugs.length > 0 &&
								process.env.NEXT_PUBLIC_ENVIRONMENT !== 'prod' && (
									<li>
										<DropdownList
											className={'text-black'}
											toggler={
												<span
													className='inline-flex items-center cursor-pointer stickyHeaderTxtColor'
													style={{ color: props.txtColor || '#000' }}
												>
													Clubs
													<VscChevronDown />
												</span>
											}
										>
											<ul className='min-w-[250px] p-4'>
												{props?.slugs.map((slug, index) => (
													<li key={index}>
														<Link href={`/${slug.slug}`} className={'block p-2'}>
															{slug.label}
														</Link>
													</li>
												))}
												<li>
													<Link href={`/clubs`} className={'block p-2 underline'}>
														Voir tous les Clubs
													</Link>
												</li>
											</ul>
										</DropdownList>
									</li>
								)}
							<li>
								<Link
									href='/contact'
									className={'stickyHeaderTxtColor'}
									style={{ color: props.txtColor || '#000' }}
								>
									Contact
								</Link>
							</li>
						</ul>

						{!!props.session ? (
							<ClientController
								component={'DESK_CONNECTED_BTNS'}
								txtColor={props.txtColor || '#000'}
							/>
						) : (
							<ClientController
								component={'DESK_DISCONNECTED_BTNS'}
								txtColor={props.txtColor || '#000'}
							/>
						)}
					</div>
				</nav>
				<MobileDrawer
					serverSession={props.session}
					slugs={props.slugs}
					txtColor={props.txtColor || '#000'}
				/>
			</header>
			{props.bg1 ? (
				<div
					className={`w-full min-h-[300px] absolute top-16 left-0`}
					style={{
						clipPath: 'polygon(0 0, 100% 0, 100% 70%, 51% 100%, 0 70%)',
						backgroundColor: props.bg1,
					}}
				/>
			) : (
				<></>
			)}
			{props.bg2 ? (
				<div
					className={`w-full min-h-[300px] absolute top-0 left-0`}
					style={{
						clipPath: 'polygon(0 0, 100% 0, 100% 70%, 51% 100%, 0 70%)',
						backgroundColor: props.bg2,
					}}
				/>
			) : (
				<></>
			)}

			<UseSticky />
		</>
	);
};

export default Header;
