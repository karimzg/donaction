'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import nextPrevious from '../../../../../public/images/icons/nextPrevious.svg';
import Image from 'next/image';
import { Media } from '@/core/models/club';
import ImageHtml from "@/components/media/ImageHtml";

interface ISlides {
	slides: Array<Media>;
}
const Slides: React.FC<ISlides> = (slides) => {
	const [domLoaded, setDomLoaded] = useState(false);

	useEffect(() => {
		setDomLoaded(true);
	}, []);

	const swiperRef = useRef<any>(null);
	const nav = (acc: 1 | -1) => {
		swiperRef.current[acc > 0 ? 'slideNext' : 'slidePrev']();
	};

	return (
		domLoaded &&
		!!slides?.slides && (
			<div className='w-full relative'>
				{/*TODO : force SLIDES height to 360px */}
				<Swiper
					loop={slides.slides.length > 3}
					centeredSlides
					height={360}
					spaceBetween={5}
					slidesPerView={1}
					breakpoints={{
						768: {
							slidesPerView: 2.4,
							spaceBetween: 15,
						},
					}}
					onSwiper={(swiper) => (swiperRef.current = swiper)}
				>
					{slides.slides.map((slide, index) => (
						<SwiperSlide className='max-h-[400px]' style={{ height: 'auto' }} key={index}>
							<ImageHtml
								height={360}
								width={(360 * slide.width) / slide.height}
								className='w-full h-full object-cover'
								src={slide.url}
								alt={slide.alternativeText || 'Illustration'}
							/>
						</SwiperSlide>
					))}
				</Swiper>
				<div
					onClick={() => nav(1)}
					className='cursor-pointer absolute md:w-[50px] w-[30px] h-[30px] md:h-[50px] flex items-center justify-center bg-white rounded-full md:right-10 right-2 top-[45%] z-10'
				>
					<Image className='md:h-[25px] h-[18px]' src={nextPrevious} alt='Slider Précédent' />
				</div>

				<div
					onClick={() => nav(-1)}
					className='cursor-pointer absolute md:w-[50px] w-[30px] h-[30px] md:h-[50px] flex items-center justify-center bg-white rounded-full md:left-10 left-2 top-[45%] z-10'
				>
					<Image
						className='md:h-[25px] h-[18px] rotate-180'
						src={nextPrevious}
						alt='Slider Suivant'
					/>
				</div>
			</div>
		)
	);
};

export default Slides;
