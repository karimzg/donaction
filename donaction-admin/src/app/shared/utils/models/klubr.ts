import { Media } from "./media";
import { KlubrMembre } from "./user-details";
import { EntityComponentModel, EntityIdModel, EntityModel } from "./misc";
import { InvoiceLine, TradePolicy } from "./invoice";
import PlaceResult = google.maps.places.PlaceResult;

export interface KlubrHouse extends EntityModel {
  uuid: string;
  klubr: Klubr;
  primary_color: string;
  secondary_color: string;
  header_text_color: string;
  footer_text_color: string;
  poster_primary_color: string;
  couvertureMedia: Media;
  poster_media: Media;
  title: string;
  description: string; // Todo Change to RichTextBlock
  metaDescription: string;
  slug: string;
  chiffres: Array<Chiffre>;
  partnerList: Array<PartnerList>;
  club_presentation?: Array<ISectionTextImage>; // todo: Ajouter les autres sections
  createdAt: string;
  updatedAt: string;
}

export interface ISectionTextImage extends EntityComponentModel {
  __component: string;
  id: number;
  titre: string;
  texte?: string; // Todo Change to RichTextBlock
  image?: Media;
  imgToTheLeft?: boolean;
}

export class SectionTextImage implements ISectionTextImage {
  __component = 'composant-atoms.section-texte-image';
  // public id?: number;
  // public titre?: string;
  // public texte?: string;
  // public image?: Media;
  // public imgToTheLeft?: boolean;

  constructor(
    public id: number,
    public titre: string,
    public texte?: string,
    public image?: Media,
    public imgToTheLeft?: boolean
  ) {
  }
}

export interface PartnerList extends EntityComponentModel {
  __component: string;
  id: number;
  title: string;
  link: string;
  logo: Media;
}

export interface Chiffre extends EntityIdModel {
  id: number;
  chiffre: number;
  label: string;
}

export interface KlubProjets {
  count: number;
}

export type ProjectStatus = 'draft' | 'waitingApproval' | 'published' | 'closed' | 'deleted' | 'billed';

export interface KlubProject extends EntityModel {
  uuid: string;
  titre: string;
  montantAFinancer: number;
  dateLimiteFinancementProjet: Date;
  couverture?: Media;
  slug: string;
  presentationDescription: string;
  descriptionCourte: string;
  montantTotalDonations: number;
  nbDons: number;
  status: ProjectStatus;
  klubr: Klubr;
  klubr_membre: KlubrMembre;
  isTemplate: boolean;
  template_projects_category?: TmplProjectCategory;
  metaDescription?: string;
  isFromTemplate?: boolean;
  tmplReference?: KlubProject;
  invoice_line?: InvoiceLine;
  contenu?: Array<SectionTextImage>;
  realisations?: Array<SectionTextImage>;
}

export interface TmplProjectCategory extends EntityModel {
  uuid: string;
  label: string;
  icon: string;
  template_projects_library: TmplProjectLibrary;
  klub_projets: Array<KlubProject>;
  sportType: SportType;
}

export interface TmplProjectLibrary extends EntityModel {
  uuid: string;
  label: string;
  klubr: Klubr;
  template_projects_categories?: Array<TmplProjectCategory>;
  sportType: SportType;
}

export type ClubStatus = 'draft' | 'published' | 'deleted';

export interface Klubr extends EntityModel {
  uuid: string;
  id: number;
  denomination: string;
  acronyme: string;
  federation: any;
  federationLink?: Federation;
  siegeSocialAdresse: string;
  siegeSocialAdresse2: string;
  siegeSocialCP: string;
  siegeSocialVille: string;
  siegeSocialDepartement: string;
  siegeSocialRegion: string;
  nbMembres: any;
  status: ClubStatus;
  siegeSocialPays: string;
  associationType: string;
  sportType: SportType;
  legalStatus: LegalStructureType;
  nbBenevoles: any;
  nbProjects: any;
  slug: string;
  slogan: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  logo: Media;
  klubr_house: KlubrHouse;
  klub_projets: KlubProjets;
  code: string;
  codeLeader: string;
  klubrAffiliations: Array<Klubr>;
  klubrsAffiliateds: Array<Klubr>;
  donationEligible: boolean;
  trade_policy: TradePolicy;
  template_projects_libraries: Array<TmplProjectLibrary>;
  klubr_document?: KlubrDocuments;
  klubr_info?: KlubrInfos;
  googlePlace: PlaceResult;
  webSite: string;
  klubYearCreation: number;
  statNbMembers?: number;
  statNbMembersWithAccount?: number;
  statNbDons?: number;
  statDonsTotalAmount?: number;
}

/* STATS */
export interface DonationsStatsData {
  nbDonations: number;
  totalAmount: number;
}

export interface DonationsStats {
  fromPro: DonationsStatsData;
  fromPart: DonationsStatsData;
  total: DonationsStatsData;
}

export interface DonationsGlobalStats {
  forKlub: DonationsStats,
  forKlubContribution?: DonationsStats,
  forProjects: DonationsStats,
  forProjectsContribution?: DonationsStats,
  total: DonationsStats,
  totalContribution?: DonationsStats,
}

export interface KlubrInfosStats {
  requiredFieldsCompletion: number,
  requiredDocsValidated: number,
}

export interface ProjectsStats {
  nbPublishedProjects: number,
  nbProjectTmpl?: number,
}

export interface MembersStats {
  nbActiveMembers: number,
}

export interface KlubrStats {
  infos: KlubrInfosStats,
  projects: ProjectsStats,
  members: MembersStats,
  donations: DonationsGlobalStats
  // donationContributionTotalAmount: number
  // donationTotalAmount: number
  // donationTotalAmountKlub: number
  // donationTotalAmountProjects: number
  // nbContributionDonations: number
  // nbDonations: number
  // nbDonationsKlub: number
  // nbDonationsProjects: number
  // nbProjectTmpl: number
  // nbPublishedProjects: number
  // statNbActiveMembers: number
  // requiredDocsValidated: number
  // requiredFieldsCompletion: number

  // donationTotalAmount,
  // nbDonations,
  // nbProjectTmpl,
  // nbPublishedProjects,
  // requiredDocsValidated,
  // requiredFieldsCompletion,
  // statNbActiveMembers,
  // donationContributionTotalAmount,
  // donationTotalAmount,
  // donationTotalAmountKlub,
  // donationTotalAmountProjects,
  // nbContributionDonations,
  // nbDonations,
  // nbDonationsKlub,
  // nbDonationsProjects,
  // nbProjectTmpl,
  // nbPublishedProjects,
  // statNbActiveMembers,
}

export interface Federation {
  id: number;

  name: string;
  acronym?: string;
  // klubrs: Array<Klubr>;
  klubr?: Klubr;
  documentId?: string;
}

export type DocumentType =
  'justifDomicileDirigeant'
  | 'justifDesignationPresident'
  | 'statutsAssociation'
  | 'avisSituationSIRENE'
  | 'attestationAffiliationFederation'
  | 'ribAssociation';

export interface KlubrDocuments extends EntityModel {
  justifDomicileDirigeant?: Record<string, any>;
  justifDesignationPresident?: Record<string, any>;
  statutsAssociation?: Record<string, any>;
  ribAssociation?: Record<string, any>;
  attestationAffiliationFederation?: Record<string, any>;
  avisSituationSIRENE?: Record<string, any>;
  klubr: Klubr;
  statutsAssociationValide?: boolean;
  justifDomicileDirigeantValide?: boolean;
  justifDesignationPresidentValide?: boolean;
  ribAssociationValide?: boolean;
  avisSituationSIRENEValide?: boolean;
  attestationAffiliationFederationValide?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface KlubrInfos extends EntityModel {
  requiredFieldsCompletion: number;
  requiredDocsValidatedCompletion: number;
  requiredDocsWaitingValidationCompletion: number;
  requiredDocsRefusedCompletion: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface KlubrDocumentsCreate extends EntityModel {
  justifDomicileDirigeant?: Record<string, any>;
  justifDesignationPresident?: Record<string, any>;
  statutsAssociation?: Record<string, any>;
  ribAssociation?: Record<string, any>;
  attestationAffiliationFederation?: Record<string, any>;
  avisSituationSIRENE?: Record<string, any>;
  klubr: string;
}

export interface UserLinkedTo extends EntityModel {
  uuid: string;
  code: string;
  createdAt: Date;
  date_link_user: Date;
  fonction: string;
  nom: string;
  prenom: string;
  publishedAt: Date;
  role: string;
  updatedAt: Date;
}

export enum LegalStructureType {
  Autre = "Autre",
  AssociationLoi1901 = "Association Loi 1901",
  // AssociationLoi1905 = "Association Loi 1905",
  // AssociationLoi1908 = "Association Loi 1908",
  // AssociationsProfessionnellesNationalesDeMilitaires = "Associations professionnelles nationales de militaires",
  // AssociationsSyndicalesDeProprietaires = "Associations syndicales de propriétaires",
  CollectivitesTerritoriales = "Collectivités territoriales",
  // ComiteDEntreprise = "Comité d’entreprise",
  // CSE = "CSE",
  // FabriqueDEglise = "Fabrique d’église",
  Fondation = "Fondation",
  FondsDeDotation = "Fonds de dotation",
  // FondsDePerenite = "Fonds de pérennité",
  // GIE = "GIE",
  // GIP = "GIP",
  // MenseCuriale = "Mense curiale",
  // SCIC = "SCIC",
  // SCOP = "SCOP",
}

export enum SportType {
  Autre = "Autre",
  Aikido = "Aïkido",
  Aquatique = "Aquatique",
  Athletisme = "Athlétisme",
  Aviron = "Aviron",
  CharAVoile = "Char à voile",
  Badminton = "Badminton",
  Baseball = "Baseball",
  Basketball = "Basket-ball",
  Billard = "Billard",
  Boxe = "Boxe",
  Canoe = "Canöe",
  CourseAPied = "Course à pied",
  Danse = "Danse",
  Equitation = "Equitation",
  Escalade = "Escalade",
  Escrime = "Escrime",
  Flechettes = "Fléchettes",
  Football = "Football",
  Golf = "Golf",
  Gymnastique = "Gymnastique",
  Handball = "Handball",
  Hockey = "Hockey",
  HockeySurGlace = "Hockey sur glace",
  Judo = "Judo",
  Karate = "Karaté",
  Lutte = "Lutte",
  Moto = "Moto",
  Natation = "Natation",
  Nautisme = "Nautisme",
  Patinage = "Patinage",
  Peche = "Pêche",
  Petanque = "Pétanque",
  PlancheAVoile = "Planche à voile",
  PlongeeSousMarine = "Plongée sous marine",
  SkiAlpin = "Ski alpin",
  SkiDeFond = "Ski de fond",
  SkiNautique = "Ski nautique",
  Speleologie = "Spéléologie",
  SportsAutomobiles = "Sports automobiles",
  SportsNautiques = "Sports nautiques",
  Surf = "Surf",
  Taekwondo = "Taekwondo",
  Tennis = "Tennis",
  TennisDeTable = "Tennis de table",
  TirALArc = "Tir à l'arc",
  Triathlon = "Triathlon",
  VeloBMXVTT = "Vélo/BMX/VTT",
  Voile = "Voile",
  Volleyball = "Volleyball",
  Waterpolo = "Waterpolo",
  Trail = "Trail"
}

