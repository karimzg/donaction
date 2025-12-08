import React from 'react';
import { KlubProjet } from '@/core/models/klub-project';
import Link from 'next/link';
import ProjectCard from '@/partials/clubPage/projectCard/_index';
import LottieAnimation from '@/components/LottieAnimation';
import emptyProjects from '../../../../../public/animations/emptyProjects.json';
import { Klub } from '@/core/models/club'; // TODO: types

// TODO: types
const PlusProjects: React.FC<{
	projets: { data: Array<KlubProjet> };
	klub?: Klub;
	pageCount?: number;
}> = ({ projets, klub, pageCount }) => {
	const isMixed = !klub;
	const getKlubSlug = (projet?: KlubProjet) => klub?.slug || projet?.klubr?.slug;
	return !!projets?.data.length ? (
		<div className='text-black flex flex-col gap-5 px-6 md:p-0 w-full'>
			<div className='flex flex-col gap-16'>
				{projets.data.map((projet: KlubProjet, index: number) => (
					<ProjectCard
						index={index}
						type='showcase'
						projet={projet}
						klubSlug={getKlubSlug(projet)}
						klubUuid={klub?.uuid}
					/>
				))}
			</div>
			{pageCount && pageCount > 1 && (
				<Link
					href={getKlubSlug() ? `/${getKlubSlug()}/nos-projets` : '/projets'}
					className='self-center btn btn-primary w-fit py-[8px] mt-16'
				>
					Tous nos projets
				</Link>
			)}
		</div>
	) : (
		<div className='w-full flex flex-col items-center gap-6 px-6 md:px-0'>
			<LottieAnimation animation={emptyProjects} />
			<p className='md:text-2xl text-lg text-[#727272] max-w-[584px] text-center'>
				"Pour l'instant, pas de projet en vue, mais <b className='text-black'>restez prêts</b> pour
				ce qui arrive!"
			</p>
		</div>
	);
};

export default PlusProjects;
