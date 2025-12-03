import React, { useEffect, useRef, useState } from 'react';
import { ISponsorshipFormConfig } from '@/partials/sponsorshipForm/logic/useSponsorshipForm';
import Summary from '@/partials/sponsorshipForm/steps/components/summary';
import { checkboxesInfo } from '@/partials/sponsorshipForm/logic/consts';
import { getIterableFields } from '@/partials/sponsorshipForm/logic/getIterableFields';
import { getDonCGU } from '@/core/services/cms';
import RichTextBlock, { RichTextBlockEl } from '@/components/RichTextBlock';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { selectIsDonationCguShown, setIsDonationCguShown } from '@/core/store/modules/rootSlice';
import LeftArrow from '../../../../../public/images/icons/leftArrow.svg';
import Image from 'next/image';

const Step3: React.FC<ISponsorshipFormConfig> = (props) => {
	const dispatch = useAppDispatch();
	const ref = useRef<HTMLDivElement>(null);
	const [CGU, setCGU] = useState<Array<RichTextBlockEl>>([]);
	const [title, setTitle] = useState<string>('');
	const isCguShown = useAppSelector(selectIsDonationCguShown);

	useEffect(() => {
		getDonCGU().then((res) => {
			if (res?.data?.attributes?.content) {
				setCGU(res.data.attributes.content);
			}
			if (res?.data?.attributes?.titre) {
				setTitle(res.data.attributes.titre);
			}
		});
	}, []);

	const actionCGU = () => {
		dispatch(setIsDonationCguShown(!isCguShown));
	};

	return (
		<div className='md:m-10 mt-10'>
			{isCguShown ? (
				<div className='relative'>
					<Image
						className='absolute cursor-pointer'
						onClick={actionCGU}
						width={30}
						src={LeftArrow}
						alt={'left-arrow'}
					/>
					<p className='font-semibold text-lg text-center mb-4 text-black'> {title} </p>
					<RichTextBlock data={CGU} />
				</div>
			) : (
				<>
					<Summary {...props} />

					<div ref={ref} className='mt-6 text-sm flex flex-col items-start'>
						{getIterableFields(
							checkboxesInfo(props.defaultValues, CguLabel(actionCGU)),
							props.DEFAULT_FEEDBACK,
							props.triggerValidation,
						)}
					</div>
				</>
			)}
		</div>
	);
};

const CguLabel = (actionCGU: Function) => {
	return (
		<>
			J'accepte{' '}
			<span onClick={() => actionCGU()} className='font-semibold cursor-pointer'>
				les Conditions Générales d’Utilisation
			</span>
			{'.'}
		</>
	);
};

export default Step3;
