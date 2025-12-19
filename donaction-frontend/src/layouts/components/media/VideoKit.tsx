'use client';
import React from 'react';
import { ExtraProps } from '@/components/media/MediaExtraProps';
import useWindow from '@/core/hooks/useWindow';

type ExtendedVideoProps = React.VideoHTMLAttributes<HTMLVideoElement> & ExtraProps;
const VideoKit: React.FC<ExtendedVideoProps> = (props) => {
	// const windowSize = useWindow(window.innerWidth);
	const getLoader = () => {
		// todo video
		// 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
		// return MediaLoader(
		// 	{
		// 		src: String(props.src),
		// 		width: Number(props.width),
		// 		height: props.height,
		// 		mobileHeight: props.mobileHeight,
		// 		mobileWidth: props.mobileWidth,
		// 	},
		// 	windowSize,
		// );
		return props.src;
	};
	const cleanProps = () => {
		// TODO: Pick /\
		const temp: Record<string, any> = structuredClone(props);
		delete temp?.mobileHeight;
		delete temp?.mobileWidth;
		delete temp?.src;
		return temp as React.VideoHTMLAttributes<HTMLVideoElement>;
	};

	return (
		<video {...cleanProps()} playsInline={true}>
			<source src={getLoader()} type={`video/${props.src?.match(new RegExp('[^.]+$'))}`} />
		</video>
	);
};

export default VideoKit;
