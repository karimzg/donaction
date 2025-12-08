import { ISectionStrapi } from '@/partials/common/sections/managersWordSection';
import KlubrLogo from '@/components/KlubrLogo';
import RichTextBlock from '@/components/RichTextBlock';
import Image from 'next/image';
import KlubrAccompagne from '../../../../../../public/images/klubrAccompagne.svg';

export default function KlubrSupportSection({
	component,
	primaryColor,
	klub,
	klubHouse,
}: ISectionStrapi) {
	return component ? (
		<div className='flex flex-col items-start gap-8 text-black px-6 md:p-0 w-full mb-20'>
			<div className='font-semibold text-3xl flex flex-col items-start justify-start gap-2 md:max-w-[41%] max-w-full'>
				<h2 className='flex items-center justify-start gap-2'>
					<span>Pourquoi</span>
					<KlubrLogo width={104} dotBg={'#FFFFFF'} context={'why'}></KlubrLogo>
				</h2>
				<p>accompagne</p>
				<p style={{ color: primaryColor }}>{component?.titre}</p>
			</div>
			<div className='md:grid md:grid-cols-2 flex flex-col-reverse gap-6 justify-items-center justify-center w-full'>
				<RichTextBlock data={component?.description} classCss='text-md text-start pt-8' />
				<Image src={KlubrAccompagne as string} alt={'Klubr accompagne'} />
			</div>
		</div>
	) : (
		<></>
	);
}
