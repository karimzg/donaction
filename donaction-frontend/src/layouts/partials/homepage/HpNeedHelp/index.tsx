import ScrollAnimator from '@/components/ScrollAnimator';
import { FaqI } from '@/core/models/hp';
import { SITE_URL } from '@/core/services/endpoints';
import getPathname from '@/core/helpers/getPathname';
import richTextToPlainText from '@/core/helpers/richTextToPlainText';
import FaqAccordion from './FaqAccordion';
import './index.scss';

type HpNeedHelpProps = {
	faq?: FaqI;
};

export default function HpNeedHelp({ faq }: HpNeedHelpProps) {
	if (!faq?.faq_item?.length) return null;

	const pathname = getPathname();

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		url: `${SITE_URL}/${pathname}`,
		mainEntity: faq.faq_item.map((_) => ({
			'@type': 'Question',
			name: _.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: richTextToPlainText(_.answer),
			},
		})),
	};

	return (
		<section className="hp-needhelp w-full py-16 md:py-20 lg:py-24">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<div className="max-w-[1320px] mx-auto px-6">
				<ScrollAnimator className="hp-needhelp__wrapper">
					<div className="hp-needhelp__header text-center mb-12 md:mb-16">
					<h2 className="hp-needhelp__title text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
						{faq.title || 'Questions fr\u00e9quentes'}
					</h2>
					{faq.subtitle && (
						<p className="hp-needhelp__subtitle text-gray-500 text-base md:text-lg max-w-2xl mx-auto">
							{faq.subtitle}
						</p>
					)}
				</div>
				<FaqAccordion faqItems={faq.faq_item} />
				</ScrollAnimator>
			</div>
		</section>
	);
}
