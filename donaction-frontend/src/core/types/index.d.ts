import { Media } from '@/core/models/club';

export type RegularPage = {
	frontmatter: {
		title: string;
		image: string;
		description: string;
		meta_title: string;
		draft: boolean;
		layout: boolean;
		supports: { type: string; email: string; mobile: string }[];
		funfacts: {
			subtitle: string;
			title: string;
			description: string;
			features: { count: number; desc: string; unit: string }[];
		};
	};
	content: string;
	slug?: string;
};

export type About = {
	frontmatter: {
		title: string;
		image: string;
		description: string;
		meta_title: string;
		draft: boolean;
		goals: {
			title: string;
			subtitle: string;
		}[];
		funfacts: {
			subtitle: string;
			title: string;
			description: string;
			features: { count: number; desc: string; unit: string }[];
		};
		team: {
			title: string;
			subtitle: string;
			button: Button;
			members: {
				avatar: string;
				name: string;
				content: string;
				socials: Socials[];
			}[];
		};
	};
	content: string;
	slug?: string;
};

export type Post = {
	frontmatter: {
		title: string;
		date: Date;
		author_avatar: string;
		image: string;
		author: string;
		author_avatar: string;
		categories: string[];
		tags: string[];
		meta_title?: string;
		draft: boolean;
		slug?: string;
	};
	slug?: string;
	content?: string;
};

export type Author = {
	frontmatter: {
		title: string;
		email: string;
		image?: string;
		description?: string;
		meta_title?: string;
		socials: Socials[];
	};
	content?: string;
	slug?: string;
};

export type Feature = {
	title: string;
	subtitle: string;
	description: string;
	button: {
		label: string;
		enable: boolean;
		link: string;
	};
	list: {
		title: string;
		icon: string;
		description: string;
	}[];
};

export type Testimonial = {
	content?: string;
	slug?: string;
	frontmatter: {
		enable?: boolean;
		title: string;
		subtitle: string;
		description?: string;
		list: {
			name: string;
			designation: string;
			avatar: string;
			company_logo: string;
			title: string;
			content: string;
		}[];
	};
};

export type Call_to_action = {
	frontmatter: {
		enable: boolean;
		title: string;
		support: {
			lable: string;
			list: { icon: string; link: string }[];
		};
		image: string;
		buttons: {
			primary: Button;
			secondary: Button;
		};
	};
	content?: string;
};

export type Button = {
	enable: boolean;
	label: string;
	link: string;
};

export type Projects = {
	title: string;
	subtitle: string;
	description: string;
	features: { count: number; desc: string; unit: string }[];
};

export type Blogs = {
	title: string;
	subtitle: string;
	button: Button;
	list: {
		title: string;
		desc: string;
		profile: string;
		name: string;
		logo: string;
		img: string;
		designator: string;
	}[];
};

export type techonoliges = {
	frontmatter: {
		title: string;
		icon: string;
		description: string;
		meta_title?: string;
		draft: boolean;
	};
	content: string;
	slug: string;
};

export type OpenPosition = {
	frontmatter: {
		title: string;
		description: string;
		location: string;
		type: string;
		draft: boolean;
	};
	slug: string;
	content: string;
};

export type faq = {
	frontmatter: {
		enable: boolean;
		subtitle: string;
		title: string;
		description?: string;
		faqs: { title: string; body: string }[];
	};
};

export type Socials = {
	name?: string;
	link?: string;
	icon: string;
};

export type Process = {
	title: string;
	subtitle: string;
	description: string;
	list: {
		title: string;
		description: string;
		image: string;
	}[];
};

export interface IDon {
	createdAt: string;
	id: number;
	datePaiment: string;
	estOrganisme: boolean;
	statusPaiment: string;
	montant: number;
	deductionFiscale: number;
	contributionAKlubr: number;
	uuid: string;
	attestationNumber: any;
	updatedAt: string;
	publishedAt: string;
	klubDonateur: KlubDonateur;
	klub_projet: KlubProjet;
	klubr: {
		id: number;
		denomination: string;
		slug: string;
		logo: Media;
	};
	klub_don_contribution?: IDon;
	withTaxReduction?: boolean;
}

interface KlubDonateur {
	id: number;
	nom: string;
	prenom: string;
	civilite: string;
	email: string;
	donateurType: string;
	raisonSocial: any;
	SIREN: any;
	formeJuridique: any;
	tel: any;
	adresse: string;
	adresse2: string;
	cp: string;
	ville: string;
	pays: string;
	dateNaissance: string;
	optInAffMontant: boolean;
	optInAffNom: boolean;
	uuid: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	avatar: any;
	logo: any;
}

interface KlubProjet {
	id: number;
	titre: string;
	slug: string;
	montantTotalDonations: number;
	montantAFinancer: number;
}
