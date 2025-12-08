'use client';

import React from 'react';
import { FaChevronDown } from 'react-icons/fa';

const Accordion = ({
	title,
	toggle,
	isOpen,
	children,
	className,
}: {
	title: string;
	children: React.ReactNode;
	className?: string;
	isOpen: boolean;
	toggle?: () => void;
}) => {
	return (
		<div className={`flex flex-col gap-2 w-full ${className}`}>
			<div
				className='flex justify-between gap-10 items-center w-full px-4 py-2 cursor-pointer'
				onClick={toggle ? toggle : () => null}
			>
				<p className='font-medium text-start'>{title}</p>
				<FaChevronDown className={`accordion-icon min-w-[12px] ${isOpen ? 'rotate-180' : ''}`} />
			</div>
			<div className={`px-4 text-start pb-2 animateHeight ${isOpen ? 'visible' : 'hidden'}`}>
				{children}
			</div>
		</div>
	);
};

export default Accordion;
