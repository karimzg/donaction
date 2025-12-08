import React from 'react';
import { manifestData } from '@/partials/mecenatPage/manifestMecenat/consts';
import Image from 'next/image';
import img2 from 'public/images/icons/mecenat/img2.svg';

const ManifestMecenat: React.FC = () => {
	return (
		<div
			style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 123px, 36% 0, 0 123px)' }}
			className='flex flex-col items-center w-full -mt-52 pt-40 pb-72 bg-[#FFFAF7]'
		>
			<div className='flex flex-col items-center gap-10 minMaxWidth md:px-0 px-6 text-center'>
				<h2 className='font-semibold text-xl'>
					Le Manifeste Klubr : Impactons le Pouvoir du Mécénat Sportif
				</h2>
				<p className='md:max-w-[70%]'>
					Bienvenue chez Klubr, la plateforme où chaque don devient un pas vers la victoire, où
					chaque don est un cri de soutien, et où chaque mécène devient le maître d'un héritage
					sportif.
				</p>

				<div className='w-full flex flex-col md:gap-28 gap-10 mt-14'>
					{manifestData.map((manifest, _index) => (
						<div
							key={_index}
							className={`flex gap-10 items-center justify-between ${
								_index % 2 === 0 ? 'md:flex-row flex-col' : 'md:flex-row-reverse flex-col'
							}`}
						>
							<div className='relative flex items-center justify-center'>
								<h3 className='font-medium text-xl z-10'>{manifest.title}</h3>
								<p
									style={{
										color: _index % 2 === 0 ? '#EEA7A7' : '#CED8F2',
									}}
									className={`font-[700] absolute left-0 right-0 mx-auto md:text-[200px] text-[100px]`}
								>
									{manifest.romanNumber}
								</p>
							</div>
							<p className='md:max-w-[60%] text-start'>{manifest.description}</p>
						</div>
					))}
				</div>
				{/*// TODO: implement ImageHtml namedtransformation*/}
				<Image className='my-10' src={img2 as string} alt='' />

				<p className='md:max-w-[70%]'>
					<b>Rejoignez le Mouvement Klubr :</b> nous appelons tous les passionnés de sport, acteurs
					et supporters, les entrepreneurs engagés, les visionnaires du mécénat ; ensemble, écrivons
					l'histoire d'un sport qui transcende les stades et donne toujours plus de sens.
				</p>
			</div>
		</div>
	);
};

export default ManifestMecenat;
