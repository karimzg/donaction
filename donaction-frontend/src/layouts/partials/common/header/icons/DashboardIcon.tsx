import React from 'react';

const DashboardIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width={24}
		height={24}
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth={1.5}
		strokeLinecap='round'
		strokeLinejoin='round'
		className={className}
		aria-hidden='true'
	>
		<rect x={3} y={3} width={18} height={18} rx={2} />
		<path d='M9 3v18' />
		<path d='M9 9h12' />
		<path d='M9 15h12' />
	</svg>
);

export default DashboardIcon;
