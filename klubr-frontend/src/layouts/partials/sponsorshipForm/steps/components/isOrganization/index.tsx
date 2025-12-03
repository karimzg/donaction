import React, { useState } from 'react';
import InputField from '@/partials/sponsorshipForm/steps/components/inputField';
import './index.scss';
import { FieldInterface } from '@/partials/sponsorshipForm/logic/entities';

const IsOrganization: React.FC<FieldInterface> = (props) => {
	const [value, setValue] = useState<number>(Number(props.value));

	const select = (event: React.MouseEvent) => {
		const newValue = Number((event.target as HTMLButtonElement).value);
		setValue(newValue);
	};

	return (
		<>
			<div className='flex justify-between gap-6 bg-[#F4F4F4] rounded-md p-[4px] relative'>
				<div
					className={`absolute top-[4px] ${value === 0 ? 'left-[4px]' : 'left-[135px]'} bg-white rounded-md w-[106px] h-[26px] z-0`}
					style={{
						transition: 'left .3s ease-in-out',
					}}
				/>
				<button
					type='button'
					className={`${value === 0 && 'font-medium text-black'} px-4 z-10`}
					value={0}
					onClick={select}
					style={{
						transition: 'color .3s ease-in-out',
					}}
				>
					Particulier
				</button>
				<button
					type='button'
					className={`${value === 1 && 'font-medium text-black'} px-4 z-10`}
					value={1}
					onClick={select}
					style={{
						transition: 'color .3s ease-in-out',
					}}
				>
					Entreprise
				</button>
			</div>
			<InputField {...props} value={value} />
		</>
	);
};

export default IsOrganization;
