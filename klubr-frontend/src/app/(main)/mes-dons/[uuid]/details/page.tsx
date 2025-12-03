import React from 'react';
import Breadcrumb from '@/partials/common/breadcrumb';
import { getDon } from '@/core/services/don';
import DownloadPdf from '@/partials/common/downloadPdf';
import { format } from 'date-fns';
import frLocale from 'date-fns/locale/fr';
import Link from 'next/link';
import { cookies } from 'next/headers';

export default async function Page({ params }: { params: { uuid: string } }) {
	const result = await getDon(params.uuid, cookies().toString());
	const projectTitle = result?.klub_projet?.titre;
	const linkHref = projectTitle
		? `/${result?.klubr?.slug}/nos-projets/${result?.klub_projet?.slug}`
		: `/${result?.klubr?.slug}`;
	const linkText = projectTitle || result?.klubr?.denomination;

	return (
		<div className='flex flex-col items-center justify-start gap-16 w-full z-0 min-h-[25rem] text-black py-10'>
			<div className={'minMaxWidth px-6 md:px-0'}>
				<div className='p-6 mb-8 bg-[#F8FAFC]'>
					<Breadcrumb params={{ slug: 'mes-dons' }} />
				</div>
				<div className='flex flex-row place-content-between items-start mb-2'>
					<div className='flex flex-col justify-start gap-1 mb-7'>
						<h1 className='font-bold text-[20px]'>
							{projectTitle ? (
								<Link href={linkHref}>
									<p>{linkText}</p>
								</Link>
							) : (
								<Link href={linkHref}>
									<p>{linkText}</p>
								</Link>
							)}
						</h1>
						<p>{result?.klubr?.sportType}</p>
					</div>
					<DownloadPdf
						uuid={params.uuid}
						contributionUuid={result.klub_don_contribution?.uuid}
						withTaxReduction={result.withTaxReduction}
						toggler={
							<button className={'btn btn-primary cursor-pointer z-[-1]'}>Télécharger</button>
						}
						position={'-left-[130px]'}
					></DownloadPdf>
				</div>
				<hr className='my-6 w-full' />
				<div className='grid grid-cols-[1fr_3fr] auto-rows-auto'>
					<p>Club</p>
					<Link href={`/${result?.klubr?.slug}`}>
						<b>
							<div>{result?.klubr?.denomination}</div>
						</b>
					</Link>
					<hr className='col-span-2 my-6 w-full' />
					<p className='flex items-center'>Don</p>
					<b>
						<div>{result?.klub_projet?.titre ? <p>Projet</p> : <p>Club</p>}</div>
					</b>
					<hr className='col-span-2 my-6 w-full' />
					<p>Montant</p>
					<b>
						<div>{result?.montant} €</div>
					</b>
					{result.klub_don_contribution && (
						<>
							<hr className='col-span-2 my-6 w-full' />
							<p>Contribution</p>
							<b>
								<div>{result?.klub_don_contribution?.montant} €</div>
							</b>
						</>
					)}
					<hr className='col-span-2 my-6 w-full' />
					<p>Date</p>
					<b>
						<div>
							{format(new Date(result?.datePaiment), 'dd MMMM yyyy', {
								locale: frLocale,
							})}
						</div>
					</b>
					<hr className='col-span-2 my-6 w-full' />
					<p className='flex items-center'>Status</p>
					<div>{statusBodyTemplate(result?.statusPaiment)}</div>
					<hr className='col-span-2 my-6 w-full' />
				</div>
			</div>
		</div>
	);
}

const statusBodyTemplate = (status: string) => {
	const getStatus = () => {
		switch (status) {
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
			className={'px-4 py-2 rounded-xl text-center whitespace-nowrap max-w-20'}
			style={{ background: getStatus().color }}
		>
			{getStatus().text}
		</p>
	);
};
