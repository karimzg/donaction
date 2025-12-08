'use client';
import { ISectionStrapi } from '@/partials/common/sections/managersWordSection';
import { StrapiComponent } from '@/core/models/strapi-component';
import ImageHtml from '@/components/media/ImageHtml';
import Link from 'next/link';
import React from 'react';

export default function PartnersSection({ list, primaryColor }: ISectionStrapi) {
	const GetTag: React.FC<React.PropsWithChildren<{ link?: string }>> = (props) => {
		return props.link ? (
			<Link target='_blank' href={props.link}>
				{props.children}
			</Link>
		) : (
			<div>{props.children}</div>
		);
	};
	return list ? (
		<div className='flex flex-col gap-10 px-6 md:p-0 w-full mb-10'>
			<h2 className='font-semibold text-2xl text-black md:max-w-[41%] max-w-full'>
				Ils <span style={{ color: primaryColor }}>nous</span> <br />
				<span style={{ color: primaryColor }}>soutiennent</span> dèjà
			</h2>
			<div className={`flex flex-row w-full items-center justify-evenly flex-wrap p-4 gap-6`}>
				{list?.map((item: StrapiComponent, index: number) => {
					return (
						!!item.logo && (
							<GetTag link={item?.link} key={item?.id}>
								<ImageHtml
									className={'max-w-[180px]'}
									key={index}
									width={(item.logo?.width * 80) / (item.logo?.height || 80)}
									height={80}
									src={item.logo?.url || item.logo?.data?.attributes?.url || ''}
									alt={
										item.logo?.alternativeText ||
										item.logo?.data?.attributes?.alternativeText ||
										'Partenaire'
									}
									namedtransformation={'partner'}
									nosizes={true}
								/>
							</GetTag>
						)
					);
				})}
			</div>
			<hr />
		</div>
	) : (
		<></>
	);
}
