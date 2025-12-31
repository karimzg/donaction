'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { getDonsByKlubOrProjet } from '@/core/services/don';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatCurrency } from '@/core/helpers/currency/CurrencyHelpers';
import { Tooltip } from 'react-tooltip';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import {
	ISponsorList,
	selectSponsorsList,
	setSponsorsFetchConfig,
	setSponsorsList,
} from '@/core/store/modules/sponsorsSlice';
import LottieAnimation from '@/components/LottieAnimation';
import emptyDonators from 'public/animations/emptyDonators.json';
import { usePathname } from 'next/navigation';

export interface SponsorProject {
	id: number;
	titre: string;
	slug: string;
	montantTotalDonations: number;
	montantAFinancer: number;
}
export interface SponsorItem {
	picture?: any;
	username?: string;
	amount?: number;
	company?: string;
	date?: Date;
	projet?: SponsorProject;
	civility?: 'Monsieur' | 'Madame';
}
interface IOurSponsors {
	uuid: string;
	byKlubOrProject?: 'byKlub' | 'byProject';
	initialData: ISponsorList;
}

const OurSponsors: React.FC<IOurSponsors> = ({ uuid, byKlubOrProject, initialData }) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const dispatch = useAppDispatch();
	const sponsorsList = useAppSelector(selectSponsorsList);
	const pathname = usePathname();

	useEffect(() => {
		dispatch(
			setSponsorsFetchConfig({
				uuid,
				byKlubOrProject: byKlubOrProject || 'byKlub',
			}),
		);
		dispatch(setSponsorsList(initialData));
	}, []);

	useEffect(() => {
		fetchData();
	}, [pathname]);

	const paginate = (acc: 1 | -1) => {
		sponsorsList.pagination.currentPage && fetchData(sponsorsList.pagination.currentPage + acc);
	};

	const fetchData = async (page = 1) => {
		setIsLoading(true);
		try {
			const result = await getDonsByKlubOrProjet(
				uuid,
				byKlubOrProject || 'byKlub',
				page,
				byKlubOrProject === 'byProject' ? 3 : 8,
			);
			dispatch(setSponsorsList(result));
			setTimeout(() => setIsLoading(false), 500);
		} catch (error) {
			console.error('Erreur lors de la récupération des sponsors', error);
		}
	};

	return (
		<div
			className={`ourSponsorsContainer text-black flex flex-col gap-4 w-full items-center md:items-start ${byKlubOrProject === 'byProject'}`}
		>
			<p
				className={`${byKlubOrProject === 'byProject' ? 'text-xl' : 'text-3xl'} ${byKlubOrProject === 'byProject' && !sponsorsList.data?.length && 'hidden'}`}
			>
				Nos mécènes
			</p>
			{sponsorsList.data && !!sponsorsList.data.length ? (
				<>
					<div className='w-full text-md leading-5 flex flex-col gap-2 items-start justify-center'>
						{sponsorsList.data.map((_: any, index: number) =>
							isLoading ? (
								getSkeleton(index, byKlubOrProject === 'byProject')
							) : (
								<div
									key={index}
									className='flex items-center justify-start gap-2'
									{...(_.projet && byKlubOrProject !== 'byProject'
										? { 'data-tooltip-id': 'projet', 'data-tooltip-content': _.projet.titre }
										: {})}
								>
									{getAvatar(_)}
									<div>
										<p>
											{getName(_)} a fait <span className='font-semibold'>{getValue(_)}</span>
										</p>
									</div>

									{_.projet && byKlubOrProject !== 'byProject' && <Tooltip id='projet' />}
								</div>
							),
						)}
					</div>
					<div className='flex gap-2 w-full justify-center mt-auto'>
						{!!sponsorsList.pagination && sponsorsList.pagination.currentPage > 1 && (
							<span
								onClick={() => paginate(-1)}
								className='border-[1px] w-[28px] h-[28px] p-px] flex items-center justify-center border-black rounded-lg text-xl align-baseline self-center cursor-pointer'
							>
								<FontAwesomeIcon icon={faChevronLeft} />
							</span>
						)}
						{!!sponsorsList.pagination &&
							sponsorsList.pagination?.currentPage < sponsorsList.pagination.pageCount && (
								<span
									onClick={() => paginate(1)}
									className='border-[1px] w-[28px] h-[28px] p-px] flex items-center justify-center border-black rounded-lg text-xl align-baseline self-center cursor-pointer'
								>
									<FontAwesomeIcon icon={faChevronRight} />
								</span>
							)}
					</div>
				</>
			) : (
				<div className='ourSponsorsContainer text-black flex flex-col items-center gap-4 w-full h-full'>
					<div
						className={`max-h-[400px] ${byKlubOrProject === 'byProject' ? 'flex lg:max-h-[130px] max-h-[180px]' : ''}`}
					>
						<LottieAnimation animation={emptyDonators} />
					</div>
					<p className='text-xl font-light text-center'>
						{byKlubOrProject === 'byKlub' ? (
							<>
								"Soyez le <span className='font-semibold'>Premier</span> à <br /> nous <br />
								<span className='font-semibold'>soutenir!</span>"
							</>
						) : (
							<>
								"Soyez le <span className='font-semibold'>Premier</span> à <br /> nous
								<span className='font-semibold'> soutenir!</span>"
							</>
						)}
					</p>
				</div>
			)}
		</div>
	);
};

export default OurSponsors;

/**
 *
 * */
const getName = (data: any) => {
	if (data.company) return `${data.company} (${data.username})`;
	if (data.username) return data.username;
	return 'Anonyme';
};

const getValue = (data: any) => {
	let res = 'un don';
	if (data.amount) {
		res += ` de ${formatCurrency(data.amount)}`;
	}
	return res;
};

const getAvatar = (data: SponsorItem) => {
	if (!data.picture && !data.company) {
		return (
			<Image
				className='min-w-[33px] w-[33px] h-[33px] flex items-center justify-center rounded-full overflow-hidden object-contain'
				width={50}
				height={50}
				src={
					data.civility === 'Monsieur'
						? 'https://ik.imagekit.io/donaction/Avatars/Men/man10_4058349b21_4Wp9nTYIvW.svg'
						: 'https://ik.imagekit.io/donaction/Avatars/Women/woman1_3effe1afa7_yF1igwCIeX.svg'
				}
				alt={'mécène'}
			/>
		);
	}
	if (data.picture)
		return (
			<Image
				className='w-[33px] h-[33px] flex items-center justify-center rounded-full overflow-hidden object-contain'
				width={50}
				height={50}
				src={data.picture}
				alt={'mécène'}
			/>
		);
	const initials = (data.company || data.username || 'A').split(' ');
	return (
		<div className='text-sm w-[33px] h-[33px] flex items-center justify-center rounded-full bg-gray-300'>
			{initials.length > 1 ? initials[0][0] + initials[1][0] : initials[0][0]}
		</div>
	);
};

const getSkeleton = (index: number, isProject: boolean = false) => (
	<div key={index} className={`min-w-[200px] w-full`}>
		<div className='animate-pulse flex items-center justify-start gap-2'>
			<div className='rounded-full bg-gray-300 h-[33px] w-[33px]'></div>
			<div className='flex-1 py-1 mx-0 h-[28px]'>
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
