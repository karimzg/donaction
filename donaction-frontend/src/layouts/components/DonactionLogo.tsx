import Image from 'next/image';

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
				height: context === 'header' ? '32px' : '28px',
				maxWidth: `${width}px`,
				objectFit: 'contain',
			}}
			priority={context === 'header'}
		/>
	);
};

export default DonactionLogo;
