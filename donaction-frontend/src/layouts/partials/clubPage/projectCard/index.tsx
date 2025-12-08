import React from 'react';
import './index.scss';
import { KlubrMembre } from '@/core/models/klubr-membre';
import RichTextBlock from '@/components/RichTextBlock';
import { KlubProjet } from '@/core/models/klub-project';
import ProjectCardProgress from '@/partials/clubPage/projectCard/projectCardProgress';
import ImageHtml from "@/components/media/ImageHtml";

interface IProjectCard {
	isMinified?: boolean;
	select?: () => void;
	isSelected?: boolean;
	isOnlyChild?: boolean;
	projet: KlubProjet;
}

const ProjectCard: React.FC<IProjectCard> = (props) => {
	const getNameFunction = (membre?: KlubrMembre) => {
		return membre
			? membre.prenom +
					(membre.nom && ` ${membre.nom}`) +
					(membre.fonction && ` - ${membre.fonction}`)
			: '';
	};
	const nameFunction = getNameFunction(props.projet.klubr_membre);

	return (
		<div
			className={`projectCardContainer box-shadow relative flex flex-col items-center justify-center rounded-3xl h-full
			 ${props.isSelected ? `ring-4 ring-[#CECECE] ring-inset pb-0` : ''} ${props.isOnlyChild ? 'md:flex-row mt-4 pb-8': ''}`}
		>
			<ImageHtml
				className={`projectCardContainer__bgImage w-full object-cover ${
					props.isOnlyChild
						? 'md:h-full md:w-[33%] md:rounded-l-3xl md:rounded-tr-none rounded-t-3xl'
						: 'rounded-t-3xl'
				}`}
				width={384}
				height={221}
				mobileWidth={362}
				mobileHeight={208}
				src={props.projet.couverture.url}
				alt={props.projet.couverture.alternativeText || props.projet.titre}
				namedtransformation={'project_little_card'}
				nosizes={true}
			/>
			<div
				className={`relative projectCardContainer__cardBody pt-10 w-full bg-white p-4 flex flex-col justify-between gap-4 h-full ${
					props.isMinified ? 'mt-[-10%]' : ''
				} ${
					props.isOnlyChild
						? 'md:rounded-r-3xl md:rounded-l-none md:mt-0 rounded-3xl mt-[-30px]'
						: 'rounded-3xl mt-[-30px]'
				}`}
			>
				{!!props.projet.klubr_membre && (
					<div
						className={`projectCardContainer__cardBody__header absolute top-[-30px] left-8 flex items-center ${
							props.isOnlyChild ? 'md:-left-8' : ''
						}`}
					>
						<ImageHtml
							className='w-[60px] h-[60px] rounded-full z-10 border-[3px] border-white object-cover'
							width={120}
							height={120}
							src={props.projet.klubr_membre.avatar.url}
							alt={props.projet.klubr_membre.avatar.alternativeText || 'Avatar donateur'}
							namedtransformation={'avatar'}
							nosizes={true}
						/>
						<p className='text-sm bg-gray-300 ml-[-10px] pl-4 pr-6  py-1.5 rounded-lg'>
							<span>
								{props.projet?.klubr_membre?.prenom +
									(props.projet?.klubr_membre?.nom && ` ${props.projet.klubr_membre.nom}`)}
							</span>
							<br />
							<span>
								{props.projet?.klubr_membre?.fonction && props.projet?.klubr_membre?.fonction}
							</span>
						</p>
					</div>
				)}
				<div className='flex flex-col gap-4 md:mt-0 mt-14'>
					<h3 className='text-md font-medium'>{props.projet.titre}</h3>
					{!props.isMinified && (
						<RichTextBlock classCss={'text-sm'} data={props.projet.descriptionCourte} />
					)}
				</div>
				<ProjectCardProgress project={props.projet} />
				{!!props.isMinified && (
					<button
						onClick={props.select}
						disabled={!!props.isSelected}
						className={`btn btn-primary my-4 py-2 ${
							props.isSelected && 'bg-gray-300 text-black border-0'
						}`}
					>
						Je soutiens ce projet
					</button>
				)}
			</div>
		</div>
	);
};

export default ProjectCard;
