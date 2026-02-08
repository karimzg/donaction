'use client';
import React from 'react';
import './index.scss';

interface IDropdownList {
	toggler: React.ReactElement;
	className?: string;
	listPosition?: string;
	variant?: 'default' | 'glass';
}

const DropdownList: React.FC<React.PropsWithChildren<IDropdownList>> = (props) => {
	const [isHovered, setIsHovered] = React.useState(false);
	const isGlass = props.variant === 'glass';
	const panelRef = React.useRef<HTMLDivElement>(null);

	/* For glass variant: calculate offset so panel spans full viewport width */
	React.useLayoutEffect(() => {
		if (isGlass && isHovered && panelRef.current) {
			const wrapper = panelRef.current.parentElement;
			if (wrapper) {
				const rect = wrapper.getBoundingClientRect();
				panelRef.current.style.setProperty('--glass-offset', `${-rect.left}px`);
			}
		}
	}, [isGlass, isHovered]);

	const panelClass = isGlass
		? `dropdown-glass ${isHovered ? 'dropdown-glass--open' : ''}`
		: `${isHovered ? 'block' : 'hidden'} bg-white boxBoxShadow rounded-xl`;

	return (
		<div
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			className={`relative ${props.className} dropDownListContainer ${isHovered ? 'dropdown--open' : ''}`}
		>
			{props.toggler}
			<div
				ref={panelRef}
				onClick={() => setIsHovered(false)}
				className={`absolute ${isGlass ? '' : `w-fit top-[100%] ${props.listPosition || ''}`} z-20 ${panelClass}`}
			>
				{props.children}
			</div>
		</div>
	);
};

export default DropdownList;
