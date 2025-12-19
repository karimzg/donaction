import { EntityModel } from "./misc";
import { KlubProject, Klubr } from "./klubr";
import { DonationDetails } from "./donation-details";

export interface Invoice extends EntityModel {
  uuid: string;
  invoiceNumber: string;
  dateInvoice: Date;
  dateBankTransfer?: Date;
  amountExcludingTax: number;
  amountIncludingTax: number;
  VAT: number;
  creditTotalAmount: number;
  nbDonations: number;
  averageBasket: number;
  klub_dons?: Array<DonationDetails>;
  klubr: Klubr;
  invoice_lines: Array<InvoiceLine>;
  billingPeriod: string;
  billingPeriodSmall: string;
  commissionPercentage: number;
}

export interface InvoiceLine extends EntityModel {
  invoiceLineNumber: string;
  reference: InvoiceLineReference;
  description: string;
  quantity: number;
  unitPriceExcludingTax: number;
  amountExcludingTax: number;
  nbDonations: number;
  isCreditLine: boolean;
  klub_dons?: Array<DonationDetails>;
  klub_projet?: KlubProject;
  invoice: Invoice;
}

export interface TradePolicy extends EntityModel {
  tradePolicyLabel: string;
  commissionPercentage: number;
  noBilling: boolean;
  reference: 'CSD' | 'DONATION_CLUB';
  billingDescription: string;
  VATPercentage: number;
  defaultTradePolicy: boolean;
}

export enum InvoiceLineReference {
  DONATION_CLUB = 'DONS CLUB',
  DONATION_PROJECT = 'DONS PROJET',
  CSD = 'CSD',
}

export interface InvoiceGenerate {
  billingPeriodSmall: {
    month: string;
    year: string;
  }
  pdf?: boolean;
  mail?: boolean;
}

export interface InvoiceGenerateResponse {
  period: string;
  clubInvoices: Array<string>;
  clubInvoicesErrors: Array<string>;
  clubInvoicesBypassed: Array<string>;
}

export interface GeneratedInvoice {
  klubr: string;
  invoiceNumber: string;
  creditTotalAmount: number;
  amountExcludingTax: number;
  amountIncludingTax: number;
  nbDonationsKlub: number;
  nbDonationsProjects: number;
  commission: number;
  billingPeriodSmall: string;
}

export interface GeneratedInvoiceErrors {
  klubr: string;
  error: string;
}

export const invoiceGenerateResponse = {
  period: "12/2024",
  clubInvoices: [
    "Facture #KLUBR-2024-12-00011 12/2024 pour Golf du Sart : Nb Dons au club: 0 | Nb Dons projects: 1 | Commission Klubr: 3,00 € | Montant total dons: 50,00 €",
    "Facture #KLUBR-2024-12-00012 12/2024 pour Golf de Bondues : Nb Dons au club: 0 | Nb Dons projects: 2 | Commission Klubr: 9,00 € | Montant total dons: 150,00 €",
    "Facture #KLUBR-2024-12-00013 12/2024 pour Football Club de Bondues : Nb Dons au club: 0 | Nb Dons projects: 1 | Commission Klubr: 3,00 € | Montant total dons: 50,00 €",
    "Facture #KLUBR-2024-12-00014 12/2024 pour Iris Hockey Lambersart : Nb Dons au club: 0 | Nb Dons projects: 2 | Commission Klubr: 9,00 € | Montant total dons: 150,00 €",
    "Facture #KLUBR-2024-12-00015 12/2024 pour La Raquette de Villeneuve d’Ascq : Nb Dons au club: 0 | Nb Dons projects: 4 | Commission Klubr: 10,80 € | Montant total dons: 180,00 €"
  ],
  clubInvoicesErrors: [
    "Erreur pour Lens Footgolf Club (${error})",
    "Erreur pour Communauté Urbaine de Lille (${error})",
  ],
  clubInvoicesBypassed: [
    "Pas de dons pour Marcq Polo Club ",
    "Pas de dons pour Test IMG",
    "Pas de dons pour test",
    "Pas de dons pour Communauté Urbaine de Lille",
    "Pas de dons pour Lens Footgolf Club",
    "Pas de dons pour Ufolep Nord ",
    "Pas de dons pour tests",
    "Pas de dons pour Amicale Sportive de Lille ",
    "Pas de dons pour Fédération Française des Clubs Omnisports",
    "Pas de dons pour Olympique Marcquois Football",
    "Pas de dons pour Ligue de football des Hauts-de-France",
    "Pas de dons pour District des Flandres",
    "Pas de dons pour Association Sportive Baisieux",
    "Pas de dons pour ULJAP Roncq ",
    "Pas de dons pour T.A.C Hockey",
    "Pas de dons pour USDK Dunkerque Handball Grand Littoral ",
    "Pas de dons pour Bethune Essars Futsal",
    "Pas de dons pour Fédération Française de Handball",
    "Pas de dons pour Ligue Hauts de France de Tennis",
    "Pas de dons pour Jeunesse Athlétique Armentièroise",
    "Pas de dons pour Lille Université Club ",
    "Pas de dons pour TEST",
    "Pas de dons pour Entente Feignies Aulnoye Football Club",
    "Pas de dons pour Stade Béthunois football Club",
    "Pas de dons pour Triathlon club Liévin ",
    "Pas de dons pour Klubr",
    "Pas de dons pour Union Sportive Lesquin",
    "Pas de dons pour MLML",
    "Pas de dons pour Institut du sport durable"
  ]
}
