'use client';
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import nextPrevious from '../../../../../../../public/images/icons/nextPrevious.svg';
import alertIcon from '../../../../../../../public/images/icons/alert.svg';
import ProjectCard from '@/partials/clubPage/projectCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import './index.scss';
import { getProjetsByKlub } from '@/core/services/projet';
import { KlubProjet } from '@/core/models/klub-project';
import { Swiper as SwiperType, SwiperOptions } from 'swiper/types';
import { Tooltip } from 'react-tooltip';

const ProjectsSlide: React.FC<{
	slides: Array<KlubProjet>;
	selectedProject?: KlubProjet;
	isProjectDonation: number;
	feedback: Function;
	projectSelectionError: boolean;
}> = (props) => {
	const swiperRef = useRef<any>(null);
	const [selectedProject, setSelectedProject] = useState(props.selectedProject || null);
	const [isProjectDonation, setIsProjectDonation] = useState(props.isProjectDonation);
	const [domLoaded, setDomLoaded] = useState(false);

	useEffect(() => {
		setDomLoaded(true);
	}, []);

	const nav = (acc: 1 | -1) => {
		swiperRef.current[acc > 0 ? 'slideNext' : 'slidePrev']();
	};

	const onSelectProject = (project: KlubProjet) => {
		setSelectedProject(project);
		props.feedback({
			isProjectDonation,
			selectedProject: project,
		});
	};

	const selectDonationType = (val: number) => {
		setIsProjectDonation(val);
		if (val === 0) {
			setSelectedProject(null);
		}
		props.feedback({
			isProjectDonation: val,
			selectedProject: val === 0 ? null : selectedProject,
		});
	};

	const [showSwiperBtns, setShowSwiperBtns] = useState<boolean>(true);
	const onBreakpoint = (swiper: SwiperType, breakpointParams: SwiperOptions) => {
		setShowSwiperBtns(!(props.slides.length <= ((breakpointParams.slidesPerView as number) || 3)));
	};

	const getSlidesPerView = (defaultV: number) => {
		if (!!props.slides.length && props.slides.length < 3) return props.slides.length;
		return defaultV;
	};

	return props.slides.length ? (
		<div className='flex flex-col gap-6 w-full mt-10'>
			<div className='flex flex-col md:mx-12 gap-4'>
				<div
					data-tooltip-id='donationUsage'
					className='flex items-center gap-1 cursor-pointer w-fit'
				>
					<p className='text-lg font-semibold'>Je soutiens :</p>
					<Image width={25} height={25} src={alertIcon} alt={''} />
				</div>
				<Tooltip id='donationUsage'>
					<h3>Utilisation du don</h3>
					<div style={{ maxWidth: '88vw' }}>
						<p>En effectuant mon don, je peux faire le choix de son utilisation par le Klub :</p>
						<ul>
							<li>
								Je contribue au fonctionnement général du klub. Mon don sera utilisée en fonction
								des besoins du club.
							</li>
							<li>
								Je souhaite que mon don finance un projet du klub en particulier (voir liste
								ci-après).
							</li>
						</ul>
					</div>
				</Tooltip>
				<div className='flex border-[1px] border-black w-full rounded-md text-sm'>
					<button
						type='button'
						className={`${
							isProjectDonation === 0 && 'selectedBtn'
						} p-2 rounded-tl-md rounded-bl-md basis-1/2`}
						value={0}
						onClick={() => selectDonationType(0)}
					>
						Le club
					</button>
					<button
						type='button'
						className={`${
							isProjectDonation === 1 && 'selectedBtn'
						} py-2 px-1 rounded-tr-md rounded-br-md basis-1/2`}
						value={1}
						onClick={() => selectDonationType(1)}
					>
						Un projet en particulier
					</button>
				</div>
			</div>
			{props.projectSelectionError && (
				<small style={{ color: 'red', textAlign: 'center' }}>Vous devez choisir un projet</small>
			)}
			{isProjectDonation === 1 && domLoaded && !!props.slides.length && (
				<div className='relative w-full'>
					<Swiper
						spaceBetween={5}
						slidesPerView={1}
						breakpoints={{
							630: {
								slidesPerView: getSlidesPerView(2),
								spaceBetween: 30,
							},
							1200: {
								slidesPerView: getSlidesPerView(3),
								spaceBetween: 30,
							},
						}}
						onBreakpoint={onBreakpoint}
						onSwiper={(swiper) => (swiperRef.current = swiper)}
						style={{
							padding: '20px 10px',
						}}
					>
						{props.slides.map((projet: KlubProjet, index: number) => (
							<SwiperSlide style={{ height: 'auto' }} key={index}>
								<ProjectCard
									isMinified
									select={() => onSelectProject(projet)}
									isSelected={projet?.uuid === selectedProject?.uuid}
									projet={projet}
									isOnlyChild={props.slides.length === 1}
								/>
							</SwiperSlide>
						))}
					</Swiper>

					{showSwiperBtns && (
						<>
							<div
								onClick={() => nav(1)}
								className='boxBoxShadow cursor-pointer absolute md:w-[50px] w-[30px] h-[30px] md:h-[50px] flex items-center justify-center bg-white rounded-full md:right-4 right-2 top-[45%] z-10'
							>
								<Image
									className='md:h-[25px] h-[18px]'
									width={23}
									height={25}
									src={nextPrevious}
									alt={''}
								/>
							</div>

							<div
								onClick={() => nav(-1)}
								className='boxBoxShadow cursor-pointer absolute md:w-[50px] w-[30px] h-[30px] md:h-[50px] flex items-center justify-center bg-white rounded-full md:left-4 left-2 top-[45%] z-10'
							>
								<Image
									className='md:h-[25px] h-[18px] rotate-180'
									width={23}
									height={25}
									src={nextPrevious}
									alt={''}
								/>
							</div>
						</>
					)}
				</div>
			)}
		</div>
	) : (
		<></>
	);
};

export default ProjectsSlide;
