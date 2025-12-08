import React from 'react';
import './index.scss';
import Image from 'next/image';
import quotesSVG from '../../../../../public/images/icons/quotes.svg';
import RichTextBlock, { RichTextBlockEl } from '@/components/RichTextBlock';

interface IQuoteConfig {
	text?: string;
	richText?: Array<RichTextBlockEl>;
	owner: string;
	image?: string;
	imageAlt?: string;
	inverted?: boolean;
	textSize?: string;
}

const Quote: React.FC<IQuoteConfig> = ({
	text,
	richText,
	owner,
	image,
	imageAlt,
	inverted,
	textSize,
}) => {
	return (
		<div
			className={`quoteContainer flex md:flex-row w-fit flex-col self-center items-center justify-between bg-white rounded-3xl overflow-hidden ${
				inverted && 'md:flex-row-reverse flex-col-reverse'
			}`}
		>
			{image && (
				<Image
					className={` md:max-w-[40%] w-full h-full object-cover`}
					src={image}
					width={400}
					height={400}
					alt={imageAlt || ''}
				/>
			)}
			<div className='p-10 flex relative flex-col items-center gap-4 w-full'>
				{text && (
					<div
						className={`text-center text-black ${
							textSize ? textSize : 'text-md'
						} w-full md:px-10 px-4`}
					>
						{text}
					</div>
				)}
				{!!richText && (
					<RichTextBlock
						data={richText}
						classCss={`text-center text-black ${textSize ? textSize : 'text-md'} md:px-10 px-4`}
					/>
				)}
				{owner && <p>{owner}</p>}
				<Image className='absolute top-2 left-4' src={quotesSVG} alt='quote' />
				<Image className='absolute bottom-2 right-4 rotate-180' src={quotesSVG} alt='quote' />
			</div>
		</div>
	);
};

export default Quote;
