import React from 'react';
import { ISponsorshipFormConfig } from '@/partials/sponsorshipForm/logic/useSponsorshipForm';
import { organizationInfo, userInfo } from '@/partials/sponsorshipForm/logic/consts';
import { getIterableFields } from '@/partials/sponsorshipForm/logic/getIterableFields';
import { useAppSelector } from '@/core/store/hooks';
import { selectSession } from '@/core/store/modules/authSlice';
import camera from '../../../../../public/images/icons/camera.svg';
import pen from '../../../../../public/images/icons/pen.svg';
import Image from 'next/image';

const Step2: React.FC<ISponsorshipFormConfig> = (props) => {
	const selectedSession = useAppSelector(selectSession);
	const userInfoFields = getIterableFields(
		userInfo(props.defaultValues, !!selectedSession.data),
		props.DEFAULT_FEEDBACK,
		props.triggerValidation,
		props.clearValues,
	);

	const openFinder = () => {
		const finder = document.createElement('input');
		finder.type = 'file';
		finder.accept = 'image/*';
		finder.click();
		finder.onchange = () => {
			if (finder?.files && finder?.files[0]) {
				props.DEFAULT_FEEDBACK({
					attribute: {
						name: 'logo',
						value: URL.createObjectURL(finder.files[0]),
					},
					cast: String,
					isValid: true,
				});
			}
		};
	};
	return (
		<div className='flex flex-col items-center gap-2 md:m-10 mt-10'>
			<p className='font-semibold text-lg text-center'>Pourquoi saisir ces informations?</p>
			<p className='text-sm text-center'>
				Ces informations sont indispensables pour l'édition de votre reçu fiscal, impératif pour
				récupérer <strong>votre crédit d'impôt</strong>.<br />
				Votre adresse email nous permettra de vous transmettre le reçu.
			</p>

			<div className='flex flex-wrap gap-y-0 gap-x-[3.5%] mt-6'>
				{userInfoFields[0]}

				{props.defaultValues.estOrganisme &&
					getIterableFields(
						organizationInfo(props.defaultValues),
						props.DEFAULT_FEEDBACK,
						props.triggerValidation,
						props.clearValues,
					)}

				{props.defaultValues.estOrganisme ? (
					<>
						{userInfoFields.slice(6)}
						<div>
							<p className='text-sm font-semibold'>Logo de votre société (Facultatif)</p>
							<div
								className='w-[85px] h-[85px] rounded-full bg-black relative flex items-center justify-center my-2 cursor-pointer'
								onClick={openFinder}
							>
								<Image
									className={
										props.defaultValues.logo
											? 'rounded-full object-cover w-[85px] h-[85px]'
											: 'w-[36px] h-[31px] invert object-cover'
									}
									src={props.defaultValues.logo ? props.defaultValues.logo : camera}
									width={85}
									height={85}
									alt={'camera'}
								/>
								<div className='w-[39px] h-[39px] absolute -right-4 -bottom-4 rounded-full bg-[#E4E4E5] flex items-center justify-center'>
									<Image className='w-[18px] h-[18px]' src={pen} alt='pen' />
								</div>
							</div>
						</div>
						<hr className={'w-full my-4'} />
						{userInfoFields.slice(1, 6)}
					</>
				) : (
					userInfoFields.slice(1)
				)}
			</div>
		</div>
	);
};

export default Step2;
