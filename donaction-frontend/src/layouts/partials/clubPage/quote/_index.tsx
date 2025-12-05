import React from 'react';
import './index.scss';
import RichTextBlock, { RichTextBlockEl } from '@/components/RichTextBlock';

interface IQuoteConfig {
	text?: string;
	richText?: Array<RichTextBlockEl>;
	owner: string;
	image?: string;
	imageAlt?: string;
	inverted?: boolean;
	textSize?: string;
	primaryColor?: string;
	secondaryColor?: string;
	textColor?: string;
	type?: 'grid' | '';
}

const Quote: React.FC<IQuoteConfig> = (props) => {
	return (
		<div
			className={`w-full flex flex-col gap-6 justify-center rounded-3xl ${props.type === 'grid' ? 'text-black pl-6 items-start' : 'py-12 text-white items-center'}`}
			style={{ backgroundColor: props.primaryColor || '#FFF' }}
		>
			<div className={`relative ${props.type === 'grid' ? '' : 'sm:max-w-[70%] text-center'}`}>
				<GetQuoteSvg type={props.type} />
				{props.text && (
					<div
						className={`${props.textSize ? props.textSize : 'text-md'} w-full relative ${props.type === 'grid' ? '' : 'md:px-10 px-4'}`}
					>
						{props.text}
					</div>
				)}
				{props.richText && (
					<RichTextBlock
						data={props.richText}
						classCss={`${props.textSize ? props.textSize : 'text-md'} w-full relative ${props.type === 'grid' ? '' : 'md:px-10 px-4'}`}
					/>
				)}
			</div>
			{props.owner && <p className=''>— {props.owner}</p>}
		</div>
	);
};

export default Quote;

const GetQuoteSvg = ({ color, type }: { color?: string; type?: 'grid' | '' }) => {
	return (
		<svg
			className={`absolute ${type === 'grid' ? '-top-4 -left-7 w-[60px] h-[44px]' : 'left-0 -top-2 md:-top-6 md:left-4 w-[40px] md:w-[80px] md:h-[57px]'}`}
			// width={type === 'grid' ? '60' : '80'}
			// height={type === 'grid' ? '44' : '57'}
			viewBox='0 0 80 57'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				fillRule='evenodd'
				clipRule='evenodd'
				d='M62.0858 56.7109C35.4525 56.7109 38.2298 11.3809 66.5761 -0.000523764C66.9946 0.0715664 67.3879 0.248969 67.7189 0.514983C68.0499 0.780993 68.3077 1.12686 68.4682 1.52003C68.6286 1.9132 68.6863 2.34073 68.6359 2.76237C68.5855 3.18402 68.4287 3.58591 68.1801 3.93019C59.4126 11.0888 55.3601 17.8447 56.0226 24.1977C57.9723 23.5228 60.0214 23.1796 62.0846 23.1824C71.8297 23.1824 79.7305 30.6869 79.7305 39.9465C79.7305 49.2062 71.8297 56.7098 62.0846 56.7098'
				fill={color || type === 'grid' ? '#000000' : '#FFFFFF'}
				fillOpacity={type === 'grid' ? '0.08' : '0.38'}
			/>
			<path
				fillRule='evenodd'
				clipRule='evenodd'
				d='M19.0944 56.7109C-7.54104 56.7109 -4.76163 11.3809 23.5836 -0.000523764C24.002 0.0715931 24.3953 0.249007 24.7263 0.515017C25.0572 0.781024 25.3151 1.12688 25.4755 1.52003C25.636 1.91319 25.6938 2.3407 25.6434 2.76234C25.5931 3.18398 25.4363 3.58587 25.1878 3.93019C16.4196 11.0888 12.3669 17.8447 13.0296 24.1977C14.9803 23.5231 17.0303 23.1803 19.0944 23.1835C28.8395 23.1835 36.7402 30.688 36.7402 39.9477C36.7402 49.2074 28.8395 56.7109 19.0944 56.7109Z'
				fill={color || type === 'grid' ? '#000000' : '#FFFFFF'}
				fillOpacity={type === 'grid' ? '0.08' : '0.38'}
			/>
		</svg>
	);
};
