import { EntityComponentModel, EntityIdModel, EntityModel } from "./misc";

export interface ImageAttributes extends EntityIdModel {
  id: number;
  attributes: {
    name: string;
    alternativeText: string;
    caption: string;
    width: number;
    height: number;
    formats: string;
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl: string;
    provider: string;
    provider_metadata: string;
    related: {
      data: Array<{
        id: number;
        attributes: Record<string, any>;
      }>;
    };
    folder: {
      data: {
        id: number;
        attributes: Record<string, any>;
      };
    };
    folderPath: string;
    createdAt: string;
    updatedAt: string;
    createdBy: {
      data: {
        id: number;
        attributes: Record<string, any>;
      };
    };
    updatedBy: {
      data: {
        id: number;
        attributes: Record<string, any>;
      };
    };
  };
}

export interface Citation extends EntityIdModel {
  id: number;
  citation: string;
  nom: string;
  image: {
    data: ImageAttributes;
  };
  imgToTheLeft: boolean;
}

export interface ClubPresentationItem extends EntityComponentModel {
  id: number;
  __component: string;
  citation?: Citation;
  titre?: string;
  citations?: Array<Citation>;
  description?: string;
  partner_item?: Array<{
    id: number;
    title: string;
    image_src: {
      data: ImageAttributes;
    };
  }>;
  acces?: string;
  emailContact?: string;
  telContact?: string;
  googleMap?: string;
  adresseComplete?: string;
  fcb_link?: string;
  inst_link?: string;
  linkedin_link?: string;
}

export interface Chiffre extends EntityComponentModel {
  id: number;
  __component: string;
  chiffre: number;
  label: string;
}

export interface Data extends EntityModel {
  uuid: string;
  title: string;
  club_presentation: Array<ClubPresentationItem>;
  couvertureMedia: string | number;
  klubr: string | number;
  primary_color: string;
  secondary_color: string;
  chiffres: Array<Chiffre>;
  description: string;
  header_text_color: string;
  metaDescription: string;
}

export interface KlubrHouse {
  data: Data;
}
