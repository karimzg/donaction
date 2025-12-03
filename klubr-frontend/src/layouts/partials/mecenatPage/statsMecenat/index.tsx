import React from 'react';
import Image from 'next/image';
import img1 from 'public/images/icons/mecenat/img1.svg';
const StatsMecenat: React.FC = () => {
	return (
		<div
			style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 123px, 36% 0, 0 123px)' }}
			className='flex flex-col items-center w-full -mt-52 pt-40 pb-72 bg-white'
		>
			<div className='flex flex-col items-center gap-10 mx-2 md:px-0 px-6 text-center'>
				<h2 className='font-semibold text-xl'>Le mécénat en quelques chiffres</h2>
				<p>
					Citroque rapiunt aut inmorantur celeri momento citroque tamen quicquid citroque parvi
					vastabant
				</p>
				{/*// TODO: implement ImageHtml namedtransformation*/}
				<Image src={img1 as string} alt={''} />
				<p>Un particulier qui donne 100€ avec un Klub offrant une contrepartie</p>
			</div>
		</div>
	);
};

export default StatsMecenat;
