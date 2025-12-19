import React from 'react';
import './index.scss';
import OurSponsors from '@/partials/clubPage/ourSponsors';
import { KlubProjet } from '@/core/models/klub-project';
import { KlubrMembre } from '@/core/models/klubr-membre';
import RichTextBlock from '@/components/RichTextBlock';
import ImageHtml from '@/components/media/ImageHtml';
import { ISponsorList } from '@/core/store/modules/sponsorsSlice';
import ShareCta from '@/components/Share';
import Link from 'next/link';
import Milestone from '@/partials/projectPage/milestone';

interface IProjectDescription {
	projet: KlubProjet;
	ourSponsors: ISponsorList;
}

const ProjectDescription: React.FC<IProjectDescription> = (props) => {
	if (!props.projet) {
		return;
	}
	const getAuthorName = (membre?: KlubrMembre) => {
		return membre ? (membre.prenom && ` ${membre.prenom}`) + (membre.nom && ` ${membre.nom}`) : '';
	};
	const getAuthorRole = (membre?: KlubrMembre) => {
		return membre ? (membre.fonction ? `${membre.fonction}` : '') : '';
	};

	return (
		<div
			className={
				'w-full flex flex-col gap-4 lg:gap-0 lg:flex-row relative mt-4 justify-between px-4 md:p-0 '
			}
		>
			<div className='projectDescription relative lg:absolute lg:bottom-[52%] lg:right-0 bg-white flex flex-col items-start justify-start rounded-3xl boxBoxShadow p-4 lg:w-[65%]'>
				{/* absolute */}
				<div className='flex items-center justify-between relative lg:absolute lg:-top-[80px] lg:right-[0%]'>
					<div className='flex gap-2 items-center lg:flex-row-reverse'>
						<ImageHtml
							className='w-[66px] h-[66px] rounded-full z-10 border-[3px] border-white object-cover'
							width={120}
							height={120}
							src={props.projet?.klubr_membre?.avatar?.url || ''}
							alt={props.projet?.klubr_membre?.avatar?.alternativeText || 'Avatar donateur'}
							namedtransformation={'avatar'}
							nosizes={true}
						/>
						<div className='flex flex-col items-end justify-center text-sm bg-white rounded-xl p-1 '>
							<p className='font-semibold'>{getAuthorName(props.projet.klubr_membre)}</p>
							<p>{getAuthorRole(props.projet.klubr_membre)}</p>
						</div>
					</div>
				</div>
				{/**/}
				<h2 className='md:text-2xl text-xl font-semibold mb-6'>{props.projet.titre}</h2>
				<div className={'lg:max-h-[180px] lg:overflow-y-auto scrollBar'}>
					{props.projet.presentationDescription && (
						<RichTextBlock data={props.projet.presentationDescription} />
					)}
				</div>
				<div className={'flex flex-row flex-wrap gap-2 items-center mt-4'}>
					<Link href='?PAYEMENT_FORM=true' className='btn btn-primary py-[8px] px-[30px]'>
						Je soutiens le Projet
					</Link>
					<div className={'relative'}>
						<ShareCta
							size={'default'}
							align={'right'}
							text={'Soutenez le projet "' + props.projet.titre + '"'}
							mobileHideText={true}
						/>
					</div>
				</div>
			</div>

			<div
				className={
					'lg:w-[33%] border-[1px] border-[#0000002E] p-4 rounded-3xl lg:min-h-[237px] lg:max-h-[237px] overflow-y-auto scrollBar flex'
				}
			>
				<OurSponsors
					uuid={props.projet.uuid}
					byKlubOrProject={'byProject'}
					initialData={props.ourSponsors}
				/>
			</div>

			<div className='lg:w-[65%] flex items-end'>
				<Milestone projet={props.projet} />
			</div>
		</div>
	);
};

export default ProjectDescription;
