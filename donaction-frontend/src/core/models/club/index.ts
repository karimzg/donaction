import { StrapiComponent, StrapiComponentChiffres } from '@/core/models/strapi-component';
import { RichTextBlockEl } from '@/components/RichTextBlock';

export type NavSlugs = {
	slug: string;
	label: string;
};
export type Media = {
	url: string;
	alt: string;
	alternativeText: string;
	width: number;
	height: number;
	formats: any;
	ext: string;
	mime: string;
	provider: string;
};
export type Klub = {
	uuid: string;
	slug: string;
	denomination: string;
	slogan: string;
	federation: string;
	siegeSocialAdresse: string;
	siegeSocialAdresse2: string;
	siegeSocialCP: string;
	siegeSocialPays?: string;
	siegeSocialVille: string;
	associationType: string;
	sportType: string;
	acronyme: string;
	logo: Media;
	klubr_house: KlubHouseLight;
	klub_projets?: {
		count: number;
	};
	nbProjects?: number;
	status?: string;
	donationEligible?: boolean;
	hasRescritFiscal?: boolean;
};

export type KlubHouseLight = {
	uuid: string;
	header_text_color: string;
	footer_text_color: string;
	primary_color: string;
	secondary_color: string;
};

export type KlubHouse = KlubHouseLight & {
	title: string;
	club_presentation: Array<StrapiComponent>;
	couvertureMedia: Media;
	poster_media?: Media;
	klubr: Klub;
	chiffres: Array<StrapiComponentChiffres>;
	description: Array<RichTextBlockEl>;
	metaDescription: string;
	partnerList?: Array<StrapiComponent>;
};
