import React from 'react';
import ImageHtml from '@/components/media/ImageHtml';
import Image from 'next/image';
import grayMarker from '../../../../../public/images/icons/grayMarker.svg';
import Link from 'next/link';
import { Klub } from '@/core/models/club';
import StatusIndicator from '@/partials/common/statusIndicator';

const ClubCard: React.FC<{ club: Klub }> = ({ club }) => {
	return (
		<Link
			href={`/${club.slug}`}
			className={
				'flex flex-col gap-4 items-center justify-start  w-full bg-white rounded-3xl py-4 h-full boxBoxShadow'
			}
		>
			<div className={'flex items-center justify-center h-fit relative'}>
				<ImageHtml
					src={club?.logo?.url}
					alt={club?.logo?.alt}
					width={300}
					height={100}
					className={'object-contain max-w-[60%] h-[100px]'}
					namedtransformation={'partner'}
					nosizes={true}
				/>
				<StatusIndicator
					status={String(club?.status)}
					uuid={club?.uuid}
					css={String('text-sm left-2 -top-1')}
				/>
			</div>
			<hr className={'w-full'} />
			<div className={'flex flex-col items-center text-center px-6 flex-1 justify-between'}>
				<div>
					<p className={'font-semibold text-md'}>{club.denomination}</p>
					<div className={'flex flex-col items-center justify-center my-2'}>
						<p className={'text-[#757575] font-semibold'}>
							{club.associationType} - {club.sportType}
						</p>
						<div className={'flex items-center justify-center gap-2'}>
							<Image src={grayMarker} alt={'grayMarker'} width={15} height={15} />
							<p className={'text-[#757575] font-semibold'}>
								{club.siegeSocialCP} - {club.siegeSocialVille}
							</p>
						</div>
					</div>
				</div>
				<div>
					<p className={''}>
						<b>{club.nbProjects || 'Aucun'}</b> Projet
						{club?.nbProjects && club?.nbProjects > 1 ? 's' : ''}
					</p>
				</div>
			</div>
		</Link>
	);
};

export default ClubCard;
