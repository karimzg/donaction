import React from 'react';
import { useAppSelector } from '@/core/store/hooks';
import { selectIsDonationCguShown } from '@/core/store/modules/rootSlice';

const FormBanners = ({
	index,
	bg1,
	bg2,
	isBeingFilled,
}: {
	index: number;
	bg1: string;
	bg2: string;
	isBeingFilled: boolean;
}) => {
	const isCguShown = useAppSelector(selectIsDonationCguShown);
	return (
		<>
			<div
				style={{
					backgroundColor: bg1,
					height: '100px',
					width: '200px',
				}}
				className={`mainContainer__topRight absolute top-0 right-0 rounded-tr-2xl ${isBeingFilled ? 'hidden md:flex' : 'flex'}`}
			>
				<div
					style={{
						backgroundColor: bg2,
						height: '70px',
						width: '140px',
					}}
					className='mainContainer__topRight ml-auto rounded-tr-2xl'
				/>
			</div>
			{([0, 4].includes(index) || isCguShown) && (
				<div
					style={{
						backgroundColor: bg1,
						height: '100px',
						width: '200px',
					}}
					className={`mainContainer__botLeft absolute bottom-0 left-0 rounded-bl-2xl ${isBeingFilled ? 'hidden md:flex' : 'flex'}`}
				>
					<div
						style={{
							backgroundColor: bg2,
							height: '70px',
							width: '140px',
						}}
						className='mainContainer__botLeft mr-auto mt-auto rounded-bl-2xl'
					/>
				</div>
			)}
		</>
	);
};

export default FormBanners;
