import { Klub, Media } from '@/core/models/club';
import { KlubrMembre } from '@/core/models/klubr-membre';
import { RichTextBlockEl } from '@/components/RichTextBlock';
import { KlubDon } from '@/core/models/klub-don';
import { StrapiComponent } from '@/core/models/strapi-component';

export type KlubProjet = {
    uuid: string;
    slug: string;
    titre: string;
    couverture: Media;
    montantAFinancer: number;
    dateLimiteFinancementProjet: Date;
    startDate: Date;
    descriptionCourte: Array<RichTextBlockEl>;
    presentationTitre: string;
    presentationDescription: Array<RichTextBlockEl>;
    montantTotalDonations: number;
    nbDons: number;
    sportType: string;
    contenu: Array<StrapiComponent>;
    realisations: Array<StrapiComponent>;
    klubr_membre?: KlubrMembre;
    klubr: Klub;
    klub_dons: Array<KlubDon>;
    metaDescription: string;
    status?: string;
    isFromTemplate?: boolean;
    tmplRef?: {
        logo: Media;
        denomination: string;
        uuid: string;
        template_projects_category?: {
            template_projects_library?: {
                uuid: string;
            };
        };
    };
};
