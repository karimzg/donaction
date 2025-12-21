import type { Schema, Struct } from '@strapi/strapi';

export interface ClubChiffresChiffres extends Struct.ComponentSchema {
    collectionName: 'components_club_chiffres_chiffres';
    info: {
        description: '';
        displayName: 'Chiffres';
    };
    attributes: {
        chiffre: Schema.Attribute.String & Schema.Attribute.Required;
        label: Schema.Attribute.String & Schema.Attribute.Required;
    };
}

export interface ClubHeaderVideoCouverture extends Struct.ComponentSchema {
    collectionName: 'components_club_header_video_couvertures';
    info: {
        description: '';
        displayName: 'videoCouverture';
        icon: 'play';
    };
    attributes: {
        media: Schema.Attribute.Media<'images' | 'videos', true> &
            Schema.Attribute.Required;
    };
}

export interface ClubPresentationClubPresentation
    extends Struct.ComponentSchema {
    collectionName: 'components_club_presentation_club_presentations';
    info: {
        displayName: 'Liens r\u00E9seaux sociaux';
        icon: 'address-card';
    };
    attributes: {
        fcb_link: Schema.Attribute.String;
        inst_link: Schema.Attribute.String;
        linkedin_link: Schema.Attribute.String;
    };
}

export interface ClubPresentationLocalisation extends Struct.ComponentSchema {
    collectionName: 'components_club_presentation_localisations';
    info: {
        description: '';
        displayName: 'Localisation';
        icon: 'pin';
    };
    attributes: {
        acces: Schema.Attribute.Blocks;
        adresseComplete: Schema.Attribute.Blocks;
        emailContact: Schema.Attribute.Email;
        googleMap: Schema.Attribute.JSON;
        telContact: Schema.Attribute.String;
        titre: Schema.Attribute.String &
            Schema.Attribute.DefaultTo<'O\u00F9 sommes-nous ?'>;
    };
}

export interface ClubPresentationMotDuDirigeant extends Struct.ComponentSchema {
    collectionName: 'components_club_presentation_mot_du_dirigeants';
    info: {
        description: '';
        displayName: 'Mot du Dirigeant';
        icon: 'layer';
    };
    attributes: {
        citation: Schema.Attribute.Component<'composant-atoms.citation', false>;
        titre: Schema.Attribute.String &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<'Mot du pr\u00E9sident'>;
    };
}

export interface ClubPresentationPourquoiKlubrAccompagne
    extends Struct.ComponentSchema {
    collectionName: 'components_club_presentation_pourquoi_klubr_accompagnes';
    info: {
        description: '';
        displayName: 'Pourquoi Klubr accompagne';
        icon: 'seed';
    };
    attributes: {
        description: Schema.Attribute.Blocks & Schema.Attribute.Required;
        titre: Schema.Attribute.String & Schema.Attribute.Required;
    };
}

export interface ClubPresentationSectionCitation
    extends Struct.ComponentSchema {
    collectionName: 'components_club_presentation_section_citations';
    info: {
        description: '';
        displayName: 'SectionCitation';
        icon: 'quote';
    };
    attributes: {
        citations: Schema.Attribute.Component<
            'composant-atoms.citation',
            true
        > &
            Schema.Attribute.Required &
            Schema.Attribute.SetMinMax<
                {
                    min: 1;
                },
                number
            >;
        titre: Schema.Attribute.String;
    };
}

export interface ComposantAtomsAuteur extends Struct.ComponentSchema {
    collectionName: 'components_composant_atoms_auteurs';
    info: {
        displayName: 'Auteur';
        icon: 'user';
    };
    attributes: {
        avatar: Schema.Attribute.Media<'images'>;
        fonction: Schema.Attribute.String;
        nom: Schema.Attribute.String;
        prenom: Schema.Attribute.String;
    };
}

export interface ComposantAtomsCitation extends Struct.ComponentSchema {
    collectionName: 'components_composant_atoms_citations';
    info: {
        description: '';
        displayName: 'Citation';
        icon: 'quote';
    };
    attributes: {
        citation: Schema.Attribute.Blocks & Schema.Attribute.Required;
        nom: Schema.Attribute.String & Schema.Attribute.Required;
    };
}

export interface ComposantAtomsFaqItem extends Struct.ComponentSchema {
    collectionName: 'components_club_presentation_faq_items';
    info: {
        description: '';
        displayName: 'FAQ - Question';
        icon: 'question';
    };
    attributes: {
        answer: Schema.Attribute.Blocks & Schema.Attribute.Required;
        question: Schema.Attribute.String & Schema.Attribute.Required;
    };
}

export interface ComposantAtomsPartnerItem extends Struct.ComponentSchema {
    collectionName: 'components_composant_atoms_partner_items';
    info: {
        description: '';
        displayName: 'Partenaire';
        icon: 'link';
    };
    attributes: {
        link: Schema.Attribute.String;
        logo: Schema.Attribute.Media<'images'>;
        title: Schema.Attribute.String;
    };
}

export interface ComposantAtomsSectionTexteImage
    extends Struct.ComponentSchema {
    collectionName: 'components_composant_atoms_section_texte_images';
    info: {
        description: '';
        displayName: 'Section texte & image';
        icon: 'code';
    };
    attributes: {
        image: Schema.Attribute.Media<'images'>;
        imgToTheLeft: Schema.Attribute.Boolean &
            Schema.Attribute.DefaultTo<false>;
        texte: Schema.Attribute.Blocks & Schema.Attribute.Required;
        titre: Schema.Attribute.String;
    };
}

export interface ComposantAtomsSlider extends Struct.ComponentSchema {
    collectionName: 'components_composant_atoms_sliders';
    info: {
        displayName: 'Slider';
        icon: 'landscape';
    };
    attributes: {
        media: Schema.Attribute.Media<'images' | 'videos', true> &
            Schema.Attribute.Required;
        titre: Schema.Attribute.String;
    };
}

export interface ComposantAtomsSliderHp extends Struct.ComponentSchema {
    collectionName: 'components_composant_atoms_slider_hps';
    info: {
        displayName: 'Slider HP';
        icon: 'write';
    };
    attributes: {
        buttonLabel: Schema.Attribute.String;
        buttonLink: Schema.Attribute.String;
        content: Schema.Attribute.Blocks;
        order: Schema.Attribute.Integer &
            Schema.Attribute.SetMinMax<
                {
                    max: 5;
                    min: 1;
                },
                number
            >;
        subTitle: Schema.Attribute.String;
        title: Schema.Attribute.String;
    };
}

export interface NotUsedHistory extends Struct.ComponentSchema {
    collectionName: 'components_club_presentation_histories';
    info: {
        description: '';
        displayName: 'history';
        icon: 'book-open';
    };
    attributes: {
        history_item: Schema.Attribute.Component<'not-used.history-item', true>;
        title: Schema.Attribute.String;
    };
}

export interface NotUsedHistoryItem extends Struct.ComponentSchema {
    collectionName: 'components_club_presentation_history_items';
    info: {
        description: '';
        displayName: 'history_item';
        icon: 'atlas';
    };
    attributes: {
        description: Schema.Attribute.Text;
        title: Schema.Attribute.String;
    };
}

export interface NotUsedMedia extends Struct.ComponentSchema {
    collectionName: 'components_club_presentation_media';
    info: {
        description: '';
        displayName: 'media';
        icon: 'camera';
    };
    attributes: {
        photo_src: Schema.Attribute.Media<
            'images' | 'files' | 'videos' | 'audios'
        >;
        title: Schema.Attribute.String;
        video_src: Schema.Attribute.Media<
            'images' | 'files' | 'videos' | 'audios'
        >;
    };
}

export interface NotUsedNotUsed extends Struct.ComponentSchema {
    collectionName: 'components_not_used_not_useds';
    info: {
        displayName: 'Not Used';
    };
    attributes: {
        notUsed: Schema.Attribute.String;
    };
}

export interface NotUsedPhotoVideos extends Struct.ComponentSchema {
    collectionName: 'components_club_presentation_photo_videos';
    info: {
        description: '';
        displayName: 'photo_videos';
        icon: 'camera-retro';
    };
    attributes: {
        media: Schema.Attribute.Component<'not-used.media', true>;
        title: Schema.Attribute.String;
    };
}

export interface NotUsedSupport extends Struct.ComponentSchema {
    collectionName: 'components_club_presentation_support_s';
    info: {
        description: '';
        displayName: 'support ';
        icon: 'archway';
    };
    attributes: {
        support_item: Schema.Attribute.Component<'not-used.support-item', true>;
        title: Schema.Attribute.String;
    };
}

export interface NotUsedSupportItem extends Struct.ComponentSchema {
    collectionName: 'components_club_presentation_support_items';
    info: {
        description: '';
        displayName: 'support_item';
    };
    attributes: {
        description: Schema.Attribute.Text;
        support_text: Schema.Attribute.Text;
        supporter_name: Schema.Attribute.String;
    };
}

export interface NotUsedSustain extends Struct.ComponentSchema {
    collectionName: 'components_club_presentation_sustains';
    info: {
        description: '';
        displayName: 'sustain';
        icon: 'allergies';
    };
    attributes: {
        gallery: Schema.Attribute.Component<'not-used.media', true>;
        media_subtitle: Schema.Attribute.String;
        project_btn_text: Schema.Attribute.String;
        project_title: Schema.Attribute.String;
        title: Schema.Attribute.String;
    };
}

export interface NotUsedVideoTeaser extends Struct.ComponentSchema {
    collectionName: 'components_club_presentation_video_teasers';
    info: {
        description: '';
        displayName: 'Teaser vid\u00E9o';
        icon: 'play';
    };
    attributes: {
        type: Schema.Attribute.Enumeration<['youtube', 'other']>;
        video_src: Schema.Attribute.Media<
            'images' | 'files' | 'videos' | 'audios'
        >;
        youtube_src: Schema.Attribute.String;
    };
}

export interface PageSectionsFaqs extends Struct.ComponentSchema {
    collectionName: 'components_club_presentation_faqs';
    info: {
        description: '';
        displayName: 'FAQ';
        icon: 'bullhorn';
    };
    attributes: {
        description: Schema.Attribute.Text;
        faq_item: Schema.Attribute.Component<'composant-atoms.faq-item', true>;
        subtitle: Schema.Attribute.String;
        title: Schema.Attribute.String;
    };
}

declare module '@strapi/strapi' {
    export module Public {
        export interface ComponentSchemas {
            'club-chiffres.chiffres': ClubChiffresChiffres;
            'club-header.video-couverture': ClubHeaderVideoCouverture;
            'club-presentation.club-presentation': ClubPresentationClubPresentation;
            'club-presentation.localisation': ClubPresentationLocalisation;
            'club-presentation.mot-du-dirigeant': ClubPresentationMotDuDirigeant;
            'club-presentation.pourquoi-klubr-accompagne': ClubPresentationPourquoiKlubrAccompagne;
            'club-presentation.section-citation': ClubPresentationSectionCitation;
            'composant-atoms.auteur': ComposantAtomsAuteur;
            'composant-atoms.citation': ComposantAtomsCitation;
            'composant-atoms.faq-item': ComposantAtomsFaqItem;
            'composant-atoms.partner-item': ComposantAtomsPartnerItem;
            'composant-atoms.section-texte-image': ComposantAtomsSectionTexteImage;
            'composant-atoms.slider': ComposantAtomsSlider;
            'composant-atoms.slider-hp': ComposantAtomsSliderHp;
            'not-used.history': NotUsedHistory;
            'not-used.history-item': NotUsedHistoryItem;
            'not-used.media': NotUsedMedia;
            'not-used.not-used': NotUsedNotUsed;
            'not-used.photo-videos': NotUsedPhotoVideos;
            'not-used.support': NotUsedSupport;
            'not-used.support-item': NotUsedSupportItem;
            'not-used.sustain': NotUsedSustain;
            'not-used.video-teaser': NotUsedVideoTeaser;
            'page-sections.faqs': PageSectionsFaqs;
        }
    }
}
