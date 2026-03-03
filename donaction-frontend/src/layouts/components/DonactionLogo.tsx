import Image from 'next/image';

const LOGO_HEIGHTS = {
	header: '32px',
	footer: '28px',
} as const;

interface DonactionLogoProps {
	width?: number;
	height?: number;
	className?: string;
	context?: 'header' | 'footer';
}

const DonactionLogo: React.FC<DonactionLogoProps> = ({
	width = 160,
	height = 40,
	className = '',
	context = 'header',
}) => {
	return (
		<Image
			src='/images/donaction-logo.png'
			alt='Donaction'
			width={width}
			height={height}
			className={`${className} ${context === 'footer' ? 'brightness-0 invert' : ''}`}
			style={{
				width: 'auto',
				height: LOGO_HEIGHTS[context],
				maxWidth: `${width}px`,
				objectFit: 'contain',
			}}
			priority={context === 'header'}
		/>
	);
};

export default DonactionLogo;
