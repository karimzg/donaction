import React, { useRef, useState } from 'react';
import InputField from '@/partials/sponsorshipForm/steps/components/inputField';
import './index.scss';
import { FieldInterface } from '@/partials/sponsorshipForm/logic/entities';
import { KlubProjet } from '@/core/models/klub-project';

const AmountPicker: React.FC<FieldInterface & { selectedProject?: KlubProjet }> = (props) => {
	const [value, setValue] = useState<number>(Number(props.value));
	const suggestedAmounts: Array<number> = [10, 20, 50, 100];
	const freeAmountEntryRef = useRef<HTMLInputElement>(null);

	const select = (event: React.MouseEvent) => {
		(freeAmountEntryRef.current as HTMLInputElement).value = '';
		setValue(Number((event.target as HTMLButtonElement).value));
	};

	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setValue(Number(event.target.value));
	};

	const getDefaultValue = () => {
		if (suggestedAmounts.includes(Number(props.value))) return '';
		return props.value;
	};

	const getProps = () => {
		const { selectedProject, ...rest } = props;
		return rest;
	};

	return (
		<div className='amountPickerMainContainer flex flex-col gap-4 items-center'>
			<p className='font-semibold text-lg text-center'>
				{!!props.selectedProject
					? 'Je souhaite aider le projet à hauteur de :'
					: 'Je souhaite aider le club à hauteur de :'}
			</p>
			<div className='amountPickerMainContainer__buttonsContainer flex flex-wrap md:gap-4 gap-1'>
				{suggestedAmounts.map((amount) => (
					<button
						key={amount}
						className={`${
							Number(value) === amount && 'selected'
						} border-[1px] border-black p-2 md:w-16 rounded-md font-semibold`}
						value={amount}
						onClick={select}
					>
						{amount}&nbsp;€
					</button>
				))}
			</div>
			<div className='amountPickerMainContainer__freeAmountEntryContainer flex gap-4 items-center font-semibold'>
				<p>Montant libre</p>
				<input
					className='text-center w-32 border-black rounded-md'
					placeholder='--,--'
					type='number'
					min={10}
					ref={freeAmountEntryRef}
					onChange={onChange}
					onBlur={onChange}
					defaultValue={getDefaultValue()}
				/>
				<p>€</p>
			</div>
			<InputField {...getProps()} value={String(value)} />
		</div>
	);
};

export default AmountPicker;
