import React from 'react';
import './index.scss';
import Image from 'next/image';
import heart from '../../../../../public/images/icons/heart.svg';
import { Media } from '@/core/models/club';
import Link from 'next/link';
import VideoKit from '@/components/media/VideoKit';
import ImageHtml from '@/components/media/ImageHtml';
import TemplateReference from '@/partials/common/templateReference';
import { KlubProjet } from '@/core/models/klub-project';

interface IClubIntroduction {
	uuid: string;
	name: string;
	category: string;
	slogan: string;
	introMedia: Media;
	logo: Media;
	slug: string;
	titleLevel?: 1 | 2;
	isProject?: KlubProjet;
}

const ClubIntroduction: React.FC<IClubIntroduction> = ({
	uuid,
	introMedia,
	name,
	category,
	slogan,
	logo,
	slug,
	titleLevel = 1,
	isProject,
}) => {
	const isImage = introMedia && /\.(jpg|jpeg|png|gif|svg)$/i.test(introMedia.url);
	const isVideo =
		introMedia && /\.(mp4|mkv|avi|mov|wmv|flv|webm|mpg|mpeg|3gp)$/i.test(introMedia.url);
	return (
		<div className='clubIntroContainer relative'>
			<div className='clubIntroContainer__videoImage md:rounded-3xl relative mt-10 md:mt-0 bg-gray-50'>
				{(isImage || !isVideo) && (
					<ImageHtml
						className={`md:rounded-3xl min-h-[250px] ${titleLevel === 1 && 'max-h-[435px]'} w-full ${introMedia?.url ? 'object-cover' : 'object-contain'}`}
						priority={true}
						width={1280}
						height={435}
						src={introMedia?.url || ''}
						namedtransformation={titleLevel === 2 ? 'couv_project' : 'couv'}
						alt={introMedia?.alternativeText || `Image de couverture ${name}`}
						sizes={
							'(max-width: 480px) and (-webkit-device-pixel-ratio: 1)       1px,\n' +
							'    (min-width: 481px) and (-webkit-device-pixel-ratio: 1)       2px,\n' +
							'    (max-width: 480px) and (-webkit-min-device-pixel-ratio: 2)   3px,\n' +
							'    (min-width: 481px) and (-webkit-min-device-pixel-ratio: 2)  16px'
						}
					/>
				)}
				{/*

				sizes={'(max-width: 480px) and (-webkit-device-pixel-ratio: 1)       1px,\n' +
							'    (min-width: 481px) and (-webkit-device-pixel-ratio: 1)       2px,\n' +
							'    (max-width: 480px) and (-webkit-min-device-pixel-ratio: 2)   3px,\n' +
							'    (min-width: 481px) and (-webkit-min-device-pixel-ratio: 2)  16px'
							}
				sizes={'(max-width: 480px) and (-webkit-device-pixel-ratio: 1)       1px,\n' +
							'    (min-width: 481px) and (max-width: 767px) and (-webkit-device-pixel-ratio: 1)       2px,\n' +
							'    (min-width: 768px) and (-webkit-device-pixel-ratio: 1)       3px,\n' +
							'    (max-width: 480px) and (-webkit-min-device-pixel-ratio: 2)   4px,\n' +
							'    (min-width: 481px) and (max-width: 767px) and (-webkit-min-device-pixel-ratio: 2)  21px' +
							'    (min-width: 768px) and (-webkit-min-device-pixel-ratio: 2)  22px'
					}
					*/}
				{isVideo && (
					<VideoKit
						src={introMedia.url}
						width={1280}
						height={435}
						mobileWidth={375}
						mobileHeight={250}
						autoPlay={true}
						muted
						controls={false}
						loop
						className='md:rounded-3xl min-h-[250px] object-cover max-h-[435px] w-full'
					/>
				)}
				{!isProject ? (
					<div
						className={`clubIntroContainer__iSupport bg-[#FFFFFF91] flex flex-col items-center justify-center absolute bottom-0 right-0 p-4 md:rounded-br-3xl rounded-tl-3xl cursor-pointer md:min-w-[115px]`}
					>
						<Link href='?PAYEMENT_FORM=true'>
							<Image className='md:w-[52px] w-[30px]' src={heart} alt={'Je soutiens'} />
						</Link>
						<p className='font-black text-black md:text-lg text-base md:leading-3'>Je soutiens</p>
					</div>
				) : (
					<TemplateReference
						projet={isProject}
						css={String(
							'absolute right-0 top-0 rounded-tr-none rounded-br-none rounded-bl-3xl rounded-tl-none md:rounded-tr-3xl',
						)}
					/>
				)}
				{logo && (
					<div className='clubIntroContainer__logo flex items-center justify-center bg-white absolute md:top-0 -top-8 md:left-0 left-4 p-1 rounded-br-3xl rounded-tl-3xl max-[768px]:rounded-3xl aspect-square overflow-hidden'>
						<div className='md:w-24 w-20 relative'>
							<Link href={`/${slug}`}>
								<ImageHtml
									priority={true}
									className='object-contain max-h-[80px]'
									width={logo.width}
									height={logo.height}
									src={logo.url}
									namedtransformation={'logo'}
									nosizes={true}
									alt={logo.alt || `Logo ${name}`}
								/>
							</Link>
						</div>
					</div>
				)}
			</div>
			<div
				className={`clubIntroContainer__description md:bg-[#FFFFFF91] bg-white flex flex-col items-start justify-center md:absolute md:bottom-0 md:left-0 p-5 pb-2 md:rounded-bl-3xl md:rounded-tr-3xl text-black max-[768px]:bg-white ${isProject ? 'md:max-w-[48%] max-[768px]:rounded-3xl max-[768px]:bg-white max-[768px]:-mt-10 max-[768px]:relative max-[768px]:boxBoxShadow max-[768px]:mx-4' : ''}`}
			>
				{titleLevel === 1 ? (
					<h1>
						<Link href={`/${slug}`} className='text-2xl font-semibold leading-4'>
							{name}
						</Link>
					</h1>
				) : (
					<h2>
						<Link href={`/${slug}`} className='text-2xl font-semibold leading-4'>
							{name}
						</Link>
					</h2>
				)}
				<p className='font-semibold text-sm mb-1'>{category}</p>
				<p className=''>{slogan}</p>
			</div>
		</div>
	);
};

export default ClubIntroduction;
