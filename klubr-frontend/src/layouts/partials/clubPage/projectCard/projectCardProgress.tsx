'use client';

import { formatCurrency } from '@/core/helpers/currency/CurrencyHelpers';
import ProgressBar from '@/components/ProgresBar';
import React, { useEffect } from 'react';
import { endOfDay, format, isAfter } from 'date-fns';
import frLocale from 'date-fns/locale/fr';
import { KlubProjet } from '@/core/models/klub-project';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { selectProjectProgress, setProjectProgress } from '@/core/store/modules/projectSlice';

const ProjectCardProgress: React.FC<{ project: KlubProjet }> = ({ project }) => {
	const dispatch = useAppDispatch();
	const projectProgress = useAppSelector(selectProjectProgress(project.uuid));
	useEffect(() => {
		!projectProgress &&
			dispatch(
				setProjectProgress({
					uuid: project.uuid,
					montantTotalDonations: project.montantTotalDonations,
					nbDons: project.nbDons,
				}),
			);
	}, []);
	const getPourcent = () =>
		parseInt(
			Math.min(
				(projectProgress?.montantTotalDonations / project.montantAFinancer) * 100,
				100,
			).toFixed(0),
			0,
		);
	const dateLimite = format(new Date(project.dateLimiteFinancementProjet), 'dd MMMM yyyy', {
		locale: frLocale,
	});

	const status = isAfter(new Date(), endOfDay(new Date(project.dateLimiteFinancementProjet)));

	return (
		<div className='projectCardContainer__cardBody__progress'>
			<div className='flex justify-between items-center text-md font-bold text-[#5A5A5A]'>
				<p>
					{formatCurrency(projectProgress?.montantTotalDonations)}
					{project.nbDons > 0 ? (
						<span className='text-sm font-light pl-1'>
							(<span className='font-bold'>{project.nbDons || '0'}</span>{' '}
							{`mécène${project.nbDons > 1 ? 's' : ''}`})
						</span>
					) : (
						<></>
					)}
				</p>
				<p>{dateLimite}</p>
			</div>
			<ProgressBar
				pourcent={getPourcent()}
				montant={formatCurrency(projectProgress?.montantTotalDonations)}
				classCss={'pb-5'}
				isActive={!status}
			></ProgressBar>
		</div>
	);
};

export default ProjectCardProgress;
