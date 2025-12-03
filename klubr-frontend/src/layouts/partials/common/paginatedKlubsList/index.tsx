import React from 'react';
import { Pagination as IPagination } from '@/core/models/misc';
import Pagination from '@/partials/common/pagination';
import { Klub } from '@/core/models/club';
import ClubCard from '@/partials/clubPage/clubCard';

const PaginatedKlubsList: React.FC<{
	data: Array<Klub>;
	pagination: IPagination;
	type: 'all_clubs';
}> = (props) => {
	return (
		<>
			{props.data.map((club: Klub, index: number) => (
				<ClubCard club={club} key={index} />
			))}
			<Pagination type={props.type} pagination={props.pagination} />
		</>
	);
};

export default PaginatedKlubsList;
