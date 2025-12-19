'use client';

import React, { useEffect, useState } from 'react';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import eye from '../../../../public/images/icons/eye.svg';
import pen from '../../../../public/images/icons/pen.svg';
import download from '../../../../public/images/icons/download.svg';
import emptyMyDonations from '../../../../public/animations/emptyMyDonations.json';
import Image from 'next/image';
import { IDon } from '@/core/types';
import { format } from 'date-fns';
import frLocale from 'date-fns/locale/fr';
import { formatCurrency } from '@/core/helpers/currency/CurrencyHelpers';
import ImageHtml from '@/components/media/ImageHtml';
import { getMyDonations } from '@/core/services/don';
import LottieAnimation from '@/components/LottieAnimation';
import Link from 'next/link';
import { Paginator, PaginatorPageChangeEvent, PaginatorProps } from 'primereact/paginator';
import './index.scss';
import { useAppSelector } from '@/core/store/hooks';
import { selectSession } from '@/core/store/modules/authSlice';
import loader from '../../../../public/animations/loader.json';
import DownloadPdf from '@/partials/common/downloadPdf';
import { sendGaEvent } from '@/core/helpers/sendGaEvent';

const MyDonations: React.FC<{}> = () => {
	const selectedSession = useAppSelector(selectSession);

	return !!selectedSession.data ? (
		<ClientComponent />
	) : (
		<div className='animate-pulse rounded-xl bg-gray-300 w-full h-[300px]' />
	);
};
const ClientComponent: React.FC<{}> = () => {
	const [loading, setLoading] = useState<boolean>(true);
	const [result, setResult] = useState<{
		data: Array<IDon>;
		primePagination: PaginatorProps;
	}>({
		data: [],
		primePagination: {
			rows: 10,
			first: 0,
			totalRecords: 0,
		},
	});

	useEffect(() => {
		onPageChange({
			page: 0,
			first: 0,
			pageCount: 0,
			rows: 10,
		});
	}, []);

	const onPageChange = (event: PaginatorPageChangeEvent) => {
		sendGaEvent({
			category: 'MyDonations',
			label: `Get page ${event.page + 1}`,
		});
		getMyDonations(event.page + 1)
			.then((res) =>
				setResult({
					data: res.data,
					primePagination: {
						rows: 10,
						first: event.first,
						totalRecords: res.meta.pagination.total,
					},
				}),
			)
			.finally(() => setLoading(false));
	};

	if (loading) {
		return (
			<div className={'w-full flex items-center justify-center'}>
				<LottieAnimation animation={loader} key={'loading'} />
			</div>
		);
	}

	return result.data.length > 0 ? (
		<>
			<DataTable value={result.data || []} showGridlines>
				<Column field='uuid' body={clubBodyTemplate} header='Club' sortable></Column>
				<Column
					field='klub_projet.titre'
					body={projectBodyTemplate}
					header='Projet'
					sortable
				></Column>
				<Column field='montant' body={amountBodyTemplate} header='Montant' sortable></Column>
				<Column field='createdAt' body={dateBodyTemplate} header='Date' sortable></Column>
				<Column
					field='klubDonateur.donateurType'
					body={donateurBodyTemplate}
					header='Donateur'
					sortable
				></Column>
				<Column field='statusPaiment' body={statusBodyTemplate} header='Statut' sortable></Column>
				<Column body={actionsBodyTemplate} header='Action'></Column>
			</DataTable>
			<Paginator
				className={'-mt-40 z-[0] relative'}
				{...result.primePagination}
				onPageChange={onPageChange}
			/>
		</>
	) : (
		<div className={'w-full flex flex-col items-center justify-center'}>
			<LottieAnimation animation={emptyMyDonations} key={'empty'} />
			<p className={'font-semibold text-xl md:text-3xl text-center'}>
				Vous n’avez pas encore fait de don. <br />
				Soutenez un projet
			</p>
			{process.env.NEXT_PUBLIC_ENVIRONMENT !== 'prod' && (
				<Link className={'btn btn-primary mt-10'} href={'/projets'}>
					Voir les projets actuels
				</Link>
			)}
		</div>
	);
};

export default MyDonations;

const clubBodyTemplate = (row: IDon) => {
	return (
		<Link href={`/${row?.klubr?.slug}`} className={'flex gap-4 items-center justify-start'}>
			<ImageHtml
				src={row.klubr?.logo?.url}
				alt={row?.klubr?.logo?.alt}
				width={50}
				height={50}
				className={'rounded-full w-[50px] h-[50px] object-cover'}
			/>
			<p className={'max-w-[200px] ellipsis'}>{row?.klubr?.denomination}</p>
		</Link>
	);
};

const donateurBodyTemplate = (row: IDon) => {
	const session = useAppSelector(selectSession);
	const getData = () => {
		if (row.estOrganisme) {
			return {
				url: row?.klubDonateur?.logo?.url || '',
				alt: row?.klubDonateur?.raisonSocial || '',
				name: row?.klubDonateur?.raisonSocial || 'Entreprise',
			};
		}
		if (row.klubDonateur.avatar) {
			return {
				url: row?.klubDonateur?.avatar.url || '',
				alt: row?.klubDonateur?.prenom || '',
				name: `${row?.klubDonateur?.prenom} ${row?.klubDonateur?.nom}`,
			};
		}
		return {
			url: session?.data?.avatar?.url || session?.data?.image || '',
			alt: session?.data?.avatar?.alternativeText || row.klubDonateur.prenom || '',
			name: `${row?.klubDonateur?.prenom} ${row?.klubDonateur?.nom}`,
		};
	};
	return (
		<div className={'flex gap-4 items-center justify-start relative'}>
			<ImageHtml
				src={getData().url}
				alt={getData().alt}
				width={50}
				height={50}
				className={'rounded-full w-[50px] h-[50px] object-cover'}
			/>
			<p className={'max-w-[200px] ellipsis'}>{getData().name}</p>
			<div
				className={`${row?.estOrganisme ? 'visible' : 'hidden'} absolute right-0 top-0 text-[10px] px-[4px] py-[0px] bg-[#EA580C] text-white rounded-[4px]`}
			>
				PRO
			</div>
		</div>
	);
};

const dateBodyTemplate = (row: IDon) => {
	return (
		<p className={'max-w-[200px] ellipsis'}>
			{format(new Date(row.createdAt), 'dd MMMM yyyy', {
				locale: frLocale,
			})}
		</p>
	);
};

const amountBodyTemplate = (row: IDon) => {
	return <p className={'max-w-[200px] ellipsis'}>{formatCurrency(row.montant || 0)}</p>;
};

const projectBodyTemplate = (row: IDon) => {
	return !!row?.klub_projet ? (
		<Link
			className={'max-w-[200px] ellipsis'}
			href={`/${row.klubr.slug}/nos-projets/${row.klub_projet.slug}`}
		>
			{row.klub_projet?.titre}{' '}
		</Link>
	) : (
		<p className={'max-w-[200px] ellipsis'}>Don pour le club</p>
	);
};

const statusBodyTemplate = (row: IDon) => {
	const getStatus = () => {
		switch (row.statusPaiment) {
			case 'notDone':
				return { text: 'Non soumis', color: '#D8B4FE' };
			case 'pending':
				return { text: 'En cours', color: '#FDBA74' };
			case 'success':
				return { text: 'Payé', color: '#86EFAC' };
			case 'error':
				return { text: 'Erreur', color: '#FCA5A5' };
			default:
				return { text: '', color: '' };
		}
	};

	return (
		<p
			className={'px-4 py-2 rounded-xl text-center whitespace-nowrap'}
			style={{ background: getStatus().color }}
		>
			{getStatus().text}
		</p>
	);
};

const actionsBodyTemplate = (row: IDon) => {
	const getEditLink = () => {
		let url = '/';
		if (row?.klubr?.slug) {
			url += row?.klubr?.slug + '/';
			if (row?.klub_projet?.slug) {
				url += 'nos-projets/' + row?.klub_projet?.slug;
			}
		}
		return url + `?PAYEMENT_FORM=true&DON_UUID=${row?.uuid}`;
	};

	const GA = () => {
		sendGaEvent({
			category: 'Donations',
			label: `Edit unfinished donation (${row.uuid})`,
		});
	};

	return (
		<div className={'flex gap-4 items-center justify-center'}>
			{row.statusPaiment === 'success' ? (
				<>
					<DownloadPdf
						uuid={row.uuid}
						contributionUuid={row.klub_don_contribution?.uuid}
						withTaxReduction={row.withTaxReduction}
						toggler={
							<Image className={'cursor-pointer z-[-1]'} src={download} alt={'télécharger'} />
						}
						position={'-left-[250px]'}
					></DownloadPdf>
					<Link href={`mes-dons/${row.uuid}/details`}>
						<Image className={'cursor-pointer'} src={eye} alt={'afficher'} />
					</Link>
				</>
			) : (
				<Link onClick={GA} href={getEditLink()}>
					<Image className={'cursor-pointer'} src={pen} alt={'Continuer'} />
				</Link>
			)}
		</div>
	);
};
