import React from 'react';
import { KlubProjet } from '@/core/models/klub-project';
import ProjectCard from '@/partials/clubPage/projectCard/_index';
import { Pagination as IPagination } from '@/core/models/misc';
import Pagination from '@/partials/common/pagination';

const PaginatedProjectsList: React.FC<{
	data: Array<KlubProjet>;
	pagination: IPagination;
	type: 'all_projects' | 'club_projects' | 'all_clubs';
	club?: { uuid: string; slug: string };
}> = (props) => {
	return (
		<>
			{props.data.map((projet: KlubProjet, index: number) => (
				<ProjectCard
					key={projet.uuid}
					index={index}
					type='showcase'
					projet={projet}
					klubSlug={projet?.klubr?.slug || props.club?.slug}
					klubUuid={projet?.klubr?.uuid || props.club?.uuid}
				/>
			))}
			<Pagination type={props.type} pagination={props.pagination} club={props.club} />
		</>
	);
};

export default PaginatedProjectsList;
