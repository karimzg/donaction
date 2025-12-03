import { Media } from "@/core/models/club";
import { RichTextBlockEl } from "@/components/RichTextBlock";

export type IStrapiComponent = {
    __component: string;
    id: number;
    [key: string]: any;
}
export type StrapiComponent = IStrapiComponent & {
    titre?: string;
    citations?: Array<StrapiComponentCitation>;
    citation: StrapiComponentCitation;
    partner_item: StrapiComponentPartenaire;
}

export type StrapiComponentCitation = {
    titre: string;
    nom: string;
    citation: Array<RichTextBlockEl>;
    image: Media;
    imgToTheLeft: boolean;
}
export type StrapiComponentPartenaire = {
    title: string;
    image_src: Media;
}
export type StrapiComponentAuteur = {
    nom: string;
    prenom: string;
    fonction: string;
    avatar: Media;
}

export type StrapiComponentChiffres = {
    __component: string;
    id: number;
    chiffre: string;
    label: string;
}
