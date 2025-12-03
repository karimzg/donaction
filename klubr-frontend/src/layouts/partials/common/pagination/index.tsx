'use client';
import React, { useState } from 'react';
import { KlubProjet } from '@/core/models/klub-project';
import { Pagination } from '@/core/models/misc';
import { Klub } from '@/core/models/club';
import { getProjets, getProjetsByKlub } from '@/core/services/projet';
import { getAllClubs } from '@/core/services/club';
import PaginatedProjectsList from '@/partials/common/paginatedProjectsList';
import PaginatedKlubsList from '@/partials/common/paginatedKlubsList';
import { sendGaEvent } from '@/core/helpers/sendGaEvent';
import GetClientCookie from '@/core/helpers/getClientCookie';

interface IPagination {
	pagination: Pagination;
	type: 'all_projects' | 'club_projects' | 'all_clubs';
	club?: { uuid: string; slug: string };
}

const Pagination: React.FC<IPagination> = (props) => {
	const [state, setState] = useState<{
		data: Array<KlubProjet | Klub>;
		pagination: Pagination;
	}>({
		data: [],
		pagination: props.pagination,
	});

	const paginate = () => {
		switch (props.type) {
			case 'all_projects':
				sendGaEvent({
					category: 'All Projects',
					label: `Get page: ${(props.pagination.page || props.pagination.currentPage) + 1}`,
				});
				getProjets(
					(props.pagination.page || props.pagination.currentPage) + 1,
					props.pagination.pageSize,
					false,
					!!GetClientCookie('isPreviewMode'),
				).then((res) =>
					setState({
						data: res.data,
						pagination: res.meta.pagination,
					}),
				);
				break;
			case 'club_projects':
				sendGaEvent({
					category: 'Club Projects',
					label: `Get page: ${(props.pagination.page || props.pagination.currentPage) + 1}`,
				});
				getProjetsByKlub(
					props.club?.uuid as string,
					(props.pagination.page || props.pagination.currentPage) + 1,
					props.pagination.pageSize,
				).then((res) => setState(res));
				break;
			case 'all_clubs':
				sendGaEvent({
					category: 'All Clubs',
					label: `Get page: ${(props.pagination.page || props.pagination.currentPage) + 1}`,
				});
				getAllClubs(
					(props.pagination.page || props.pagination.currentPage) + 1,
					props.pagination.pageSize,
					true,
					false,
					!!GetClientCookie('isPreviewMode'),
				).then((res) =>
					setState({
						data: res.data,
						pagination: res.meta.pagination,
					}),
				);
				break;
			default:
				break;
		}
	};

	const getComponent = () => {
		switch (props.type) {
			case 'all_projects':
			case 'club_projects':
				return (
					<PaginatedProjectsList
						pagination={state.pagination}
						data={state.data as KlubProjet[]}
						type={props.type}
					/>
				);
			case 'all_clubs':
				return (
					<PaginatedKlubsList
						data={state.data as Klub[]}
						pagination={state.pagination}
						type={props.type}
					/>
				);
			default:
				return <></>;
		}
	};

	return state.data.length > 0
		? getComponent()
		: Number(state.pagination.page || state.pagination.currentPage) <
				state.pagination.pageCount && (
				<button
					className={'btn btn-primary w-fit self-center mx-auto'}
					style={{ gridColumn: '1/-1' }}
					onClick={paginate}
				>
					Voir plus
				</button>
			);
};

export default Pagination;
