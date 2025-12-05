import { ISectionStrapi } from '@/partials/common/sections/managersWordSection';
import { StrapiComponentCitation } from '@/core/models/strapi-component';
import Quote from '@/partials/clubPage/quote/_index';

export default function QuoteSection({ component, primaryColor, klub }: ISectionStrapi) {
	return component ? (
		<div className='flex flex-col items-start gap-8 px-6 md:p-0 w-full mb-20'>
			<h2 className='font-semibold text-3xl text-black md:max-w-[41%] max-w-full'>
				Pourquoi aiment-ils <br />
				<span style={{ color: primaryColor }}>{component?.titre || klub?.denomination} ?</span>
			</h2>
			<div className='grid md:grid-cols-2 grid-cols-1 md:gap-6 gap-12'>
				{component?.citations?.map((_: StrapiComponentCitation, index: number) => (
					<Quote key={index} owner={_.nom} richText={_.citation} type='grid' />
				))}
			</div>
		</div>
	) : (
		<></>
	);
}
