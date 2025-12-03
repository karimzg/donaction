import React from 'react';
import Image from 'next/image';
import img1 from '../../../../../public/images/icons/descriptionMecenat/descriptionMecenat1.svg';
import img2 from '../../../../../public/images/icons/descriptionMecenat/descriptionMecenat2.svg';
import img3 from '../../../../../public/images/icons/descriptionMecenat/descriptionMecenat3.svg';
import Quote from '@/partials/clubPage/quote';

const DescriptionMecenat: React.FC<{}> = () => {
	return (
		<div className='flex flex-col gap-10 w-full minMaxWidth md:px-0 px-6'>
			<h1 className='self-center font-semibold text-2xl'>
				Le Mécénat Sportif : un acte de générosité au service du sport
			</h1>
			<div className='flex flex-col gap-4 text-md'>
				<p>
					Le mécénat est un acte philanthropique qui se traduit par le versement d’un don à un
					organisme d’intérêt général. Si le bénéficiaire du don est éligible au mécénat déductible,
					le don ouvre droit pour les donateurs (particuliers et entreprises) à des avantages
					fiscaux.
				</p>
				<p>
					<b>Pour les particuliers,</b> l’article 200 du code général des impôts dispose qu’«
					ouvrent droit à{' '}
					<b>
						une réduction d'impôt sur le revenu égale à 66 % de leur montant les sommes prises dans
						la limite de 20 % du revenu imposable qui correspondent à des dons et versements[…] au
						profit d'œuvres ou d'organismes d'intérêt général ayant un caractère
					</b>{' '}
					philanthropique, éducatif, scientifique, social, humanitaire, sportif, familial, culturel…
					».
				</p>
				<p>
					<b>Pour les entreprises assujetties</b> à l'impôt sur le revenu ou à l'impôt sur les
					sociétés, ces dons ouvrent droit à{' '}
					<b>
						une réduction d'impôt égale à 60 % de leur montant, pris dans la limite de 10 000 € ou
						de 5 pour mille du chiffre d'affaires lorsque ce dernier montant est plus élevé,
					</b>{' '}
					article 238 bis du CGI).
				</p>
			</div>
			{/*// TODO: implement ImageHtml namedtransformation*/}
			<Image className='self-center my-6' src={img1 as string} alt={''} />
			<Quote owner='' text='Le sport unit, le don renforce !' textSize='text-lg' />
			<div className='flex gap-10 justify-between items-center lg:flex-row flex-col'>
				<div className='flex flex-col gap-4'>
					<h2 className='text-xl font-semibold'>
						Le mécénat n’est pas du sponsoring, c’est bien plus !
					</h2>
					<p>
						Le mécénat et le sponsoring sont deux approches différentes de financement des
						associations sportives. Chacune a ses avantages et ses inconvénients. Le mécénat est un
						acte désintéressé, motivé par une orientation philanthropique alors que le sponsoring
						(parrainage sportif) est un acte commercial qui nécessite une contrepartie équivalente.
					</p>
					<p>
						Les mécènes sont souvent prêts à contribuer financièrement sans attendre en retour une
						quelconque promotion ou exposition directe, ce qui est un avantage pour les clubs.
					</p>
					<p>
						Le mécénat est par ailleurs souvent basé sur un engagement à plus long terme, les
						mécènes pouvant être motivés à accompagner plus durablement, plutôt que par des
						objectifs publicitaires à court terme. Le mécénat doit apporter plus de pérennité
						financière pour les clubs.
					</p>
					<p>
						Le mécénat peut aussi offrir plus de liberté créative tant dans la manière dont elles
						utilisent les dons que dans la manière de promouvoir le mécène. Il est aussi moins
						dépendant des résultats sportifs.
					</p>
					<p>
						Le sponsoring répond bien sûr à des besoins mais vous l’aurez compris, chez Klubr, nous
						sommes fans du mécénat pour construire des relations plus profondes et durables entres
						partenaires et clubs.
					</p>
				</div>
				<Image className='md:max-w-[30%] max-w-[80%] self-center' src={img2} alt={''} />
			</div>
			<Quote
				owner=''
				text='Le mécénat sportif, le partenariat gagnant/gagnant. '
				textSize='text-lg'
			/>
			<div className='flex gap-10 justify-between items-center lg:flex-row flex-col'>
				<Image className='md:max-w-[30%] max-w-[80%] self-center' src={img3} alt={''} />

				<div className='flex flex-col gap-4'>
					<h2 className='text-xl font-semibold'>
						Le mécénat : une solution de financement évidente et performante pour les associations
						sportives
					</h2>
					<p>
						Le mécénat permet d’augmenter les ressources financières des clubs, de créer du lien et
						d’engager une communauté, de valoriser les marques « club » et d’apporter une visibilité
						à ses partenaires. Il offre un impact direct et mesurable.
					</p>
					<p>
						Le mécénat sportif, c’est non seulement soutenir mais également donner du sens à ses
						engagements.
					</p>
				</div>
			</div>
		</div>
	);
};

export default DescriptionMecenat;
