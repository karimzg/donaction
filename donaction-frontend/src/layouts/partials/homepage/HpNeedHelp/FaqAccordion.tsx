'use client';

import { useState } from 'react';
import RichTextBlock from '@/components/RichTextBlock';
import { FaqItemsType } from '@/core/models/hp';
import ChevronIcon from './icons/ChevronIcon';

type ItemStyle = React.CSSProperties & { '--item-index': number };
type FaqStyle = React.CSSProperties & { '--faq-count': number };

type FaqAccordionProps = {
	faqItems: FaqItemsType;
};

export default function FaqAccordion({ faqItems }: FaqAccordionProps) {
	const [activeIndex, setActiveIndex] = useState(0);

	const handleQuestionClick = (index: number) => {
		setActiveIndex((prev) => (prev === index ? -1 : index));
	};

	return (
		<div
			className="hp-needhelp__faq"
			style={{ '--faq-count': faqItems.length } as FaqStyle}
		>
			{/* Desktop answer panel background */}
			<div className="hp-needhelp__faq-panel" aria-hidden="true" />

			{faqItems.map((item, index) => {
				const isActive = activeIndex === index;
				return (
					<div
						key={item.id}
						className={`hp-needhelp__faq-item ${
							isActive ? 'hp-needhelp__faq-item--active' : ''
						}`}
						style={{ '--item-index': index } as ItemStyle}
					>
						<button
							className={`hp-needhelp__faq-trigger ${
								isActive ? 'hp-needhelp__faq-trigger--active' : ''
							}`}
							aria-expanded={isActive}
							aria-controls={`faq-answer-${item.id}`}
							onClick={() => handleQuestionClick(index)}
						>
							<span className="hp-needhelp__faq-number">
								{String(index + 1).padStart(2, '0')}
							</span>
							<span className="hp-needhelp__faq-text">
								{item.question}
							</span>
							<ChevronIcon
								className={`hp-needhelp__faq-chevron ${
									isActive ? 'hp-needhelp__faq-chevron--open' : ''
								}`}
							/>
						</button>
						<div
							className={`hp-needhelp__faq-body ${
								isActive ? 'hp-needhelp__faq-body--active' : ''
							}`}
							id={`faq-answer-${item.id}`}
						>
							<div className="hp-needhelp__faq-body-inner">
								<h3 className="hp-needhelp__faq-body-title">
									{item.question}
								</h3>
								<RichTextBlock
									data={item.answer}
									classCss="hp-needhelp__faq-body-content"
								/>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
