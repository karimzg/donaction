import React from 'react';
import IsOrganization from '@/partials/sponsorshipForm/steps/components/isOrganization';
import AmountPicker from '@/partials/sponsorshipForm/steps/components/amountPicker';
import TaxReduction from '@/partials/sponsorshipForm/steps/components/taxReduction';
import { additionalInfo } from '@/partials/sponsorshipForm/logic/consts';
import { ISponsorshipFormConfig } from '@/partials/sponsorshipForm/logic/useSponsorshipForm';
import ImageHtml from '@/components/media/ImageHtml';
import Image from 'next/image';
import att_recu from '../../../../../public/images/icons/att&recu.svg';
import alertIcon from '../../../../../public/images/icons/alert.svg';
import { Tooltip } from 'react-tooltip';
import email from '../../../../../public/images/icons/email.svg';
import userAvatar from '../../../../../public/images/icons/userAvatar.svg';
import resendFiles from '../../../../../public/images/icons/resendFiles.svg';

const Step1: React.FC<ISponsorshipFormConfig> = (props) => {
	return (
		<>
			<div className={'flex flex-col items-center '}>
				<p className={'text-sm text-center'}>
					{props.selectedProject?.titre
						? 'Contribuez au financement du projet'
						: 'Contribuez au développement de'}
				</p>
				<p className={'font-semibold text-lg text-center'}>
					{props.selectedProject?.titre || props?.club?.denomination}
				</p>
				<ImageHtml
					src={props?.club?.logo?.url}
					alt={props?.club?.logo?.alt}
					width={(props?.club?.logo?.width / props?.club?.logo?.height) * 70}
					height={70}
					namedtransformation={'logo'}
					className={'h-[70px] m-2'}
				/>
			</div>
			<div className='flex flex-col items-center md:flex-row gap-4 md:mx-12 my-6 md:self-center md:items-center md:justify-center'>
				<p className='font-semibold text-lg'>Je soutiens en tant que :</p>
				<IsOrganization
					{...{
						...additionalInfo(props.defaultValues).estOrganisme,
						feedback: props.DEFAULT_FEEDBACK,
						triggerValidation: props.triggerValidation,
					}}
				/>
			</div>

			<AmountPicker
				{...{
					...additionalInfo(props.defaultValues).montant,
					feedback: props.DEFAULT_FEEDBACK,
					triggerValidation: props.triggerValidation,
				}}
				selectedProject={props.selectedProject}
			/>

			<TaxReduction {...props} />

			<div className={'flex flex-col items-center gap-1 mt-4'}>
				{/*<Image src={att_recu} alt={'Envoi des justificatifs immédiats'} />*/}
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
		</>
	);
};

export default Step1;
