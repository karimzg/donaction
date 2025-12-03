'use client';

import './index.scss';
import React, { useState } from 'react';
import { useSponsorshipForm } from '@/partials/sponsorshipForm/logic/useSponsorshipForm';
import FormBreadcrumb from '@/partials/sponsorshipForm/steps/components/formBreadcrumb';
import { Klub } from '@/core/models/club';
import { KlubProjet } from '@/core/models/klub-project';
import drawerX from '../../../../public/images/icons/drawerX.svg';
import loadingAnimation from '../../../../public/animations/loader.json';
import Image from 'next/image';
import FormBody from '@/partials/sponsorshipForm/formBody';
import FormNavigation from '@/partials/sponsorshipForm/formNavigation';
import FormBanners from '@/partials/sponsorshipForm/formBanners';
import { useAppSelector } from '@/core/store/hooks';
import { selectIsDonationCguShown } from '@/core/store/modules/rootSlice';
import LottieAnimation from '@/components/LottieAnimation';
import BadgeRescritFiscale from '@/partials/sponsorshipForm/badgeRescritFiscale';

interface SponsorshipComponentInterface {
	club: Klub;
	project?: KlubProjet;
	canChooseProject: boolean;
	bg1: string;
	bg2: string;
}

const SponsorshipForm: React.FC<SponsorshipComponentInterface> = (props) => {
	const {
		//
		config,
		slides,
		isLoading,
		submitForm,
		isBeingFilled,
		setIsBeingFilled,
		projectsSlideFeedback,
	} = useSponsorshipForm(props.club, props.canChooseProject, props.project);

	const isCguShown = useAppSelector(selectIsDonationCguShown);

	const [breadcrumbList, setBreadcrumbList] = useState<Array<string | null>>([
		'Don',
		'Informations personelles',
		'Récapitulatif',
		'Paiement',
		config.stepIndex === 4 ? 'Remerciements' : null,
	]);

	return (
		<div className={`sponsorFormParent ${isBeingFilled && 'isBeingFilled'} md:px-0 px-4`}>
			<div
				className={`mainContainer ${isBeingFilled && 'isBeingFilled'} ${!isBeingFilled && 'md:py-6 py-32'} relative rounded-2xl p-4 boxBoxShadow h-full flex flex-col items-center justify-between`}
			>
				{!isCguShown && (
					<>
						<div className={`${isBeingFilled ? 'flex' : 'md:flex hidden'} w-full`}>
							<FormBreadcrumb list={breadcrumbList} index={config.stepIndex} />
						</div>
						<Image
							className='formX'
							src={drawerX}
							alt={'X'}
							onClick={() => setIsBeingFilled(false)}
						/>
					</>
				)}

				{isLoading ? (
					<LottieAnimation animation={loadingAnimation} />
				) : (
					<FormBody
						config={config}
						projectsSlideFeedback={projectsSlideFeedback}
						canChooseProject={props.canChooseProject}
						slides={slides}
					/>
				)}

				{!isCguShown && (
					<FormNavigation config={config} submitForm={submitForm} isLoading={isLoading} />
				)}

				{props.club &&
					!props.project &&
					config.stepIndex === 0 &&
					!!props.club.hasRescritFiscal && <BadgeRescritFiscale color={props.bg1} />}
				<FormBanners
					index={config.stepIndex}
					bg1={props.bg1}
					bg2={props.bg2}
					isBeingFilled={isBeingFilled}
				/>
			</div>
		</div>
	);
};

export default SponsorshipForm;
