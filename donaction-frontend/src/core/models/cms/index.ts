import { StrapiComponent } from '@/core/models/strapi-component';
import { RichTextBlockEl } from '@/components/RichTextBlock';

export interface IMetadata {
	metaTitle: string;
	metaDescription: string;
}

export interface IPageCookies extends IMetadata {
	titre: string;
	contenu: RichTextBlockEl[];
}
export interface IPageCGU extends IMetadata {
	titre: string;
	content: RichTextBlockEl[];
}
