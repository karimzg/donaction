'use client';

import Accordion from '@/partials/common/accordion';
import RichTextBlock from '@/components/RichTextBlock';
import React, { useState } from 'react';
import { FaqItemsType } from '@/core/models/hp';

const FaqItems: React.FC<{ faqItems: FaqItemsType }> = (props) => {
	const [selected, setSelected] = useState<number>(props.faqItems[0]?.id || NaN);
	const toggle = (id: number) => {
		setSelected(id === selected ? NaN : id);
	};

	return props.faqItems.map((faq, _index) => (
		<Accordion
			toggle={() => toggle(faq.id)}
			className='border-black border-b-[1px]'
			title={faq.question}
			isOpen={faq.id === selected}
			key={_index}
		>
			<RichTextBlock data={faq.answer} />
		</Accordion>
	));
};

export default FaqItems;
