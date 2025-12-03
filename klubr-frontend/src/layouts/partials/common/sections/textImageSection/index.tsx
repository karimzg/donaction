import { ISectionStrapi } from '@/partials/common/sections/managersWordSection';
import RichTextBlock from '@/components/RichTextBlock';
import ImageHtml from '@/components/media/ImageHtml';
import './index.scss';

export default function TextImageSection({component}: ISectionStrapi) {
    return component ? (
        <div
            className={`txt-image-section flex gap-8 justify-between items-start text-black py-4 mb-20 lg:flex-row flex-col px-6 md:px-0 ${
                component?.imgToTheLeft && 'lg:flex-row-reverse flex-col-reverse'
            }`}
        >
            <div className='flex flex-col gap-4 items-start justify-center lg:min-w-[50%] lg:max-w-[50%] w-full'>
                {component?.titre && <h2 className='text-3xl font-semibold'>{component.titre}</h2>}
                {component?.texte && <RichTextBlock data={component?.texte} classCss={'text-md'}/>}
            </div>
            <div
                className='txt-image-section__image flex flex-col gap-4 lg:items-start items-center justify-center w-full'>
                <ImageHtml
                    className={`w-full h-full object-cover rounded-3xl`}
                    width={589}
                    height={415}
                    src={component?.image?.url || component?.image?.data?.attributes?.url || ''}
                    alt={
                        component?.image?.alternativeText ||
                        component?.image?.data?.attributes?.alternativeText ||
                        'Section image'
                    }
                    namedtransformation={'col50'}
                    nosizes={true}
                />
            </div>
        </div>
    ) : (
        <></>
    );
}
