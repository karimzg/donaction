'use client';

import contribution from '../../../public/animations/contribution.json';
import LottieAnimation from '@/components/LottieAnimation';
import { useState } from 'react';

const Test = () => {
	const [goToFrame, setGoToFrame] = useState<number>(0);
	return (
		<div>
			<div className={'flex flex-col items-center gap-4'}>
				<button onClick={() => setGoToFrame((_) => _ + 5)}>goToFrame + 5 = {goToFrame}</button>
				<button onClick={() => setGoToFrame((_) => _ - 5)}>goToFrame - 5 = {goToFrame}</button>
			</div>
			<LottieAnimation animation={contribution} isControlled goToFrame={goToFrame} />
		</div>
	);
};

export default Test;
