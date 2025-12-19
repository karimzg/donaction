import React from 'react';
import Image from 'next/image';
import img3 from '../../../../../public/images/icons/mecenat/img3.svg';

const Conclusion: React.FC = () => {
	return (
		<div
			style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 123px, 36% 0, 0 123px)' }}
			className='flex flex-col items-center w-full -mt-52 pt-40 pb-72 bg-white'
		>
			<div className='flex flex-col items-center gap-10 md:px-0 px-6 text-center minMaxWidth'>
				{/*// TODO: implement ImageHtml namedtransformation*/}
				<Image src={img3 as string} alt={''} />
				<h2 className='font-semibold text-xl'>Conclusion : Vers un futur brillant avec le Mécénat</h2>
				<p>
					Citroque rapiunt aut inmorantur celeri momento citroque tamen quicquid citroque parvi
					vastabant vastabant hostes milvorum parvi si dispexerint temporis volatu quicquid citroque
					nisi volatu celsius qui aut nec aut praedam ultro nisi volatu milvorum tamen impetraverint
					poterat dispexerint rapiunt aut hostes momento quicquid impetraverint parvi rapiunt
					vastabant impetraverint celeri ultro. Citroque rapiunt aut inmorantur celeri momento citro
				</p>
				<p className='font-medium'>
					Prêt pour un avenir prospère ? Rejoignez notre communauté de clubs et mécènes dès
					maintenant !
				</p>
				<button className='btn btn-primary'>Rejoignez notre communauté</button>
			</div>
		</div>
	);
};

export default Conclusion;
