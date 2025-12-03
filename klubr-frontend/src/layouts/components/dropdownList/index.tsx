'use client';
import React from 'react';
import './index.scss';
interface IDropdownList {
	toggler: React.ReactElement;
	className?: string;
	listPosition?: string;
}

const DropdownList: React.FC<React.PropsWithChildren<IDropdownList>> = (props) => {
	const [isHovered, setIsHovered] = React.useState(false);

	return (
		<div
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			className={`relative ${props.className} dropDownListContainer`}
		>
			{props.toggler}
			<div
				onClick={() => setIsHovered(false)}
				className={`${isHovered ? 'block' : 'hidden'} absolute bg-white w-fit boxBoxShadow rounded-xl top-[100%] ${props.listPosition} z-20`}
			>
				{props.children}
			</div>
		</div>
	);
};

export default DropdownList;
