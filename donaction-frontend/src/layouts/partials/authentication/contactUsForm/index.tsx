'use client';
import React from 'react';
import InputField from '@/partials/sponsorshipForm/steps/components/inputField';
import { contactUsInfo } from '@/partials/sponsorshipForm/logic/consts';
import { getIterableFields } from '@/partials/sponsorshipForm/logic/getIterableFields';
import useContactUsForm from '@/partials/authentication/contactUsForm/useContactUsForm';
import ImageHtml from "@/components/media/ImageHtml";

interface ContactContent {
	title: string;
	content: string;
	imageUrl: string;
}

const ContactUsForm: React.FC<ContactContent> = ({title, content, imageUrl}) => {
	const {config, submitForm, session} = useContactUsForm();
	return (
		<div className='w-full h-full flex flex-col items-start gap-4'>
			<div className='flex flex-col gap-2'>
				<h1 className='font-bold text-[32px]'>{title ? title : 'title'}</h1>
				<p className='text-md'>
					{content}
				</p>
			</div>
			<ImageHtml className='md:hidden block mx-auto' src={imageUrl} width={427} height={374} alt='contact-us'/>
			<div className='w-full flex flex-col items-center'>
				{getIterableFields(
					contactUsInfo(config.defaultValues, session?.data?.email),
					config.DEFAULT_FEEDBACK,
					config.triggerValidation,
					config.clearValues,
				)}
			</div>
			<InputField
				{...{
					name: 'submit',
					value: 'Envoyer',
					type: 'submit',
					cast: String,
					className: 'buttonInput',
					parentClassName: 'w-full',
				}}
				onClick={submitForm}
				className={`btn btn-primary w-full py-[8px] mt-4`}
			/>
		</div>
	);
};

export default ContactUsForm;
