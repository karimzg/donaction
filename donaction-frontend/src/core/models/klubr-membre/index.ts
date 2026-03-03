import { Media } from "@/core/models/club";

export type KlubrMembreRole =
    | 'Admin'
    | 'AdminEditor'
    | 'NetworkLeader'
    | 'KlubMemberLeader'
    | 'KlubMember';

export type KlubrMembre = {
    uuid: string;
    nom: string;
    prenom: string;
    fonction: string;
    avatar: Media;
    role?: KlubrMembreRole;
    klubr?: {
        uuid?: string;
        denomination?: string;
        slug?: string;
    };
    klub_projets: {
        count: number;
    }
}
