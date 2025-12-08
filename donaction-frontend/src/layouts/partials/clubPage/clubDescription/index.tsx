import React from 'react';
import './index.scss';
import OurSponsors from 'src/layouts/partials/clubPage/ourSponsors';
import RichTextBlock, { RichTextBlockEl } from '@/components/RichTextBlock';
import ShareCta from '@/components/Share';
import Link from 'next/link';
import { ISponsorList } from '@/core/store/modules/sponsorsSlice';

interface IClubDescription {
	uuid: string;
	klubSlug: string;
	klubName: string;
	title: string;
	description: Array<RichTextBlockEl>;
	ourSponsors: ISponsorList;
}

const ClubDescription: React.FC<IClubDescription> = ({
	uuid,
	klubSlug,
	klubName,
	title,
	description,
	ourSponsors,
}) => {
	return (
		<div className='clubDescription grid grid-cols-1 md:grid-cols-[66%_26%] gap-6 md:gap-0 justify-between lg:items-start items-stretch text-black pt-4 pb-4 lg:flex-row flex-col px-6 md:px-0 w-full'>
			<div className='clubDescription__leftSection w-full h-full'>
				<div className='flex flex-col relative gap-8 items-start justify-center'>
					<h2 className='clubDescription__leftSection__title'>{title}</h2>
					<RichTextBlock data={description} classCss='text-md' />
					<div className='flex items-center justify-center flex-wrap gap-3 w-full sm:justify-start'>
						<Link href='?PAYEMENT_FORM=true' className='btn btn-primary py-[8px]'>
							Je soutiens le Klub
						</Link>
						<ShareCta text={'Soutenez ' + klubName + '!'} />
					</div>
				</div>
			</div>
			<div className='clubDescription__rightSection flex flex-col gap-4 lg:items-start items-center justify-center'>
				<OurSponsors uuid={uuid} initialData={ourSponsors} />
			</div>
		</div>
	);
};

export default ClubDescription;
