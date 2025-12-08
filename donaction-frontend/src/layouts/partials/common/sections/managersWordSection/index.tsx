import { StrapiComponent } from '@/core/models/strapi-component';
import { Klub, KlubHouse } from '@/core/models/club';
import Quote from '@/partials/clubPage/quote/_index';

export interface ISectionStrapi {
	component?: StrapiComponent;
	list?: Array<StrapiComponent>;
	primaryColor?: string;
	secondaryColor?: string;
	textColor?: string;
	klub?: Klub;
	klubHouse?: KlubHouse;
}
export default function ManagersWordSection({
	component,
	textColor,
	primaryColor,
	secondaryColor,
}: ISectionStrapi) {
	return component ? (
		<div className='flex flex-col gap-8 px-6 md:p-0 w-full mb-20'>
			<h2 className='font-semibold text-3xl text-black'>
				Une vision portée <br />
				par <span style={{ color: primaryColor }}>{component?.titre}</span>
			</h2>
			<Quote
				primaryColor={primaryColor}
				secondaryColor={secondaryColor}
				textColor={textColor}
				owner={component?.citation.nom || ''}
				richText={component?.citation.citation}
				textSize={'text-2xl'}
			/>
		</div>
	) : (
		<></>
	);
}
