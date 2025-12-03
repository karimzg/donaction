import ImageHtml from '@/components/media/ImageHtml';
import React from 'react';
import { KlubProjet } from '@/core/models/klub-project';

const TemplateReference = ({ projet, css }: { projet: KlubProjet; css?: string }) => {
	return (
		projet.isFromTemplate &&
		projet.tmplRef &&
		projet.tmplRef.template_projects_category?.template_projects_library?.uuid !==
			process.env.NEXT_PUBLIC_STANDARD_CATEGORY && (
			<div
				className={`w-fit px-4 py-2 bg-white rounded-xl z-10 boxBoxShadow flex items-center gap-2 ${css}`}
			>
				<ImageHtml
					width={38}
					height={38}
					src={projet.tmplRef?.logo.url || ''}
					alt={projet.tmplRef?.logo.alt || ''}
				/>
				<div className={'flex flex-col gap-[] items-start text-[#033C71] text-[15px]'}>
					<p>Projet soutenu par</p>
					<p className={'font-semibold'}>{projet.tmplRef?.denomination}</p>
				</div>
			</div>
		)
	);
};

export default TemplateReference;
