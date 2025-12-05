import { ISectionStrapi } from '@/partials/common/sections/managersWordSection';
import RichTextBlock from '@/components/RichTextBlock';
import GMaps from '@/partials/clubPage/gMaps';

export default function LocalizationSection({ component }: ISectionStrapi) {
	return component ? (
		<div className='text-black grid md:grid-cols-3 grid-cols-1 gap-6 px-6 md:p-0 w-full mb-20'>
			<div className='flex flex-col gap-2'>
				<h2 className='font-semibold text-2xl mb-2'>{component.titre}</h2>
				{component.adresseComplete && <RichTextBlock data={component.adresseComplete} />}
				{component.acces && <RichTextBlock data={component.acces} />}
				<h2 className='font-semibold text-2xl mt-4 mb-2'>Contactez-nous</h2>
				{(component.emailContact || component.telContact) && (
					<p>
						{component.emailContact} <br />
						{component.telContact}
					</p>
				)}
			</div>
			<div className='rounded-2xl overflow-hidden min-h-[350px] col-span-2'>
				{!!component.googleMap && (
					<GMaps center={{ lat: component.googleMap?.lat, lng: component.googleMap?.lng }} />
				)}
			</div>
		</div>
	) : (
		<></>
	);
}
