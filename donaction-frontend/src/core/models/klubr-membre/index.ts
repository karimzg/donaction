import { Media } from "@/core/models/club";

export type KlubrMembre = {
    uuid: number;
    nom: string;
    prenom: string;
    fonction: string;
    avatar: Media;
    klub_projets: {
        count: number;
    }
}
