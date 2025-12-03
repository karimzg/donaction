import { STATUS_PAYMENT } from "@shared/utils/models/donation-details";

export interface DonFilters {
  klubrUUIDs?: string[] | null;
  klubProject?: string[] | null;
  donationDate?: Date[] | null;
  donationPrice?: number[] | null;
  donationStatus?: STATUS_PAYMENT | null;
  contribution?: boolean | null;
  searchParams?: string;
  invoiceLineUuid?: string;
  invoice?: string[] | null;
}

// TODO: ajouter des icons
export const donationStatus = [
  {label: 'Non effectué', code: 'notDone'},
  {label: 'En attente', code: 'pending'},
  {label: 'Validé', code: 'success'},
  {label: 'Refusé', code: 'error'},
];
