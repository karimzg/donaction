import React from 'react';
import './index.scss';
import { KlubProjet } from '@/core/models/klub-project';
import { KlubrMembre } from '@/core/models/klubr-membre';
import { formatCurrency } from '@/core/helpers/currency/CurrencyHelpers';
import { endOfDay, isAfter } from 'date-fns';
import RichTextBlock from '@/components/RichTextBlock';
import ProjectCardProgress from '@/partials/clubPage/projectCard/projectCardProgress';
import Link from 'next/link';
import ImageHtml from '@/components/media/ImageHtml';
import StatusIndicator from '@/partials/common/statusIndicator';
import TemplateReference from '@/partials/common/templateReference';

const ProjectCard: React.FC<{
	projet: KlubProjet;
	type: 'showcase' | 'select';
	index: number;
	klubSlug?: string;
	klubUuid?: string;
}> = ({ projet, klubSlug, type, index, klubUuid }) => {
	const flexDirection = index % 2 ? 'md:flex-row-reverse' : 'md:flex-row';

	const getAuthorName = (membre?: KlubrMembre) => {
		return membre
			? (membre.prenom ? ` ${membre.prenom}` : '') + (membre.nom ? ` ${membre.nom}` : '')
			: '';
	};
	const getAuthorRole = (membre?: KlubrMembre) => {
		return membre ? (membre.fonction ? `${membre.fonction}` : '') : '';
	};

	const status = isAfter(new Date(), endOfDay(new Date(projet.dateLimiteFinancementProjet)));

	return (
		<div
			className={`projectCardContainer w-full flex gap-6 md:gap-10 md:h-[415px] ${flexDirection} ${type} flex-col rounded-3xl md:p-2`}
		>
			<Link
				href={klubSlug ? `/${klubSlug}/nos-projets/${projet.slug}` : ''}
				className={`w-full md:w-1/2 relative md:scale-x-[1.03] md:scale-y-[1.04]`}
			>
				<ImageHtml
					className={`projectCardContainer__bgImage w-full max-h-full object-cover rounded-3xl relative`}
					width={589}
					height={415}
					src={projet.couverture?.url || ''}
					alt={projet.couverture?.alternativeText || projet.titre}
					namedtransformation={'project_card'}
					nosizes={true}
				/>
				<StatusIndicator
					status={String(projet?.status)}
					uuid={String(projet?.klubr?.uuid || klubUuid)}
					css={String('left-2 top-2')}
				/>
				<TemplateReference
					projet={projet}
					css={String(
						'absolute top-0 right-0 rounded-br-none rounded-bl-3xl rounded-tl-none rounded-tr-3xl',
					)}
				/>
			</Link>
			<div
				className={`projectCardContainer__cardBody flex flex-col justify-start md:w-1/2 w-full bg-white rounded-b-3xl`}
			>
				{(!!projet.klubr_membre || !!projet?.klubr) && (
					<div
						className={`projectCardContainer__cardBody__header flex flex-row justify-between items-center`}
					>
						<div className='flex gap-2 items-center'>
							<ImageHtml
								className={`w-[66px] h-[66px] z-10 ${projet?.klubr_membre ? 'border-[3px] border-white rounded-full object-cover' : 'object-contain'}`}
								width={120}
								height={120}
								src={projet?.klubr_membre?.avatar?.url || projet?.klubr?.logo?.url || ''}
								alt={
									projet?.klubr_membre?.avatar?.alternativeText ||
									projet?.klubr?.logo?.alt ||
									'Avatar donateur'
								}
								namedtransformation={projet?.klubr_membre ? 'avatar' : 'logo'}
								nosizes={true}
							/>
							<div className='flex flex-col items-start justify-center text-sm'>
								<p className='font-semibold'>
									{getAuthorName(projet.klubr_membre) || projet?.klubr?.denomination}
								</p>
								<p>{getAuthorRole(projet.klubr_membre) || projet?.klubr?.sportType}</p>
							</div>
						</div>
						<div className='flex flex-col items-end justify-center text-sm'>
							<p className='font-semibold text-lg'>{formatCurrency(projet.montantAFinancer)}</p>
							<p
								className={`${status ? 'bg-[#5C5C5C26] text-[#5A5A5A]' : 'bg-[#118B3326] text-[#118B33]'} py-1 px-2 rounded-full`}
							>
								{status ? 'Terminé' : 'En Cours'}
							</p>
						</div>
					</div>
				)}
				<div className='flex flex-col gap-4 my-2'>
					<Link href={klubSlug ? `/${klubSlug}/nos-projets/${projet.slug}` : ''}>
						<h3 className='text-h3-md font-bold leading-none'>{projet.titre}</h3>
					</Link>
					<RichTextBlock classCss={'text-sm'} data={projet.descriptionCourte} />
				</div>
				<div className={'mt-auto'}>
					<ProjectCardProgress project={projet} />
				</div>
				<div className='w-full flex flex-col gap-2'>
					<hr className='w-full mt-3 mb-1' />
					<div className='flex gap-2 justify-center md:justify-start flex-wrap'>
						<button
							disabled={status}
							className={`btn btn-primary px-6 py-0 text-center ${status ? 'bg-[#5A5A5A] border-0' : ''}`}
						>
							{status ? (
								<span className='py-[8px] block'>Je soutiens le projet</span>
							) : (
								<Link
									className='w-full block py-[8px]'
									href={
										klubSlug ? `/${klubSlug}/nos-projets/${projet.slug}?PAYEMENT_FORM=true` : ''
									}
								>
									Je soutiens le projet
								</Link>
							)}
						</button>
						<button className='btn btn-outline-primary py-[8px] px-6'>
							<Link href={klubSlug ? `/${klubSlug}/nos-projets/${projet.slug}` : ''}>
								Explorer le projet
							</Link>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProjectCard;
