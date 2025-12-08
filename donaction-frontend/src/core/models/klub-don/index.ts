import { Klub } from '@/core/models/club';
import { KlubProjet } from '@/core/models/klub-project';
import { KlubrDonateur } from '@/core/models/klubr-donateur';

export type StatusPayment = 'notDone' | 'pending' | 'success' | 'error';
export type KlubDon = {
	uuid: string;
	montant: number;
	deductionFiscale: number;
	contributionAKlubr: number;
	statusPaiment: StatusPayment;
	estOrganisme: boolean;
	montantAjouteAuMontantTotalDuProjet: boolean;
	datePaiment: string;
	klubDonateur: KlubrDonateur;
	klubr: Klub;
	klub_projet: KlubProjet;
};

export type KlubDonPost = Omit<KlubDon, 'klubDonateur' | 'klubr' | 'klub_projet'> & {
	klubDon: string;
} & { klubr: string } & { klub_projet: string } & { klubDonateur?: string } & {
	formToken?: string;
};
