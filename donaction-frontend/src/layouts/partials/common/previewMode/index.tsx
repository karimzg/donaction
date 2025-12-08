'use client';
import React, { useEffect, useState } from 'react';
import GetClientCookie, { DeleteClientCookie } from '@/core/helpers/getClientCookie';
import { getClubsSlugs } from '@/core/services/club';
import { Session } from 'next-auth';

const PreviewMode: React.FC<{ session: Session | null }> = (props) => {
	const [isPreview, setIsPreview] = useState<boolean>(false);
	const [isChecked, setIsChecked] = useState<boolean>(true);

	const check = () => {
		setIsChecked(false);
		setTimeout(() => {
			DeleteClientCookie('isPreviewMode');
			location.reload();
		}, 100);
	};

	useEffect(() => {
		setIsPreview(props.session ? !!GetClientCookie('isPreviewMode') : false);
		if (!props.session) {
			DeleteClientCookie('isPreviewMode');
		}
	}, []);

	return (
		<>
			<div
				className={
					isPreview
						? 'text-sm p-1 bg-black text-[#F1C21B] fixed top-0 left-0 flex items-center gap-2 boxBoxShadow'
						: 'hidden'
				}
			>
				<p onClick={() => getClubsSlugs()}>Mode Preview</p>
				<div
					className={`${isChecked ? 'bg-[#F1C21B]' : 'bg-[#CBCBCB]'} rounded-full w-[54px] h-[25px] relative cursor-pointer`}
					onClick={check}
					style={{
						transition: 'background .5s ease-in-out',
					}}
				>
					<span
						className={`w-[21px] h-[21px] absolute ${isChecked ? 'left-[31px]' : 'left-[2px]'}  top-[2px] rounded-full bg-black`}
						style={{
							transition: 'left .3s ease-in-out',
						}}
					/>
				</div>
			</div>
		</>
	);
};

export default PreviewMode;
