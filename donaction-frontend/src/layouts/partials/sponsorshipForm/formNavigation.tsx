import React from 'react';
import { ISponsorshipFormConfig } from '@/partials/sponsorshipForm/logic/useSponsorshipForm';
import InputField from '@/partials/sponsorshipForm/steps/components/inputField';
import { previousStepButtonInfo, submitInfo } from '@/partials/sponsorshipForm/logic/consts';
import nextPrevious from '../../../../public/images/icons/nextPrevious.svg';
import Image from 'next/image';

const FormNavigation: React.FC<{
	config: ISponsorshipFormConfig;
	submitForm: (acc: number) => void;
	isLoading: boolean;
}> = ({ config, submitForm, isLoading }) => {
	return (
		<div className='btnContainer flex w-full justify-between items-center mt-4 gap-4 max-[767px]:mt-10'>
			<div className={'max-[480px]:hidden'}>
				<InputField
					key={previousStepButtonInfo(config.stepIndex).name}
					{...previousStepButtonInfo(config.stepIndex)}
					onClick={() => submitForm(-1)}
					className={`btn btn-outline-primary ${previousStepButtonInfo(config.stepIndex).className}`}
				/>
			</div>
			<button
				className={`btn btn-outline py-[13px] px-[18px] rounded-xl flex items-center justify-center content-center border-[1px] border-black  ${(config.stepIndex === 0 || config.stepIndex > 3) && 'hidden'} min-[480px]:hidden`}
				onClick={() => submitForm(-1)}
			>
				<Image className='rotate-180 w-[14px]' src={nextPrevious} alt={'étape précédente'} />
			</button>

			<InputField
				key={submitInfo(config.stepIndex).name}
				{...submitInfo(config.stepIndex)}
				disabled={isLoading}
				onClick={() => submitForm(1)}
				className={`btn btn-primary ${submitInfo(config.stepIndex).className}`}
			/>
		</div>
	);
};

export default FormNavigation;
