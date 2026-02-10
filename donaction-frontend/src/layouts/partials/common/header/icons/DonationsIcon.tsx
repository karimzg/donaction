import React from 'react';

const DonationsIcon: React.FC<{ className?: string }> = ({ className }) => (
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
		<path d='M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16' />
		<path d='M7 20l1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-3.65 3.51' />
		<path d='M2 15l6 6' />
		<path d='M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.73 2.73 0 0 0 16 4a2.78 2.78 0 0 0-5 1.8c0 1.2.8 2 1.5 2.8L16 12l3.5-3.5z' />
	</svg>
);

export default DonationsIcon;
