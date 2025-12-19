import { DonationDetails, DonationPayment } from "../models/donation-details";
import { Severity } from "../models/misc";

export const statusBodyTemplate = (donationDetails: DonationDetails):
  { text: string; color: string, severity: Severity } => {
  switch (donationDetails.statusPaiment) {
    case 'notDone':
      return {text: 'Non soumis', color: '#D8B4FE', severity: 'contrast'};
    case 'pending':
      return {text: 'En cours', color: '#FDBA74', severity: 'info'};
    case 'success':
      return {text: 'Payé', color: '#86EFAC', severity: 'success'};
    case 'error':
      return {text: 'Erreur', color: '#FCA5A5', severity: 'danger'};
    default:
      return {text: '', color: '', severity: 'info'};
  }
}

export const donPaymentStatus = (donationPaymentDetails: DonationPayment):
  { text: string; color: string, severity: Severity } => {
  switch (donationPaymentDetails.status) {
    case 'pending':
      return {text: 'En cours', color: '#FDBA74', severity: 'info'};
    case 'succeeded':
      return {text: 'Payé', color: '#86EFAC', severity: 'success'};
    case 'error':
      return {text: 'Erreur', color: '#FCA5A5', severity: 'danger'};
    default:
      return {
        text: (donationPaymentDetails.error_code || 'Non renseigné').replace('_', ' '),
        color: '#FCA5A5',
        severity: 'danger'
      };
  }
}
