'use client';

import { getIterableFields } from '@/partials/sponsorshipForm/logic/getIterableFields';
import React, { useEffect, useState } from 'react';
import { registerInfo } from '@/partials/sponsorshipForm/logic/consts';
import useRegisterForm from '@/partials/authentication/registerForm/useRegisterForm';
import { Avatar } from '@/core/services/entities';
import ImageHtml from '@/components/media/ImageHtml';
import PopUp from '@/components/popUp';
import { getCGU } from '@/core/services/cms';
import RichTextBlock from '@/components/RichTextBlock';

interface IRegisterFormProps {
	avatars: {
		womenAvatars: Array<Avatar>;
		menAvatars: Array<Avatar>;
	};
	value?: { email: string };
	hiddenEmail?: boolean;
}

const RegisterForm: React.FC<IRegisterFormProps> = (props) => {
	const { config, submitForm, avatarError, selectAvatar, isPopUpOpen, controlPopUp } =
		useRegisterForm(props.value);

	const [CGUContent, setCGUContent] = useState<any>({});

	useEffect(() => {
		getCGU().then((res) => {
			setCGUContent(res.data.attributes);
		});
	}, []);

	const acceptCGUConditions = () => {
		return (
			<>
				Je déclare avoir plus de 18 ans et avoir lu, compris et accepté <br />
				<span onClick={() => controlPopUp()} className='font-semibold cursor-pointer'>
					<u>les Conditions Générales d’Utilisation</u>
				</span>{' '}
			</>
		);
	};

	const registerFormIterableFields = getIterableFields(
		registerInfo(config.defaultValues, acceptCGUConditions(), props.hiddenEmail),
		config.DEFAULT_FEEDBACK,
		config.triggerValidation,
	);

	return (
		<div className='flex flex-wrap gap-x-4 gap-y-0 w-full'>
			{registerFormIterableFields.slice(0, 3)}
			{props.avatars && (
				<div className='flex flex-col gap-[4px]'>
					<p className='font-semibold text-sm'>
						Choisir votre avatar{' '}
						<small>
							(Vous pourrez modifier votre avatar par la suite ou y ajouter votre photo)
						</small>
					</p>
					<small className='text-[#FF0000]'>
						{avatarError ? 'Veuillez sélectionner un avatar' : ''}
					</small>
					{props.avatars?.menAvatars && (
						<div className={'grid grid-cols-5 items-center gap-1 w-full'}>
							{props?.avatars?.menAvatars?.map((avatar) => (
								<div onClick={() => selectAvatar(avatar.id)}>
									<ImageHtml
										key={avatar.id}
										src={avatar.url}
										alt={avatar.name}
										className={`aspect-square w-full cursor-pointer ${config.defaultValues.avatar === avatar.id && 'border-2 border-[#00004D]'}`}
										width={100}
										height={100}
									/>
								</div>
							))}
						</div>
					)}
					{props.avatars?.womenAvatars && (
						<div className={'grid grid-cols-5 items-center gap-1 w-full'}>
							{props?.avatars?.womenAvatars?.map((avatar) => (
								<div onClick={() => selectAvatar(avatar.id)}>
									<ImageHtml
										key={avatar.id}
										src={avatar.url}
										alt={avatar.name}
										className={`aspect-square w-full cursor-pointer ${config.defaultValues.avatar === avatar.id && 'border-2 border-[#00004D]'}`}
										width={100}
										height={100}
									/>
								</div>
							))}
						</div>
					)}
				</div>
			)}
			<div className='my-5'>{registerFormIterableFields.slice(3)}</div>
			<PopUp isOpen={isPopUpOpen} closePopUp={controlPopUp} title={CGUContent.titre}>
				<div className='flex flex-col items-center justify-center gap-16 text-black w-full min-h-[25rem] bg-white z-0 mb-10'>
					<div className={'md:px-6 flex flex-col items-center justify-center gap-10'}>
						{isPopUpOpen && CGUContent.content && <RichTextBlock data={CGUContent.content} />}
					</div>
				</div>
			</PopUp>
			<button
				onClick={submitForm}
				className='btn btn-primary valid md:text-center rounded-xl border-black w-full mx-auto mt-2'
			>
				S'inscrire
			</button>
		</div>
	);
};

export default RegisterForm;
