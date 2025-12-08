'use client';

import React, { useEffect, useState } from 'react';
import useNewClubForm from '@/partials/authentication/newClubForm/useNewClubForm';
import { getIterableFields } from '@/partials/sponsorshipForm/logic/getIterableFields';
import { newClubInfo } from '@/partials/sponsorshipForm/logic/consts';
import InputField from '@/partials/sponsorshipForm/steps/components/inputField';
import { getClubCGU } from '@/core/services/cms';
import RichTextBlock from '@/components/RichTextBlock';
import PopUp from '@/components/popUp';

const NewClubForm: React.FC<{}> = (props) => {
	const { config, submitForm, session, progress, back, isPopUpOpen, controlPopUp } =
		useNewClubForm();
	const actionCgu = (e: MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		controlPopUp();
	};
	const fields = () =>
		getIterableFields(
			newClubInfo(config.defaultValues, CguLabel(actionCgu)),
			config.DEFAULT_FEEDBACK,
			config.triggerValidation,
			config.clearValues,
		);

	const [CGUContent, setCGUContent] = useState<any>({});

	useEffect(() => {
		getClubCGU().then((res) => {
			setCGUContent(res.data.attributes);
		});
	}, []);
	return (
		<div className='w-full h-full flex flex-col items-start gap-4'>
			<div
				className={`progressBar w-[200px] flex justify-between items-center mx-auto mt-4 relative`}
			>
				<span className={`rounded-full bg-[#F7A74F] text-white text-center w-[30px] h-[30px]`}>
					1
				</span>
				<span className={`w-[100px] bg-[#EFF0F6] h-2 rounded-full`} />
				<span
					className={`absolute bg-[#F7A74F] h-2 rounded-full left-[50px]`}
					style={{ width: `${progress}px`, transition: 'width 1s ease-in-out' }}
				/>
				<span
					className={`rounded-full ${progress === 100 ? 'bg-[#F7A74F] text-white' : 'bg-[#EFF0F6] text-[#B1B1B1]'} text-center w-[30px] h-[30px]`}
					style={{ transition: 'background .5s ease-in-out, text-color .5s ease-in-out' }}
				>
					2
				</span>
			</div>
			{config.stepIndex === 0 && (
				<div className='w-full flex flex-wrap gap-y-0 gap-x-[3.5%] mt-6'>
					{fields().slice(0, 5)}
				</div>
			)}
			{config.stepIndex === 1 && (
				<div className='w-full flex flex-wrap gap-y-0 gap-x-[3.5%] mt-6'>
					{fields().slice(5, undefined)}
				</div>
			)}
			<div className={'w-full flex items-center justify-between'}>
				<button
					onClick={back}
					className={`self-end text-md font-medium ${config.stepIndex === 0 ? 'hidden' : ''} cursor-pointer`}
				>
					Étape précédente
				</button>
				<InputField
					{...{
						name: 'submit',
						value: 'Inscrire mon club',
						type: 'submit',
						cast: String,
						className: 'buttonInput',
						parentClassName: 'w-fit ml-auto',
					}}
					onClick={submitForm}
					className={`btn btn-primary w-full py-[8px] mt-4 cursor-pointer`}
				/>
			</div>
			<PopUp isOpen={isPopUpOpen} closePopUp={controlPopUp} title={CGUContent.titre}>
				<div className='flex flex-col items-center justify-center gap-16 text-black w-full min-h-[25rem] bg-white z-0 mb-10'>
					<div className={'md:px-6 flex flex-col items-center justify-center gap-10'}>
						{isPopUpOpen && CGUContent.content && <RichTextBlock data={CGUContent.content} />}
					</div>
				</div>
			</PopUp>
		</div>
	);
};

const CguLabel = (actionCGU: Function) => {
	return (
		<>
			Mon association accepte{' '}
			<span onClick={(e) => actionCGU(e)} className='font-semibold cursor-pointer text-[#F7A74F]'>
				les conditions générales d’utilisation
			</span>
			{'.'}
		</>
	);
};

export default NewClubForm;
