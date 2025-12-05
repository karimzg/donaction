import { StrapiComponent } from '@/core/models/strapi-component';
import { RichTextBlockEl } from '@/components/RichTextBlock';
import { IMetadata } from "@/core/models/cms";

export interface IHpResult extends IMetadata {
	titre: string;
	uuid: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	FAQ: FaqI;
	partnerList: StrapiComponent[];
	contenu: StrapiComponent[];
	slider: ISlider[];
}

export interface FaqI {
	id: number;
	title?: string;
	subtitle?: string;
	description?: string;
	faq_item: FaqItemsType;
}
export type FaqItemsType = Array<{
	id: number;
	question: string;
	answer: Array<RichTextBlockEl>;
}>;

export interface ISlider {
	id: number;
	__component: string;
	title: string;
	subTitle: string;
	content: Array<RichTextBlockEl>;
	buttonLink: string;
	buttonLabel: string;
	order: any;
}
