import React, { useRef } from 'react';
import './index.scss';
import { ISponsorshipFormConfig } from '@/partials/sponsorshipForm/logic/useSponsorshipForm';
import Link from 'next/link';
import att_recu from '../../../../../../../public/images/icons/att&recu.svg';
import Image from 'next/image';
import { Tooltip } from 'react-tooltip';
import alertIcon from '../../../../../../../public/images/icons/alert.svg';
import email from '../../../../../../../public/images/icons/email.svg';
import userAvatar from '../../../../../../../public/images/icons/userAvatar.svg';
import resendFiles from '../../../../../../../public/images/icons/resendFiles.svg';

const Summary: React.FC<ISponsorshipFormConfig> = (props) => {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const getValue = (value: number) => {
		if (isNaN(value)) return 0;
		return value.toFixed(2).replace(/\.00$/, '');
	};

	return (
		<div className='summaryContainer flex flex-col items-center gap-4'>
			<p
				className={`summaryContainer__title w-full border-black border-[1px] rounded-xl py-2 text-center`}
			>
				Mon récapitulatif
			</p>
			<div className='flex flex-col gap-4 min-w-[50%]'>
				<p className='self-end font-semibold'>Montant</p>
				<div className='flex justify-between items-center gap-10 mx-2'>
					<p>Don</p>
					<p className='font-semibold'>{getValue(Number(props.defaultValues.montant))}&nbsp;€</p>
				</div>
				<div className='w-full h-[2px] bg-black' />
				<div className='flex justify-between items-center gap-10 mx-2 font-semibold'>
					<p>Total</p>
					<p>{getValue(Number(props.defaultValues.montant))}&nbsp;€</p>
				</div>
			</div>
			<div className={'flex flex-col items-center gap-1'}>
				<Image src={att_recu} alt={'Envoi des justificatifs immédiats'} />
				<div className={'flex items-center gap-1'} data-tooltip-id={'Envoi'}>
					<p className='font-semibold'>Envoi des justificatifs immédiats</p>
					<Image width={25} height={25} src={alertIcon} alt={''} />
				</div>
				<Tooltip id='Envoi'>
					<div
						className={
							'min-[767px]:max-w-[50vw] max-[767px]:max-w-[88vw] flex flex-col gap-3 items-center'
						}
					>
						<div className={'w-full flex items-center gap-2'}>
							<Image src={email} alt={'email'} />
							<p>Réception immédiate de vos reçus et attestation par mail.</p>
						</div>
						<hr className={'w-full border-[#808182]'} />
						<div className={'w-full flex items-center gap-2'}>
							<Image src={userAvatar} alt={'email'} />
							<p>Retrouvez à tout instant vos justificatifs dans votre espace. </p>
						</div>
						<hr className={'w-full border-[#808182]'} />
						<div className={'w-full flex items-center gap-2'}>
							<Image src={resendFiles} alt={'email'} />
							<p>Envoi des justificatifs par mail pour rappel avant votre déclaration d'impôt.</p>
						</div>
					</div>
				</Tooltip>
			</div>
			<div className='summaryContainer__description mt-10 text-sm self-start'>
				<p>
					Le fonds de dotation "<b>Fond Klubr</b>" est organisme de mécénat destiné à collecter des
					dons pour le compte d'autres organismes sportifs à but non lucratif, dont "
					<Link href={`/${props.club.slug}`} className='font-semibold'>
						{props.club.denomination}
					</Link>
					" et ainsi les aider à réaliser leurs oeuvres et missions d'intérêt général.
				</p>
			</div>

			{/*<dialog ref={dialogRef}>*/}
			{/*	<p className='title'>Même le paiement en ligne a un coût</p>*/}
			{/*	<p>*/}
			{/*		C’est pour cette raison que nous avons besoin de vous. À quoi sert votre soutien à Klubr ?*/}
			{/*	</p>*/}
			{/*	<ul>*/}
			{/*		<li>*/}
			{/*			<p>*/}
			{/*				En assurant notre fonctionnement, il permet à plus de 200 000 associations d’avoir*/}
			{/*				accès à une solution de paiement adaptée à leurs besoins, sans frais ni commission.*/}
			{/*			</p>*/}
			{/*		</li>*/}
			{/*		<li>*/}
			{/*			<p>*/}
			{/*				Il permet de salarier une équipe de plus de 100 personnes dans laquelle chacun*/}
			{/*				accompagne les associations dans le développement de leurs activités.*/}
			{/*			</p>*/}
			{/*		</li>*/}
			{/*		<li>*/}
			{/*			<p>*/}
			{/*				Il rend possible l’amélioration de nos services d’accompagnement et de nos*/}
			{/*				technologies.*/}
			{/*			</p>*/}
			{/*		</li>*/}
			{/*	</ul>*/}
			{/*	<p className='secondTitle'>Tout cela n’est possible que grâce à votre soutien.</p>*/}
			{/*	<button onClick={() => dialogRef.current?.close()}>Merci, j'ai compris</button>*/}
			{/*</dialog>*/}
		</div>
	);
};

export default Summary;
