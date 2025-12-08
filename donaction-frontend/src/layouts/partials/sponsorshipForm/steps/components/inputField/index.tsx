import React, { useRef, useState } from 'react';
import './index.scss';
import useInputField from '@/partials/sponsorshipForm/steps/components/inputField/useInputField';
import { FieldInterface } from '@/partials/sponsorshipForm/logic/entities';
import DropdownList from '@/components/dropdownList';
import Image from 'next/image';
import SpinnerButton from '@/components/spinnerButton';
import eyeOpen from '../../../../../../../public/images/icons/eye_open.svg';
import eyeClosed from '../../../../../../../public/images/icons/eye_closed.svg';
import PlacesAutoComplete from '@/partials/sponsorshipForm/steps/components/inputField/placesAutoComplete';

const InputField: React.FC<FieldInterface> = (props) => {
	const {
		//
		id,
		ref,
		onBlur,
		message,
		onChange,
		feedback,
		getCleanProps,
		getComposedClassName,
	} = useInputField(props);

	const getOptions = () => {
		return props.isReadonly
			? props?.options?.map((option, _index) => (
					<li
						className={'cursor-pointer p-2'}
						key={_index}
						onClick={() => ((ref.current as HTMLInputElement).value = option) && feedback()}
					>
						{option}
					</li>
				))
			: props?.options
					?.filter((option, _index) =>
						option.toUpperCase().includes(String(props.defaultValue).toUpperCase()),
					)
					?.map((option, _index) => (
						<li
							className={'cursor-pointer p-2'}
							key={_index}
							onClick={() => ((ref.current as HTMLInputElement).value = option) && feedback()}
						>
							{option}
						</li>
					));
	};

	const getExtraInput = () => {
		switch (props?.extraType) {
			case 'spinner':
				return props.type === 'hidden' ? (
					<></>
				) : (
					<SpinnerButton
						id={id}
						disabled={props.disabled}
						isLoading={props.disabled}
						onClick={props.onClick as () => void}
						type={props.type as 'submit' | 'button'}
						className={`${getComposedClassName()} rounded-md border-black`}
					>
						{props.value}
					</SpinnerButton>
				);
			case 'textarea':
				return (
					<textarea
						{...getCleanProps()}
						className={`${getComposedClassName()} rounded-md border-black`}
						rows={6}
						id={id}
						onChange={onChange}
						onBlur={onBlur}
						ref={ref}
					></textarea>
				);
			case 'select':
				return (
					<DropdownList
						toggler={
							<input
								{...getCleanProps()}
								className={`${getComposedClassName()} rounded-md border-black`}
								id={id}
								readOnly={props.isReadonly}
								onChange={onChange}
								onBlur={onBlur}
								ref={ref}
							/>
						}
						listPosition={`w-full ${props.countriesList && 'bottom-[100%] top-[unset]'}`}
					>
						<ul className={'m-2 max-h-[300px] overflow-auto'}>
							{getOptions()}
							{props?.countriesList
								?.filter((country, _index) =>
									country.name.toUpperCase().includes(String(props.defaultValue).toUpperCase()),
								)
								?.map((country, _index) => (
									<li
										className={'flex flex-row gap-2 items-center cursor-pointer p-2'}
										key={_index}
										onClick={() =>
											((ref.current as HTMLInputElement).value = country.name) && feedback()
										}
									>
										<Image width={30} height={30} src={country.flag} alt={country.isoCode} />
										<p> {country.name} </p>
									</li>
								))}
						</ul>
					</DropdownList>
				);

			case 'places':
				return (
					<PlacesAutoComplete
						id={id}
						ref={ref}
						onBlur={feedback}
						defaultValue={props.defaultValue as string}
						onChange={feedback}
						className={`${getComposedClassName()} rounded-md border-black`}
					/>
				);
			default:
				return <></>;
		}
	};

	const [isPasswordShown, setIsPasswordShown] = useState<boolean>(false);

	const flipPassword = () => {
		setIsPasswordShown((_) => !_);
	};

	return (
		<div className={`inputFieldContainer ${props.parentClassName}`}>
			<div className={`inputFieldContainer__input ${props.type}`}>
				{props.label && (
					<label htmlFor={id} className={`text-sm ${props.type !== 'checkbox' && 'font-semibold'}`}>
						{props?.label} {props.isRequired ? '*' : ''}
					</label>
				)}
				{props?.extraType ? (
					getExtraInput()
				) : (
					<div className={'relative'}>
						<input
							{...getCleanProps()}
							type={isPasswordShown ? 'text' : props.type}
							className={`${getComposedClassName()} rounded-md border-black`}
							id={id}
							onChange={onChange}
							onBlur={onBlur}
							ref={ref}
						/>
						<Image
							onClick={flipPassword}
							src={isPasswordShown ? eyeClosed : eyeOpen}
							alt={'oeil'}
							className={`absolute cursor-pointer top-[35%] right-[10px] ${props.type === 'password' ? '' : 'hidden'}`}
						/>
					</div>
				)}
			</div>
			{((!['button', 'submit', 'hidden'].includes(props.type || '') && !props.hideError) ||
				props.forceError) && <small className='min-h-[20.78px]'>{message ?? ''}</small>}
		</div>
	);
};

export default InputField;
