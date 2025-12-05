'use client';

import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faShare, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';
import getURL from '@/core/helpers/getURL';
import { usePathname } from 'next/navigation';
import {
	EmailIcon,
	EmailShareButton,
	FacebookIcon,
	FacebookShareButton,
	LinkedinIcon,
	LinkedinShareButton,
	TwitterShareButton,
	WhatsappIcon,
	WhatsappShareButton,
	XIcon,
} from 'react-share';
import { sendGaEvent } from "@/core/helpers/sendGaEvent";

const ShareCta = ({
	urlToShare,
	text,
	size,
	align,
	mobileHideText,
}: {
	urlToShare?: string;
	text: string;
	size?: 'default' | 'small';
	align?: 'left' | 'center' | 'right';
	mobileHideText?: boolean;
}) => {
	const linkToShare = urlToShare || getURL(usePathname());
	const ctaSize = size || 'default';
	const modalRef = useRef<HTMLDivElement>(null);
	const alignDirection: 'left' | 'center' | 'right' = align || 'center';
	const alignClass =
		alignDirection === 'left'
			? ' -left-1'
			: alignDirection === 'right'
				? '-right-1'
				: 'left-1/2 -translate-x-2/4';

	const openShareModal = (event: React.MouseEvent) => {
		event.stopPropagation();
		(modalRef.current as HTMLDivElement).style.display = 'flex';
	};

	const closeShareModal = (event: React.MouseEvent) => {
		event.stopPropagation();
		(modalRef.current as HTMLDivElement).style.display = 'none';
	};

	const copyToClipBoard = () => {
		navigator.clipboard.writeText(linkToShare).then(() => {});
		sendGaEvent({
			category: 'Social Share',
			label: `Copied link: ${linkToShare}`,
		});
	};

	useEffect(() => {
		window.addEventListener('click', (e: MouseEvent) => {
			if (
				!modalRef.current?.contains(e.target as Node) &&
				(modalRef.current as HTMLDivElement) &&
				(modalRef.current as HTMLDivElement).style.display === 'flex'
			) {
				(modalRef.current as HTMLDivElement).style.display = 'none';
			}
		});
	}, []);

	const share = (destination: string) => {
		sendGaEvent({
			category: 'Social Share',
			label: `Opened share modal in ${destination}, url to share: ${linkToShare}`,
		});
	}

	return (
		<div className={'self-center relative'}>
			<div
				ref={modalRef}
				className={`${alignClass} hidden bg-white box-shadow absolute z-10 -bottom-5 self-center p-4 text-black flex flex-col gap-2 rounded-md`}
			>
				<p className='absolute top-1 right-2 text-base cursor-pointer' onClick={closeShareModal}>
					<FontAwesomeIcon icon={faXmarkCircle} />
				</p>
				<div className='flex gap-2 items-center justify-start'>
					<FacebookShareButton onClick={() => share("FACEBOOK")} url={linkToShare} hashtag={'#klubr'}>
						<FacebookIcon size={32} round />
					</FacebookShareButton>
					<TwitterShareButton onClick={() => share("TWITTER")} url={linkToShare} title={text} hashtags={['klubr']}>
						<XIcon size={32} round />
					</TwitterShareButton>
					<WhatsappShareButton onClick={() => share("WHATSAPP")} url={linkToShare} title={text} separator=':: '>
						<WhatsappIcon size={32} round />
					</WhatsappShareButton>
					<LinkedinShareButton onClick={() => share("LINKEDIN")} url={linkToShare} title={text}>
						<LinkedinIcon size={32} round />
					</LinkedinShareButton>
					<EmailShareButton onClick={() => share("EMAIL")} url={linkToShare} subject={text} body=''>
						<EmailIcon size={32} round />
					</EmailShareButton>
				</div>
				<div className='flex gap-1 items'>
					<p className='text-sm font-semibold text-ellipsis whitespace-nowrap overflow-hidden p-[4px] border-[1px] w-[250px] border-gray-400 rounded-md'>
						{linkToShare || ''}
					</p>
					<div
						onClick={copyToClipBoard}
						className={`w-[33px] h-[33px] btn-primary flex items-center justify-center rounded-md cursor-pointer `}
					>
						<FontAwesomeIcon icon={faCopy} />
					</div>
				</div>
			</div>
			<div className='flex justify-center w-fit'>
				<button
					onClick={openShareModal}
					className={`btn btn-outline-primary flex items-center justify-center gap-2 ${ctaSize === 'small' ? 'leading-6 px-4 py-0' : 'py-2 px-8'}`}
				>
					<span className={`${mobileHideText ? 'hidden sm:block' : ''}`}>Partager</span>
					<FontAwesomeIcon className={`${mobileHideText ? 'py-[5px]' : ''}`} icon={faShare} />
				</button>
			</div>
		</div>
	);
};

export default ShareCta;
