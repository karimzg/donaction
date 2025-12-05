'use client';

import React, { useEffect } from 'react';
import RichTextBlock from '@/components/RichTextBlock';
import { differenceInDays, endOfDay, isAfter, isToday } from 'date-fns';
import { formatCurrency } from '@/core/helpers/currency/CurrencyHelpers';
import ProgressBar from '@/components/ProgresBar';
import ShareCta from '@/components/Share';
import { KlubProjet } from '@/core/models/klub-project';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { selectProjectProgress, setProjectProgress } from '@/core/store/modules/projectSlice';
import Link from 'next/link';

interface IMilestone {
	projet: KlubProjet;
}

const Milestone: React.FC<IMilestone> = (props) => {
	const dispatch = useAppDispatch();
	const projectProgress = useAppSelector(selectProjectProgress(props.projet.uuid));

	useEffect(() => {
		!projectProgress &&
			dispatch(
				setProjectProgress({
					uuid: props.projet.uuid,
					nbDons: props.projet.nbDons,
					montantTotalDonations: props.projet.montantTotalDonations,
				}),
			);
	}, []);
	const getPourcent = () =>
		parseInt(
			Math.min(
				(projectProgress?.montantTotalDonations / props.projet.montantAFinancer) * 100,
				100,
			).toFixed(0),
			0,
		);
	// const dateLimite = format(new Date(props.projet.dateLimiteFinancementProjet), 'dd MMMM', {locale: frLocale});
	const dateVariable = new Date(props.projet.dateLimiteFinancementProjet);
	const daysLeft = -differenceInDays(new Date(), endOfDay(dateVariable)) + 1;
	// Calculez la différence en jours
	const getDaysLeft = () => {
		if (daysLeft > 1) {
			return (
				<>
					<span className='font-semibold'>{daysLeft}</span>
					<span>&nbsp;jours restants</span>
				</>
			);
		} else if (isToday(dateVariable)) {
			return (
				<>
					<span className='font-semibold'>Dernier jour!</span>&nbsp;pour soutenir
				</>
			);
		} else {
			return <span className='font-semibold'>Fin de la collecte de dons !</span>;
		}
	};

	return (
		<div className='text-black flex flex-col items-center py-2 gap-2 text-center bg-white rounded-3xl boxBoxShadow w-full'>
			{/*<h1 className='md:text-4xl text-2xl font-semibold'>{props.projet.titre}</h1>*/}
			{/*<RichTextBlock classCss={'text-sm'} data={props.projet.descriptionCourte}/>*/}
			<div className='w-full flex flex-col px-6 gap-1'>
				<div className='flex justify-center md:text-lg text-md'>
					<div>
						<p>{getDaysLeft()}</p>
					</div>
				</div>
				<ProgressBar
					pourcent={getPourcent()}
					montant={formatCurrency(projectProgress?.montantTotalDonations)}
					classCss={'pb-5'}
					isActive={isAfter(
						new Date(),
						endOfDay(new Date(props.projet.dateLimiteFinancementProjet)),
					)}
				></ProgressBar>
				<div className='flex items-start justify-between md:text-lg text-md'>
					<p className='font-semibold text-start md:basis-[40%]'>
						{projectProgress?.nbDons > 0 ? (
							<span>
								<span className='font-semibold'>{projectProgress?.nbDons}</span>
								<span>&nbsp;{`mécène${projectProgress?.nbDons > 1 ? 's' : ''}`}</span>
							</span>
						) : (
							<></>
						)}
					</p>
					<div className='text-end md:basis-[40%] flex flex-col items-end'>
						<p className='font-semibold mb-2'>
							{formatCurrency(projectProgress?.montantTotalDonations)} /{' '}
							{formatCurrency(props.projet.montantAFinancer)}
						</p>
						{/*<div className={'relative'}>*/}
						{/*	<ShareCta*/}
						{/*		size={'small'}*/}
						{/*		align={'right'}*/}
						{/*		text={'Soutenez le projet "' + props.projet.titre + '"'}*/}
						{/*	/>*/}
						{/*</div>*/}
					</div>
				</div>
			</div>
			{/*<Link href='?PAYEMENT_FORM=true' className='btn btn-primary mt-4 py-[10px] px-[30px]'>*/}
			{/*	Je soutiens le Projet*/}
			{/*</Link>*/}
		</div>
	);
};

export default Milestone;
