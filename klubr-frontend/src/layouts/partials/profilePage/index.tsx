'use client';
import React from 'react';
import Image from 'next/image';
import penSvg from '../../../../public/images/icons/pen.svg';
import cameraSvg from '../../../../public/images/icons/camera.svg';
import userSvg from '../../../../public/images/icons/user.svg';
import { getIterableFields } from '@/partials/sponsorshipForm/logic/getIterableFields';
import { profileInfo, profilePasswords } from '@/partials/sponsorshipForm/logic/consts';
import useProfileForm, { IProfilePage } from '@/partials/profilePage/useProfileForm';
import PopUp from '@/components/popUp';
import ImageHtml from '@/components/media/ImageHtml';
import DropdownList from '@/components/dropdownList';
import SpinnerButton from '@/components/spinnerButton';
import { useAppSelector } from '@/core/store/hooks';
import { selectSession } from '@/core/store/modules/authSlice';

const ProfilePage: React.FC<IProfilePage> = (props) => {
	const selectedSession = useAppSelector(selectSession);

	return !!selectedSession.data ? (
		<ClientComponent {...props} />
	) : (
		<div className='animate-pulse minMaxWidth flex flex-col gap-6 items-start px-6 md:px-0'>
			<div className='flex flex-row items-center justify-between w-full'>
				<div className=' flex items-center justify-start gap-6'>
					<div className='rounded-full bg-gray-300 md:w-[117px] w-[75px] md:h-[117px] h-[75px]'></div>
					<div className='flex-1 py-1 mx-0 w-[200px]'>
						<div className='space-y-3'>
							<div className='grid grid-cols-3 gap-4'>
								<div className='h-2 bg-gray-300 rounded col-span-2'></div>
								<div className='h-2 bg-gray-300 rounded col-span-1'></div>
							</div>
							<div className='h-2 bg-gray-300 rounded'></div>
						</div>
					</div>
				</div>
				<div className={'bg-gray-300 rounded-xl h-[52px] min-w-[200px] md:flex hidden'}></div>
			</div>
			<hr className='w-full' />
			<div className='flex flex-col items-start gap-6 w-full'>
				<h1 className='font-semibold md:text-3xl text-xl bg-gray-300 rounded-xl min-w-[200px] h-[30px]'>
					&nbsp;
				</h1>
				<div className='flex flex-wrap justify-between items-center w-full bg-gray-300 rounded-xl h-[175px]'></div>
			</div>
			<div
				className={
					'bg-gray-300 rounded-xl h-[52px] min-w-[200px] md:hidden flex sm:w-fit w-full self-end'
				}
			/>
		</div>
	);
};

const ClientComponent: React.FC<IProfilePage> = (props) => {
	const {
		session,
		isLoading,
		avatarList,
		tempAvatar,
		saveAvatar,
		openFinder,
		submitForm,
		isPopUpOpen,
		controlPopUp,
		setTempAvatar,
		selectedImage,
		infoFormConfig,
		passwordsFormConfig,
	} = useProfileForm(props);

	return (
		<div className='minMaxWidth flex flex-col gap-6 items-start px-6 md:px-0'>
			<div className='flex flex-row items-center justify-between w-full'>
				<div className='flex flex-row items-center gap-6'>
					<div className='relative'>
						<ImageHtml
							width={117}
							height={117}
							className='aspect-square rounded-full object-cover md:w-[117px] w-[75px]'
							src={selectedImage.url || ''}
							alt='photo de profile'
							namedtransformation={'avatar_big'}
							nosizes={true}
						/>
						<div className='absolute bottom-0 right-0 p-2 bg-[#E4E4E5] rounded-full cursor-pointer'>
							<DropdownList
								toggler={<Image width={18} height={19} src={penSvg as string} alt='edit' />}
								listPosition={'left'}
							>
								<ul className='p-0 w-max'>
									<li className='px-4 py-1 mt-2' onClick={openFinder}>
										<div className='font-medium text-md flex flex-row items-center gap-4'>
											<div className='p-3 rounded-full bg-[#E4E4E5]'>
												<Image width={20} height={16} src={cameraSvg as string} alt={'photo'} />
											</div>

											<p>Importer une photo</p>
										</div>
									</li>
									<li className='px-4 py-1 mb-2' onClick={controlPopUp}>
										<div className='font-medium text-md flex flex-row items-center gap-4'>
											<div className='p-3 rounded-full bg-[#E4E4E5]'>
												<Image width={20} height={19} src={userSvg as string} alt={'avatar'} />
											</div>

											<p>Choisir un avatar</p>
										</div>
									</li>
								</ul>
							</DropdownList>
						</div>
					</div>
					<div className='flex flex-col items-start gap-0'>
						<strong className='font-primary'>{session?.data?.nom}</strong>
						<p>{session?.data?.email}</p>
					</div>
				</div>
				<SpinnerButton className={'md:flex hidden'} isLoading={isLoading} onClick={submitForm}>
					Enregistrer les modifications
				</SpinnerButton>
			</div>
			<hr className='w-full' />
			<div className='flex flex-col items-start gap-6 w-full'>
				<h1 className='font-semibold md:text-3xl text-xl'>Informations Personnelles</h1>
				<div className='flex flex-wrap justify-between items-center w-full'>
					{getIterableFields(
						profileInfo(infoFormConfig.defaultValues),
						infoFormConfig.DEFAULT_FEEDBACK,
						infoFormConfig.triggerValidation,
					)}
				</div>
			</div>
			{session?.data?.provider === 'local' && (
				<>
					<hr className='w-full' />
					<div className='flex flex-col items-start gap-6 w-full'>
						<h1 className='font-semibold md:text-3xl text-xl'>Modifier votre mot de passe</h1>
						<div className='flex flex-wrap justify-between items-center w-full'>
							{getIterableFields(
								profilePasswords(passwordsFormConfig.defaultValues),
								passwordsFormConfig.DEFAULT_FEEDBACK,
								passwordsFormConfig.triggerValidation,
								passwordsFormConfig.clearValues,
							)}
						</div>
					</div>
				</>
			)}
			<SpinnerButton
				className={'md:hidden flex sm:w-fit w-full self-end'}
				isLoading={isLoading}
				onClick={submitForm}
			>
				Enregistrer
			</SpinnerButton>

			<PopUp isOpen={isPopUpOpen} closePopUp={controlPopUp} title={'Choisir un avatar de profil'}>
				<div className={'flex flex-col md:gap-4 gap-2'}>
					{avatarList.map((_, index) => (
						<div className='grid grid-cols-5 items-center md:gap-4 gap-2 w-full' key={index}>
							{_.map((avatar) => (
								<div onClick={() => setTempAvatar(avatar)} key={avatar.id}>
									<ImageHtml
										key={avatar.id}
										src={avatar.url || ''}
										alt={avatar.name}
										className={`aspect-square w-full max-w-[100px] cursor-pointer ${tempAvatar?.id === avatar.id && 'border-4'}`}
										width={100}
										height={100}
									/>
								</div>
							))}
						</div>
					))}
					<button className={'btn btn-primary md:w-fit w-full self-end'} onClick={saveAvatar}>
						Choisir
					</button>
				</div>
			</PopUp>
		</div>
	);
};

export default ProfilePage;
