import React from 'react';
import Image from 'next/image';
import { gridData } from '@/partials/mecenatPage/avantageMecenat/consts';
import Accordion from '@/partials/common/accordion';

const AvantageMecenat: React.FC<{}> = () => {
	return (
		<div
			style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 123px, 36% 0, 0 123px)' }}
			className=' flex items-center w-full bg-[#FFFAF7] pt-40 pb-72'
		>
			<div className='flex flex-col items-center w-full gap-10 md:px-0 px-4'>
				<div className='w-full flex flex-col items-center text-center gap-6'>
					<h2 className='font-semibold text-xl'>Les avantages du mécénat sportif</h2>
					<p>
						Citroque rapiunt aut inmorantur celeri momento citroque tamen quicquid citroque parvi
						vastabant
					</p>
				</div>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4 xl:minMaxWidth w-full md:px-4'>
					{gridData.map((data, index) => (
						<>
							{/*TODO: ???*/}
							<Accordion
								className='md:hidden flex p-4 boxBoxShadow rounded-2xl bg-white items-center w-full'
								key={index}
								title={data.title}
								isOpen={true}
							>
								{getBody(data)}
							</Accordion>
							<div className='hidden md:block p-4 boxBoxShadow rounded-2xl bg-white items-center w-full'>
								{getBody(data)}
							</div>
						</>
					))}
				</div>
			</div>
		</div>
	);
};

const getBody = (data: {
	title: string;
	description: string;
	list: Array<{ img: string; text: string }>;
}) => {
	return (
		<div className='flex flex-col gap-8 pt-4 w-full'>
			<p className='font-semibold text-xl min-h-[56px] px-1 text-center hidden md:block'>
				{data.title}
			</p>
			{data.description && <p>{data.description}</p>}
			{data.list.map((imgData, index) => (
				<div key={index} className='flex items-center gap-4 self-start'>
					{/*// TODO: implement ImageHtml namedtransformation*/}
					<Image src={imgData.img} alt='' />
					<p>{imgData.text}</p>
				</div>
			))}
		</div>
	);
};

export default AvantageMecenat;
