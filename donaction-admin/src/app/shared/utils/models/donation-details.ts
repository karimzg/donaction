import { Donateur } from './user-details';
import { KlubProject, Klubr } from './klubr';
import { EntityModel } from "./misc";
import { Invoice, InvoiceLine } from "./invoice";


export type STATUS_PAYMENT = 'notDone' | 'pending' | 'success' | 'error';

export interface DonationDetails extends EntityModel {
  uuid: string;
  datePaiment: Date;
  // statusPaiment: string;
  statusPaiment: STATUS_PAYMENT;
  montant: number;
  estOrganisme: boolean;
  montantAjouteAuMontantTotalDuProjet: boolean;
  deductionFiscale: number;
  contributionAKlubr: number;
  attestationNumber: string;
  attestationPath: string;
  recuPath: string;
  klub_don_payments: DonationPayment[];
  emailSent: boolean;
  klubDonateur: Donateur;
  klubr: Klubr
  klub_projet: KlubProject | null;
  invoice: Invoice;
  invoice_line: InvoiceLine;
  withTaxReduction?: boolean;
  isContributionDonation?: boolean;
  klub_don_contribution?: DonationDetails;
  klub_don?: DonationDetails;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DonationPayment extends EntityModel {
  documentId: string;
  amount: number;
  client_secret: string;
  currency: string;
  payment_method: string;
  created: number;
  intent_id: string;
  klub_don: DonationDetails;
  error_code: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}
