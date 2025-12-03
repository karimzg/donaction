import { Media } from '@/core/models/club';
import { KlubDon } from '@/core/models/klub-don';

export type KlubrDonateur = {
	uuid: string;
	logo: Media;
	avatar: Media;
	civilite: 'Madame' | 'Monsieur';
	prenom: string;
	nom: string;
	email: string;
	donateurType: 'Particulier' | 'Organisme';
	raisonSocial: string;
	SIREN: string;
	formeJuridique: string;
	tel: string;
	adresse: string;
	adresse2: string;
	cp: string;
	ville: string;
	pays: string;
	dateNaissance: Date;
	optInAffMontant: boolean;
	optInAffNom: boolean;
	klubDon: KlubDon;
	users_permissions_user: any;
};

export type KlubrDonateurPost = Omit<KlubrDonateur, 'klubDon'> & { klubDon: string };
