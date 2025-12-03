import React from 'react';
import './index.scss';
import { ISponsorshipFormConfig } from '@/partials/sponsorshipForm/logic/useSponsorshipForm';
import alertIcon from '../../../../../../../public/images/icons/alert.svg';
import Image from 'next/image';
import { Tooltip } from 'react-tooltip';
import { TAUX_DEDUCTION_FISCALE_PART, TAUX_DEDUCTION_FISCALE_PRO } from '@/core/constants/dons';

const TaxReduction: React.FC<ISponsorshipFormConfig> = (props) => {
	const calculate = () => {
		const montant = Number(props.defaultValues.montant);
		if (isNaN(montant) || montant < +0) return '0';
		return (
			montant -
			montant *
				(props.defaultValues.estOrganisme
					? TAUX_DEDUCTION_FISCALE_PRO
					: TAUX_DEDUCTION_FISCALE_PART)
		)
			.toFixed(2)
			.replace(/\.00$/, '');
	};

	// todo: Implementer le bon message
	const getHint = (acc: number) => {
		switch (acc) {
			case 1:
				return `Votre don ne vous coûtera que ${calculate()}€ après réduction d'impôts`;
			case 2:
				// TODO to be verified (used or not)
				return !props.defaultValues.estOrganisme
					? `Particulier : vous pouvez bénéficier d'une réduction d'impôt égale à 66 % du
					 montant de votre don, dans la limite de 20 % de votre revenu imposable.`
					: `Entreprise : l’ensemble des versements à ${props.club.denomination} permet
					 de bénéficier d’une réduction d’impôt sur les sociétés de 60 % du montant de ces versements,
					  plafonnée à 20 000 € ou 5 ‰ (5 pour mille) du chiffre d'affaires annuel hors taxe de l’entreprise.
					   En cas de dépassement de plafond, l'excédent est reportable sur les 5 exercices suivants.`;
			default:
				return `Le don à ${props.club.denomination} ouvre droit à une réduction d'impôts car il remplit les conditions
				 		générales prévues aux articles 200 et 238 bis du code général des impôts.`;
		}
	};

	return (
		<div className='taxReductionContainer flex flex-col gap-2 md:mx-12'>
			<div
				data-tooltip-id='priceAfterTax'
				className='flex flex-col items-center gap-2 font-semibold text-lg mt-6 self-center cursor-pointer'
			>
				<div className='flex flex-wrap justify-center items-center gap-1'>
					<p className='text-center'>Coût après réduction d'impôts :</p>
					<Image width={25} height={25} src={alertIcon} alt={''} />
				</div>
				<p className='px-10 py-2 rounded-md ml-2 bg-[#F4F4F4]'>{calculate()}&nbsp;€</p>
			</div>
			<Tooltip id='priceAfterTax'>
				<h3 className={'text-xl mb-2'}>Réduction d'impôts</h3>
				<div className={'min-[767px]:max-w-[50vw] max-[767px]:max-w-[88vw]'}>
					<p>
						Le don à <b>{props.club.denomination}</b> ouvre droit à une réduction d'impôts car il
						remplit les conditions générales prévues aux articles 200 et 238 bis du code général des
						impôts.
					</p>
				</div>
			</Tooltip>
		</div>
	);
};

export default TaxReduction;
