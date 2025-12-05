import React from 'react';
import Image from 'next/image';
import { KlubrMembre } from "@/core/models/klubr-membre";
import RichTextBlock, { RichTextBlockEl } from "@/components/RichTextBlock";

interface IAuthorCard {
	isMiniCard?: boolean;
	member?: KlubrMembre;
	projetNom?: string;
	presentationTitre?: string;
	presentationDescription?: Array<RichTextBlockEl>;
}
const AuthorCard: React.FC<IAuthorCard> = (props) => {
	if (!props.member) {
		return;
	}
	const getName = (membre: KlubrMembre) => {
		return membre.prenom + (membre.nom && ` ${membre.nom}`);
	};
	return (
		<div
			className={`flex flex-col p-4 boxBoxShadow rounded-2xl relative max-[480px]:w-full ${
				props.isMiniCard ? 'p-0 py-1 cursor-pointer' : 'max-[767px]:w-full'
			}`}
		>
			{props.member.avatar && (<Image
				src={props.member.avatar?.url}
				width={111}
				height={111}
				alt={props.member.avatar.alternativeText || `Porteur du projet "${props.projetNom}"`}
				className={`rounded-full object-cover w-[80px] h-[80px] absolute -left-3 -top-3 border-white border-4 boxBoxShadow ${
					props.isMiniCard ? 'w-[85px] h-[85px] -left-3 -top-2' : 'max-[767px]:left-[40%]'
				}`}
			/>)}
			<div
				className={`ml-20 pr-10 leading-tight ${
					props.isMiniCard ? '' : 'max-[767px]:m-0 max-[767px]:mt-16'
				}`}
			>
				<p className={`font-medium ${props.isMiniCard && ''}`}>{getName(props.member)}</p>
				<p className={`${props.isMiniCard && 'text-[16px]'}`}>{props.member.fonction}</p>
				{props.member.klub_projets?.count && <p className={`${props.isMiniCard && 'text-[14px]'}`}>{props.member.klub_projets?.count} projets
					initiés</p>}
			</div>
			{!props.isMiniCard && !!props?.presentationDescription && (
				<RichTextBlock data={props.presentationDescription} classCss='md:p-4 pt-4' />
			)}
		</div>
	);
};

export default AuthorCard;
