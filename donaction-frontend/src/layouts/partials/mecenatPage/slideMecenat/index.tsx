'use client';

import React, { useRef, useState } from 'react';
import { Swiper as SwiperEl, SwiperRef, SwiperSlide } from 'swiper/react';
import Swiper from 'swiper';
import 'swiper/css';
import ImageHtml from '@/components/media/ImageHtml';
import { ISlider } from '@/core/models/hp';
import RichTextBlock from '@/components/RichTextBlock';
import { Autoplay } from 'swiper/modules';
import Link from 'next/link';

// TODO: To be continued
const SlideMecenat: React.FC<{
	isRounded?: boolean;
	slides: Array<ISlider>;
	imageUrl: string;
}> = ({ isRounded, slides, imageUrl }) => {
	const localSlides = [...(slides || [])?.sort((slide1, slide2) => slide1?.order - slide2?.order)];
	const [index, setIndex] = useState<number>(0);
	const swiperRef = useRef<SwiperRef>(null);

	const onSlideChange = (swiper: Swiper) => {
		setIndex(swiper.activeIndex);
	};

	const calculateWidth = (spanIndex: number) => {
		if (spanIndex === localSlides.length - 1) return '0px';
		if (spanIndex === index || spanIndex === index - 1) return '60px';
		return '30px';
	};

	return (
		<div className={`w-full relative ${isRounded && 'md:rounded-3xl'} overflow-hidden`}>
			<SwiperEl
				ref={swiperRef}
				className='customSwiperPagination w-full aspect-[2] max-h-[75vh] min-h-[400px]'
				centeredSlides
				autoplay={{
					delay: 5000,
					disableOnInteraction: false,
				}}
				modules={[Autoplay]}
				slidesPerView={1}
				onSlideChange={onSlideChange}
				style={{ zIndex: 20 }}
			>
				{localSlides.map((slide, _index) => (
					<SwiperSlide style={{ height: 'auto' }} key={_index}>
						<div className={`relative w-full h-full`}>
							<div
								className={`absolute w-full h-full top-0 left-0 flex flex-col items-center justify-center ${
									isRounded ? 'lg:gap-8' : 'lg:gap-16'
								} gap-4  text-white text-center px-4`}
							>
								{slide?.title && <p className='font-bold xl:text-3xl text-xl'>{slide?.title}</p>}
								{slide?.subTitle && <p className='font-bold text-lg'>{slide?.subTitle}</p>}
								{slide?.content && (
									<div className='md:max-w-[60%]'>{<RichTextBlock data={slide?.content} />}</div>
								)}
								{slide?.buttonLink && (
									<Link
										target={slide?.buttonLink?.startsWith('https://') ? '_blank' : '_self'}
										href={slide?.buttonLink || ''}
										className='btn btn-outline-primary'
									>
										{slide?.buttonLabel || 'En savoir +'}
									</Link>
								)}
							</div>
						</div>
					</SwiperSlide>
				))}
			</SwiperEl>
			{localSlides.length > 1 && (
				<div className='customSwiperPaginator absolute bottom-10 right-0 left-0 mx-auto w-full flex items-center justify-center text-white gap-4 z-20'>
					{localSlides?.map((slide, _index) => (
						<React.Fragment key={_index}>
							<span
								key={_index}
								onClick={() => swiperRef.current?.swiper.slideTo(_index)}
								className={`cursor-pointer ${index === _index && 'text-[#F1C21B]'}`}
							>
								{('0' + Number(_index + 1)).slice(-2)}
							</span>
							<span className={`h-[1px] bg-[#F1C21B] w-[${calculateWidth(_index)}]`} />
						</React.Fragment>
					))}
				</div>
			)}
			<div
				className='absolute top-0 left-0 bg-[rgba(0,0,0,0.65)] w-full h-full'
				style={{ zIndex: 15 }}
			/>
			{/*// TODO: implement ImageHtml namedtransformation*/}
			<ImageHtml
				className={`w-full h-full object-cover grayscale absolute top-0 left-0 z-10`}
				src={imageUrl}
				alt={'Le sport unit, le don renforce !'}
				width={2876}
				height={1386}
				namedtransformation={'slider'}
				sizes={
					'(max-width: 480px) and (-webkit-device-pixel-ratio: 1)       1px,\n' +
					'    (min-width: 481px) and (-webkit-device-pixel-ratio: 1)       2px,\n' +
					'    (max-width: 480px) and (-webkit-min-device-pixel-ratio: 2)   3px,\n' +
					'    (min-width: 481px) and (-webkit-min-device-pixel-ratio: 2)  16px'
				}
				priority={true}
			/>
		</div>
	);
};

export default SlideMecenat;
