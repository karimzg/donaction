'use client';

import React, { useEffect, useRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web';

interface LottieAnimationProps {
	animation: any;
	isControlled?: boolean;
	goToFrame?: number;
}
const LottieAnimation: React.FC<LottieAnimationProps> = (props) => {
	const animationContainer = useRef<HTMLDivElement | null>(null);
	const animationInstance = useRef<AnimationItem>();
	const fromFrame = useRef<number>(props.goToFrame || 0);
	const totalFrameCount = useRef<number>(0);

	useEffect(() => {
		if (animationContainer.current) {
			animationInstance.current = lottie.loadAnimation({
				container: animationContainer.current,
				renderer: 'svg',
				loop: !props?.isControlled,
				autoplay: !props.isControlled,
				animationData: props.animation,
			});
			animationInstance.current?.addEventListener('DOMLoaded', () => {
				totalFrameCount.current = animationInstance.current?.totalFrames || 0;
			});
		}

		return () => {
			animationInstance.current?.destroy();
		};
	}, []);

	useEffect(() => {
		if (animationInstance.current && props.isControlled && typeof props.goToFrame === 'number') {
			console.log(totalFrameCount.current);

			const getCondition = (val: number) => val >= 0 && val <= totalFrameCount.current;

			const goTo = getCondition(props.goToFrame) ? props.goToFrame : fromFrame.current;
			if (fromFrame.current !== goTo) {
				animationInstance.current?.playSegments([fromFrame.current, goTo], true);
			}
			fromFrame.current = goTo;
		}
	}, [props.goToFrame]);

	return <div className='lottieAnimationContainer w-full' ref={animationContainer}></div>;
};

export default LottieAnimation;
