'use client';
import { Tooltip } from 'react-tooltip';

import React from 'react';

const ProgressBar: React.FC<{
	pourcent: number;
	montant: string;
	classCss?: string;
	isActive?: boolean;
}> = ({ pourcent, montant, classCss, isActive }) => {
	return (
		<div className={`relative w-full ${classCss}`}>
			<div className='absolute bg-[#D9D9D9] h-[8px] w-full left-0 bottom-0 rounded-2xl' />
			<div
				data-tooltip-content={`${montant} collectés!`}
				data-tooltip-id='montant'
				className={`absolute ${isActive ? 'bg-black' : 'bg-[#5A5A5A]'} h-[8px] bottom-0 left rounded-2xl tooltip`}
				style={{ width: pourcent + '%' }}
			/>
			<Tooltip id='montant' />
		</div>
	);
};

export default ProgressBar;
