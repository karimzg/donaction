import React from 'react';
import spinner from '../../../../public/images/icons/spinner.svg';
import Image from 'next/image';

interface ISpinnerButton {
	className?: string;
	isLoading?: boolean;
	onClick?: () => void;
	type?: 'submit' | 'button';
	disabled?: boolean;
	id?: string;
}
const SpinnerButton: React.FC<React.PropsWithChildren<ISpinnerButton>> = (props) => {
	return (
		<button
			id={props.id || ''}
			onClick={props.onClick}
			className={`btn btn-primary flex flex-row items-center justify-center gap-4 ${props?.className}`}
			disabled={props.disabled || props.isLoading}
			type={props.type || 'button'}
		>
			{props.isLoading && (
				<Image className={'spinnerInf'} src={spinner} alt={'loading'} width={20} height={20} />
			)}
			{props.children}
		</button>
	);
};

export default SpinnerButton;
