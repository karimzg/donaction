// 'use client';

// import CountUp from 'react-countup';
// import VisibilitySensor from 'react-visibility-sensor';
// import { useState } from 'react';

export interface ICounter {
	count: number;
	desc: string;
	unit: string;
}
const Counter = ({ count, unit, desc }: ICounter) => {
	// const [vizSensorActive, setVizSensorActive] = useState(true);

	return (
		<>
			<span className='mb-2 block font-secondary md:text-6xl text-2xl text-dark'>
				{/*<CountUp end={count} redraw={true}>*/}
				{/*	{({ countUpRef, start }) => (*/}
				{/*		<VisibilitySensor*/}
				{/*			active={vizSensorActive}*/}
				{/*			onChange={(isVisiable: boolean) => {*/}
				{/*				if (isVisiable && VisibilitySensor) setVizSensorActive(false);*/}
				{/*				start();*/}
				{/*			}}*/}
				{/*			delayedCall*/}
				{/*		>*/}
				{/*			<span ref={countUpRef} />*/}
				{/*		</VisibilitySensor>*/}
				{/*	)}*/}
				{/*</CountUp>*/}
				{count}
				{/*{unit}*/}
			</span>
			<div className='text-dark md:text-xl text-sm text-center px-2'>{desc}</div>
		</>
	);
};

export default Counter;
