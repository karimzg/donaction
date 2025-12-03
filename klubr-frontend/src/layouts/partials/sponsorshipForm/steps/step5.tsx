import React from 'react';
import { Klub } from '@/core/models/club';
import ShareCta from '@/components/Share';
import { KlubProjet } from '@/core/models/klub-project';
import Link from 'next/link';
import ImageHtml from '@/components/media/ImageHtml';

const Step5 = ({ club, projet, email }: { club: Klub; projet?: KlubProjet; email: string }) => {
	const text = projet
		? `Soutenez le projet "${projet.titre}" (${club.denomination})`
		: `Soutenez ${club.denomination}`;
	return (
		<div className='w-full flex flex-col items-center gap-16 text-sm'>
			<div className="flex flex-col items-center gap-2">
				<p className='font-bold'>Votre soutien a bien été pris en compte.</p>
				<p className='text-6xl tracking-widest'>MERCI</p>
			</div>
			<div className="flex flex-col items-center gap-2">
				<ImageHtml
					src={club?.logo?.url}
					alt={club?.logo?.alt}
					width={club?.logo?.width / club?.logo?.height * 70}
					height={70}
					namedtransformation={'logo'}
					className={'h-[70px]'}
				/>
				<p className='text-center'>
					Toute l’équipe de <b>{club.denomination}</b> vous remercie de votre précieux soutien.
				</p>
			</div>
			<Link className={'btn btn-primary'} href={`/mes-dons?email=${email}`}>
				Retrouver mes dons
			</Link>
			<div className="flex flex-col items-center gap-6">
				<p className='md:mt-2 mt-2 text-center'>
					Permettez à vos amis de soutenir <b>{club.denomination}</b> en partageant ses projets
				</p>
				<ShareCta text={text}/>
			</div>
		</div>
	);
};

export default Step5;
