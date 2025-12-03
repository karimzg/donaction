import React from 'react';
import FaqItems from '@/partials/common/faqItems';
import { FaqI } from '@/core/models/hp';
import { SITE_URL } from '@/core/services/endpoints';
import { headers } from 'next/headers';
import { RichTextBlockEl } from '@/components/RichTextBlock';

const getPathname = () => {
	try {
		const headersList = headers();
		return headersList.get('x-custom-pathname') || '';
	} catch (e: any) {
		return typeof window !== 'undefined' ? document?.location.pathname : '';
	}
};

const NeedHelp: React.FC<{
	// GETTER?: () => Promise<{ data: { attributes: { FAQ: FaqI } } }>;
	list: FaqI;
	bgColor?: string;
}> = ({ list, bgColor = '#FBFBFB' }) => {
	let faq: FaqI | undefined = list;
	const pathname = getPathname();

	// if (!faq && GETTER) {
	// 	try {
	// 		const res = await GETTER();
	// 		faq = res.data.attributes.FAQ;
	// 	} catch (e) {
	// 		console.log(e, 'Error fetching faq list');
	// 	}
	// }

	const getAnswer = (data: Array<RichTextBlockEl>) => {
		let res = '';
		data.forEach((_) => {
			if (_.type === 'text') {
				res += ' ' + _.text;
				return;
			}
			res += ' ' + getAnswer(_.children);
		});
		return res;
	};

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		url: `${SITE_URL}/${pathname}`,
		mainEntity: [
			...(faq?.faq_item?.map((_) => ({
				'@type': 'Question',
				name: _.question,
				acceptedAnswer: {
					'@type': 'Answer',
					text: getAnswer(_.answer),
				},
			})) || []),
		],
	};

	return (
		faq?.faq_item?.length && (
			<div
				style={{
					clipPath: 'polygon(0 100%, 100% 100%, 100% 123px, 36% 0, 0 123px)',
					backgroundColor: bgColor,
				}}
				className={`flex flex-col items-center w-full -mt-52 pt-40 pb-56 -mb-56`}
			>
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
				<div className='flex flex-col items-center gap-10 minMaxWidth md:px-0 px-6 text-center'>
					<div className='mb-10'>
						<h2 className='font-semibold text-xl'>{faq?.title || 'Besoin d’aide ?'}</h2>
						{faq?.subtitle && <h3 className=''>{faq?.subtitle}</h3>}
					</div>
					{faq && <FaqItems faqItems={faq.faq_item} />}
				</div>
			</div>
		)
	);
};

export default NeedHelp;
