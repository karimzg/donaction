import {
	FeedbackParamsType,
	IProfileInfoValues,
	IProfilePasswordsValues,
} from '@/partials/sponsorshipForm/logic/entities';
import { useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { selectSession } from '@/core/store/modules/authSlice';
import { Avatar } from '@/core/services/entities';
import { changePassword, me, update, updateUserImg } from '@/core/services/auth';
import objEqObj from '@/core/helpers/objEqObj';
import { pushToast } from '@/core/store/modules/rootSlice';
import { useSession } from 'next-auth/react';
import { sendGaEvent } from '@/core/helpers/sendGaEvent';

export interface IProfilePage {
	avatars: {
		womenAvatars: Array<Avatar>;
		menAvatars: Array<Avatar>;
	};
}
type ProfileFormsType = {
	info: IProfileInfoValues;
	passwords: IProfilePasswordsValues;
};
export default function useProfileForm(props: IProfilePage) {
	const dispatch = useAppDispatch();
	const session = useAppSelector(selectSession);
	const { update: updateSession } = useSession();
	const [isLoading, setIsLoading] = useState(false);
	const [tempAvatar, setTempAvatar] = useState<Avatar | undefined>(
		session.data?.avatar || undefined,
	);
	const [selectedImage, setSelectedImage] = useState<{ url: string; file?: File; avatar?: Avatar }>(
		{
			url: String(session.data?.avatar?.url || session.data?.image || ''),
			file: undefined,
			avatar: session?.data?.avatar || undefined,
		},
	);
	const [isPopUpOpen, setIsPopOpen] = useState(false);
	const avatarList = [...props.avatars.menAvatars, ...props.avatars.womenAvatars].reduce(
		(previousValue: Array<Array<Avatar>>, currentValue, currentIndex) => {
			if (currentIndex % 5 === 0) {
				previousValue = [...previousValue, [currentValue]];
			} else {
				previousValue[previousValue.length - 1].push(currentValue);
			}
			return previousValue;
		},
		[],
	);
	const freezedValues: Readonly<ProfileFormsType> = Object.freeze({
		info: {
			identifier: session?.data?.email as string,
			nom: session?.data?.nom || '',
		},
		passwords: {
			currentPassword: '',
			password: '',
			passwordConfirmation: '',
		},
	});
	const receivedInfoFeedbacks = useRef<Array<FeedbackParamsType>>([]);
	const receivedPasswordsFeedbacks = useRef<Array<FeedbackParamsType>>([]);
	const [infoFormConfig, setInfoFormConfig] = useState({
		defaultValues: {
			identifier: session?.data?.email as string,
			nom: session?.data?.nom || '',
		},
		triggerValidation: 1,
		DEFAULT_FEEDBACK: ({ attribute, cast, isValid }: FeedbackParamsType) => {
			receivedInfoFeedbacks.current.push({ attribute, cast, isValid });
			if (attribute) {
				setInfoFormConfig((_) => ({
					..._,
					defaultValues: {
						..._.defaultValues,
						[attribute.name]: cast(attribute.value),
					},
				}));
			}
		},
	});
	const [passwordsFormConfig, setPasswordsFormConfig] = useState({
		defaultValues: {
			currentPassword: '',
			password: '',
			passwordConfirmation: '',
		},
		clearValues: 1,
		triggerValidation: 1,
		DEFAULT_FEEDBACK: ({ attribute, cast, isValid }: FeedbackParamsType) => {
			receivedPasswordsFeedbacks.current.push({ attribute, cast, isValid });
			if (attribute) {
				setPasswordsFormConfig((_) => ({
					..._,
					defaultValues: {
						..._.defaultValues,
						[attribute.name]: cast(attribute.value),
					},
				}));
			}
		},
	});

	function submitForm() {
		receivedInfoFeedbacks.current = [];
		receivedPasswordsFeedbacks.current = [];
		triggerFieldsValidation();

		process.nextTick(async () => {
			if (
				receivedInfoFeedbacks.current.some((feedback) => !feedback.isValid) ||
				receivedPasswordsFeedbacks.current.some((feedback) => !feedback.isValid)
			)
				return;

			try {
				let isUpdated = false;
				setIsLoading(true);
				if (selectedImage.file) {
					sendGaEvent({
						category: 'MyProfile',
						label: 'Update user image',
					});
					const formData = new FormData();
					formData.set('avatar', selectedImage.file);
					await updateUserImg(session?.data?.uuid as string, formData);
					isUpdated = true;
				}
				let temp: Record<string, string | number> = {};
				if (!objEqObj(freezedValues.info, infoFormConfig.defaultValues)) {
					temp = { ...infoFormConfig.defaultValues };
				}
				if (selectedImage.avatar && selectedImage.avatar.id !== session?.data?.avatar?.id) {
					temp['avatar'] = selectedImage.avatar.id;
				}
				if (Object.keys(temp).length > 0) {
					sendGaEvent({
						category: 'MyProfile',
						label: 'Update user avatar',
					});
					await update(String(session?.data?.id), temp);
					isUpdated = true;
				}
				if (!objEqObj(freezedValues.passwords, passwordsFormConfig.defaultValues)) {
					sendGaEvent({
						category: 'MyProfile',
						label: 'Update user passwords',
					});
					await changePassword(passwordsFormConfig.defaultValues);
					isUpdated = true;
				}
				setIsLoading(false);
				if (isUpdated) {
					updateSession().then((res) => {
						dispatch(
							pushToast({
								type: 'success',
								title: 'Mise à jour du profil réussie',
							}),
						);
						setPasswordsFormConfig((_) => ({
							..._,
							clearValues: _.clearValues + 1,
							defaultValues: {
								currentPassword: '',
								password: '',
								passwordConfirmation: '',
							},
						}));
						setSelectedImage({
							url: String(res?.avatar?.url || res?.image || '/'),
							file: undefined,
							avatar: res?.avatar || undefined,
						});
					});
				}
			} catch (error: any) {
				setIsLoading(false);
				if (
					error?.error?.details &&
					Object.keys(error?.error?.details).length > 0 &&
					error.error.details?.errors?.length > 0
				) {
					error.error.details?.errors?.forEach((_: any) => {
						sendGaEvent({
							category: 'Error MyProfile',
							label: `Update user(${session?.data?.uuid as string}) --> ${_.message}`,
						});
						dispatch(
							pushToast({
								type: 'error',
								title: _.message,
							}),
						);
					});
				} else if (error?.error?.message) {
					sendGaEvent({
						category: 'Error MyProfile',
						label: `Update user(${session?.data?.uuid as string} --> ${error?.error?.message}`,
					});
					dispatch(
						pushToast({
							type: 'error',
							title: error.error.message,
						}),
					);
				} else {
					sendGaEvent({
						category: 'Error MyProfile',
						label: `Update user(${session?.data?.uuid as string}) --> `,
					});
					dispatch(
						pushToast({
							type: 'error',
							title: 'Une erreur est survenue',
						}),
					);
				}
			}
		});
	}

	const openFinder = () => {
		const finder = document.createElement('input');
		finder.type = 'file';
		finder.accept = 'image/*';
		finder.click();
		finder.onchange = () => {
			if (finder?.files && finder?.files[0]) {
				setTempAvatar(undefined);
				setSelectedImage({
					url: URL.createObjectURL(finder.files[0]),
					file: finder.files[0],
					avatar: undefined,
				});
			}
		};
	};

	const triggerFieldsValidation = () => {
		if (!objEqObj(freezedValues.info, infoFormConfig.defaultValues)) {
			setInfoFormConfig((_) => ({
				..._,
				triggerValidation: _.triggerValidation + 1,
			}));
		}
		if (!objEqObj(freezedValues.passwords, passwordsFormConfig.defaultValues)) {
			setInfoFormConfig((_) => ({
				..._,
				triggerValidation: _.triggerValidation + 1,
			}));
		}
	};

	const controlPopUp = () => {
		setIsPopOpen((_) => !_);
	};

	const saveAvatar = () => {
		setSelectedImage({
			url: tempAvatar?.url as string,
			file: undefined,
			avatar: tempAvatar,
		});
		controlPopUp();
	};

	return {
		session,
		isLoading,
		tempAvatar,
		submitForm,
		openFinder,
		avatarList,
		saveAvatar,
		isPopUpOpen,
		controlPopUp,
		selectedImage,
		setTempAvatar,
		infoFormConfig,
		passwordsFormConfig,
	};
}
