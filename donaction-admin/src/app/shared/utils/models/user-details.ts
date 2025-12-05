import { Klubr } from "./klubr";
import { Media } from "./media";
import { EntityModel } from "./misc";

export interface UserDetail extends EntityModel {
  id: number;
  uuid: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  lastLogin: string | null;
  status: string;
  origine: string;
  stats?: Stats;
  optin: boolean;
  nom: null;
  prenom: null;
  createdAt: string;
  updatedAt: string;
  role: {
    id: number
    name: UserRole
    type: string
    description: string
    createdAt: string
    updatedAt: string
  }
  klubr_membres: Array<KlubrMembre>;
  last_member_profile_used: string | null;
}

export interface Stats {
  montantContributionsTotal: number
  montantTotal: number
  nbDonsContributionOrganismes: number
  nbDonsContributionParticuliers: number
  nbDonsOrganismes: number
  nbDonsParticuliers: number
}

export interface KlubrMembre extends EntityModel {
  uuid: string;
  nom: string;
  prenom: string;
  fonction: string;
  role: KlubrMembreRole;
  code?: string;
  avatar?: Media;
  klubr: Klubr;
  date_link_user: string | null;
  slug?: string;
  createdAt: string;
  updatedAt: string;
  users_permissions_user?: UserDetail;
  optin_mail_don_project: boolean;
  optin_mail_don_klub_project: boolean;
  optin_mail_don_klub: boolean;
  optin_mail_invoice: boolean;
  email?: string;
  tel?: string;
  numLicence?: string
}

export interface KlubrMembreSwitchToAdminEditor extends KlubrMembre {
  status: 'alreadyLinkedToUserAndConnected' | 'alreadyLinkedToUser' | 'alreadyExistingAdminEditorNotLinkedToUSer' | 'newAdminEditor';
}

export const roleLabel = (role?: KlubrMembreRole | UserRole): string | undefined => {
  switch (role) {
    case 'KlubMember':
      return 'Membre';
    case 'KlubMemberLeader':
      return 'Dirigeant';
    case 'NetworkLeader':
      return 'Réseau';
    case 'AdminEditor':
      return 'Administateur';
    case 'Admin':
      return 'Super Admin';
    case 'Authenticated':
      return 'Authentifié';
    default:
      return undefined;
  }
}


export type UserRole =
  'Public'
  | 'Authenticated'
  | 'KlubMember'
  | 'KlubMemberLeader'
  | 'NetworkLeader'
  | 'AdminEditor'
  | 'Admin';

export const USER_ROLES: { [key in UserRole]: { name: string, weight: number, label: string } } = {
  Public: {
    name: "Public",
    weight: 0,
    label: "Public",
  },
  Authenticated: {
    name: "Authenticated",
    weight: 10,
    label: "Authentifié",
  },
  KlubMember: {
    name: "KlubMember",
    weight: 20,
    label: "Membre",
  },
  KlubMemberLeader: {
    name: "KlubMemberLeader",
    weight: 30,
    label: "Dirigeant",
  },
  NetworkLeader: {
    name: "NetworkLeader",
    weight: 40,
    label: "Réseau",
  },
  AdminEditor: {
    name: "AdminEditor",
    weight: 50,
    label: "Administateur",
  },
  Admin: {
    name: "Admin",
    weight: 60,
    label: "Super Admin",
  },
}

// export type KlubrMembreRole = 'KlubMember' | 'KlubMemberLeader' | 'NetworkLeader';
export type KlubrMembreRole = Exclude<UserRole, 'Public' | 'Authenticated' /*| 'AdminEditor' | 'Admin'*/>;

export const MEMBER_ROLES: { [key in KlubrMembreRole]: { name: string, weight: number, label: string } } = {
  KlubMember: {
    name: "KlubMember",
    label: "Membre",
    weight: 0,
  },
  KlubMemberLeader: {
    name: "KlubMemberLeader",
    label: "Dirigeant",
    weight: 10,
  },
  NetworkLeader: {
    name: "NetworkLeader",
    label: "Tête de réseau",
    weight: 20,
  },
  AdminEditor: {
    name: "AdminEditor",
    label: "Administateur du club",
    weight: 50,
  },
  Admin: {
    name: "Admin",
    label: "Super Admin",
    weight: 60,
  },
}

export interface Donateur extends EntityModel {
  uuid: string;
  nom: string;
  prenom: string;
  civilite: 'Madame' | 'Monsieur';
  email: string;
  donateurType: 'Particulier' | 'Organisme';
  raisonSocial?: string | null;
  SIREN?: string | null;
  formeJuridique?: string | null;
  tel: string | null;
  adresse: string | null;
  adresse2: string | null;
  cp: string;
  ville: string;
  pays: string;
  dateNaissance?: string | null;
  optInAffMontant: boolean;
  optInAffNom: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  avatar?: Media;
  logo?: Media;
}

export const defaultKlubMemberFunctions = ['Entraineur', 'Dirigeant', 'Secrétaire', 'Trésorier', 'Membre']
