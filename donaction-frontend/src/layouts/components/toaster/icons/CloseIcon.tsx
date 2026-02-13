import React from 'react';

interface CloseIconProps {
	className?: string;
}

const CloseIcon: React.FC<CloseIconProps> = ({ className }) => (
	<svg
		viewBox="0 0 20 20"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		aria-hidden="true"
	>
		<path
			d="M6 6l8 8M14 6l-8 8"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

export default CloseIcon;
