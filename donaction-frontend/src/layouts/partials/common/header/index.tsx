import React from 'react';
import { NavSlugs } from '@/core/models/club';
import DonactionLogo from '@/components/DonactionLogo';
import Link from 'next/link';
import DropdownList from '@/components/dropdownList';
import { VscChevronDown } from 'react-icons/vsc';
import { Session } from 'next-auth';
import ClientController from '@/partials/common/header/clientController';
import PreviewMode from '@/partials/common/previewMode';
import MobileDrawer from '@/partials/common/header/mobileDrawer';
import UseSticky from '@/partials/common/header/sticky';
import { SHOW_CLUBS_NAV } from '@/core/helpers/featureFlags';
import './index.scss';

interface IHeader {
	session: Session | null;
	slugs?: Array<NavSlugs>;
	clubColors?: {
		primary: string;
		secondary: string;
		headerText: string;
	};
}

const Header: React.FC<IHeader> = (props) => {
	const isClubPage = !!props.clubColors;

	/* Club primary used ONLY for accent elements (underline, bar) — text stays dark */
	const clubStyle = isClubPage
		? ({
				'--club-primary': props.clubColors!.primary,
				'--club-secondary': props.clubColors!.secondary,
			} as React.CSSProperties)
		: undefined;

	return (
		<>
			<header
				id='HEADER_TAG'
				className={`header w-full z-50 ${isClubPage ? 'header--club' : ''}`}
				style={clubStyle}
			>
				{isClubPage && <div className='header__accent-bar w-full' />}

				<nav className='p-4 w-full flex flex-row items-center justify-between xl:max-w-screen-xl lg:max-w-screen-lg md:max-w-screen-md max-w-screen-sm mx-auto'>
					<Link href='/' className='w-[142.25px] md:w-[160px] flex'>
						<DonactionLogo />
					</Link>

					<PreviewMode session={props.session} />

					<MobileDrawer
						serverSession={props.session}
						slugs={props.slugs}
						txtColor='#000'
					/>

					<div className='w-full flex-row items-center justify-between lg:flex hidden'>
						<ul className='ml-10 flex items-center gap-10'>
							<li>
								<Link
									href='/mecenat'
									className='header__nav-link stickyHeaderTxtColor text-black'
								>
									Le mécénat
								</Link>
							</li>
							{!!props?.slugs &&
								props.slugs.length > 0 &&
								SHOW_CLUBS_NAV && (
									<li>
										<DropdownList
											className='text-black'
											variant='glass'
											toggler={
												<span className='inline-flex items-center cursor-pointer header__nav-link stickyHeaderTxtColor text-black'>
													Clubs
													<VscChevronDown className='ml-1 dropdown-chevron transition-transform duration-200' />
												</span>
											}
										>
											<div className='dropdown-glass__inner'>
												<div className='dropdown-glass__items'>
													{props.slugs.map((slug, index) => (
														<Link
															key={index}
															href={`/${slug.slug}`}
															className='dropdown-glass-item'
														>
															{slug.label}
														</Link>
													))}
												</div>
												<span className='dropdown-glass__divider' />
												<Link href='/clubs' className='dropdown-glass-cta'>
													Voir tous les clubs
													<span aria-hidden='true'>→</span>
												</Link>
											</div>
										</DropdownList>
									</li>
								)}
							<li>
								<Link
									href='/contact'
									className='header__nav-link stickyHeaderTxtColor text-black'
								>
									Contact
								</Link>
							</li>
						</ul>

						{!!props.session ? (
							<ClientController component='DESK_CONNECTED_BTNS' txtColor='#000' />
						) : (
							<ClientController component='DESK_DISCONNECTED_BTNS' txtColor='#000' />
						)}
					</div>
				</nav>
			</header>

			<UseSticky />
		</>
	);
};

export default Header;
