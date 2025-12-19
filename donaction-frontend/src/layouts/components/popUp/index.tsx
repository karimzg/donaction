'use client';

import React, { useEffect } from 'react';
import './index.scss';
import drawerX from '../../../../public/images/icons/drawerX.svg';
import Image from 'next/image';
import { createPortal } from 'react-dom';

interface IPopUp {
	isOpen: boolean;
	title: string;
	closePopUp: () => void;
}
const PopUp: React.FC<React.PropsWithChildren<IPopUp>> = (props) => {
	useEffect(() => {
		document.body.style.overflow = props.isOpen ? 'hidden' : 'auto';
		return () => {
			document.body.style.overflow = 'auto';
		};
	});

	return (
		<>
			{createPortal(
				<div className={`popUpMainContainer ${props.isOpen && 'isOpen'}`}>
					<div
						className={
							'popUpMainContainer__ctx flex flex-col items-center justify-center rounded-3xl boxBoxShadow bg-white'
						}
					>
						<div
							className={
								'popUpMainContainer__ctx__header w-full flex items-center justify-center p-6'
							}
						>
							{props.title !== '' && (
								<p className='font-semibold text-center px-10 md:px-6'>{props.title}</p>
							)}
							<Image
								className='popUpMainContainer__ctx__header__x'
								src={drawerX}
								alt={'X'}
								onClick={props.closePopUp}
							/>
						</div>

						{props.title !== '' && <hr className='w-full' />}
						<div className={'popUpMainContainer__ctx__body'}>{props.children}</div>
					</div>
				</div>,
				document.body,
			)}
		</>
	);
};

export default PopUp;
