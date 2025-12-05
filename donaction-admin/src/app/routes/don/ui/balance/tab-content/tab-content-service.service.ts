import { Injectable } from '@angular/core';
import {
  basketIcon,
  calendarIcon,
  downloadIcon,
  facturesGrayIcon,
  facturesWhiteIcon,
  grayCalendarIcon,
  inboxIcon,
  ITabActions,
  ITabContent,
  listIcon,
  orangeCalendarIcon,
  penIcon,
  showDetailsIcon,
  TabContentDetailReference,
  walletIcon
} from "@shared/utils/models/tabContent";
import { Invoice, InvoiceLineReference } from "@shared/utils/models/invoice";
import { currencyFormatter } from "@shared/utils/helpers/currency-helpers";
import { DonationDetails } from "@shared/utils/models/donation-details";
import { ApiListResult } from "@shared/utils/models/misc";
import { KlubProject } from "@shared/utils/models/klubr";
import { dateFormat } from "@shared/utils/helpers/date-helpers";

@Injectable()
export class TabContentServiceService {
  formatDonationsToClubTabContent = (donationsList: ApiListResult<DonationDetails>, klubUuid?: string, index = 0): ITabContent | undefined => {
    const donations = donationsList.data;
    if (!donations.length) {
      return undefined;
    }
    const totalAmount = donations.reduce((acc, donation) => acc + donation.montant, 0);
    const averageBasket = totalAmount / donations.length;
    const currentPeriod = (new Date()).toLocaleString('fr-FR', {month: 'long', year: 'numeric'});
    return ({
      contextDetail: {
        version: index,
        title: {
          piIcon: calendarIcon,
          label: `${currentPeriod}`,
          extra: {
            severity: 'success',
            label: 'En cours',
          }
        },
        links: donations.length ? [
          {
            piIcon: showDetailsIcon,
            label: 'Détails',
            onClick: 'controlSideBar'
          }
        ] : []
      },
      contextData: [
        {
          label: 'Nombre de donateurs',
          value: donations.length || 0,
          link: {
            label: 'Liste des dons',
            piIcon: listIcon,
            routerLink: ['/don', 'listing'],
            queryParams: {
              ...(klubUuid ? {filterClubUuid: klubUuid} : {}),
              filterProjectUuid: 'null',
              filterInvoiceUuid: 'null',
              filterDonationStatus: 'success',
            }
          },
          // percent: {
          //   sign: 1,
          //   value: '4%'
          // },
          reference: TabContentDetailReference.NB_DONATIONS,
          piIcon: walletIcon,
        },
        {
          label: 'Montant collecté',
          value: currencyFormatter.format(totalAmount),
          // percent: {
          //   value: '4.8%',
          //   sign: -1
          // },
          reference: TabContentDetailReference.TOTAL_AMOUNT,
          piIcon: walletIcon,
        },

        {
          label: 'Panier Moyen',
          value: currencyFormatter.format(averageBasket),
          piIcon: basketIcon,
          reference: TabContentDetailReference.AVERAGE_BASKET,
        }
      ],
      contextObject: {
        type: 'notBilledDonations',
        donations: donationsList
      }
    })
  }

  formatInvoiceToClubTabContent = (invoice: Invoice, klubUuid?: string, index = 0): ITabContent | undefined => {
    const invoiceLine = invoice.invoice_lines.find(
      (invoiceLine) => invoiceLine.isCreditLine && !invoiceLine.klub_projet
    );
    if (!invoiceLine) {
      return undefined;
    }
    return ({
      contextDetail: {
        version: index,
        title: {
          piIcon: calendarIcon,
          label: `${invoice.billingPeriod}`,
          // extra: {
          //   severity: 'success',
          //   label: 'En cours'
          // }
        },
        links: invoiceLine.nbDonations ? [
          {
            piIcon: showDetailsIcon,
            label: 'Détails',
            onClick: 'controlSideBar'
          }
        ] : []
      },
      contextData: [
        {
          label: 'Nombre de donateurs',
          value: invoiceLine.nbDonations || 0,
          link: {
            label: 'Liste des dons',
            piIcon: listIcon,
            routerLink: ['/don', 'listing'],
            queryParams: {
              ...(klubUuid ? {filterClubUuid: klubUuid} : {}),
              filterProjectUuid: 'null',
              filterInvoiceUuid: invoice.uuid,
              filterDonationStatus: 'success',
            }
          },
          // percent: {
          //   sign: 1,
          //   value: '4%'
          // },
          reference: TabContentDetailReference.NB_DONATIONS,
          piIcon: walletIcon,
        },
        {
          label: 'Montant collecté',
          value: currencyFormatter.format(invoiceLine.amountExcludingTax),
          // percent: {
          //   value: '4.8%',
          //   sign: -1
          // },
          reference: TabContentDetailReference.TOTAL_AMOUNT,
          piIcon: walletIcon,
        },
        {
          label: 'Facture',
          value: invoice.invoiceNumber,
          unboldValue: true,
          action: {
            piIcon: downloadIcon,
            action: 'downloadInvoice'
          },
          reference: TabContentDetailReference.INVOICE,
          piIcon: facturesGrayIcon,
        }
      ],
      contextObject: {
        type: 'invoice',
        uuid: invoice.uuid,
        invoice: invoice,
        coldData: true,
      }
    })
  }

  formatProjectTabContent = (project: KlubProject, klubUuid?: string, inProgressProject = true, index = 0): ITabContent | undefined => {
    if (!project) {
      return undefined;
    }
    const invoiceLine = project!.invoice_line;
    const nbDons = invoiceLine?.nbDonations || project.nbDons || 0;
    const montantTotal = invoiceLine?.amountExcludingTax || project.montantTotalDonations || 0;
    const pourcent = project.montantAFinancer ? Math.ceil((montantTotal / project.montantAFinancer) * 100) : 0;
    return ({
      contextDetail: {
        version: index * 100,
        title: {
          piIcon: inboxIcon,
          label: `${project.titre}`,
          extra: inProgressProject ? {
            label: 'En cours',
            severity: 'success',
          } : {
            severity: 'secondary',
            label: 'Clôturé'
          },
        },
        links: [
          ...(inProgressProject ? [{
            piIcon: penIcon,
            label: 'Modifier le projet',
            routerLink: ['/project', project.uuid, 'update']
          }] : []),
          ...(nbDons ? [{
            piIcon: showDetailsIcon,
            label: 'Détails',
            onClick: 'controlSideBar' as ITabActions
          }] : []),
        ]
      },
      contextData: [
        {
          label: 'Nombre de donateurs',
          value: nbDons,
          link: {
            label: 'Liste des dons',
            piIcon: listIcon,
            routerLink: ['/don', 'listing'],
            queryParams: {
              ...(klubUuid ? {filterClubUuid: klubUuid} : {}),
              filterProjectUuid: project.uuid,
              filterInvoiceUuid: invoiceLine?.invoice?.uuid || 'null',
              filterDonationStatus: 'success',
            }
          },
          piIcon: walletIcon,
          reference: TabContentDetailReference.NB_DONATIONS,
        },
        {
          label: 'Montant collecté',
          value: currencyFormatter.format(montantTotal),
          progress: pourcent,
          piIcon: walletIcon,
          reference: TabContentDetailReference.TOTAL_AMOUNT,
        },
        {
          label: 'Montant attendu',
          value: currencyFormatter.format(project.montantAFinancer),
          piIcon: walletIcon,
          reference: TabContentDetailReference.EXPECTED_AMOUNT,
        },
        {
          label: 'Panier Moyen',
          value: currencyFormatter.format(montantTotal / (nbDons || 1)),
          piIcon: basketIcon,
          reference: TabContentDetailReference.AVERAGE_BASKET,
        },
        {
          label: 'Date limite',
          value: `${dateFormat(new Date(project.dateLimiteFinancementProjet))}`,
          link: inProgressProject ? {
            label: 'Modifier la date',
            onClick: 'changeProjectDate',
            piIcon: orangeCalendarIcon,
          } : undefined,
          reference: TabContentDetailReference.DEADLINE,
          piIcon: grayCalendarIcon
        },
        ...(invoiceLine ? [{
          label: 'Facture',
          value: invoiceLine.invoice?.invoiceNumber,
          unboldValue: true,
          action: {
            piIcon: downloadIcon,
            action: 'downloadInvoice' as ITabActions
          },
          reference: TabContentDetailReference.INVOICE,
          piIcon: facturesGrayIcon
        }] : [])
      ],
      contextObject: {
        type: 'project',
        uuid: project.uuid,
        project,
        coldData: !inProgressProject,
      }
    })
  }

  formatInvoiceTabContent = (invoice: Invoice, klubUuid?: string, index = 0): ITabContent | undefined => {
    if (!invoice) {
      return undefined;
    }
    const commissionAmount = invoice.invoice_lines.find((line) => line.reference === InvoiceLineReference.CSD)?.amountExcludingTax;
    const otherCosts = invoice.invoice_lines.find((line) => !line.isCreditLine && line.reference !== InvoiceLineReference.CSD)?.amountExcludingTax;
    return ({
      contextDetail: {
        version: 1,
        title: {
          piIcon: facturesWhiteIcon,
          label: `Facture #${invoice.invoiceNumber}`,
          extra: {
            severity: 'contrast',
            label: `${dateFormat(new Date(invoice.dateInvoice))}`
          }
        },
        links: [
          {
            piIcon: showDetailsIcon,
            label: 'Détails',
            onClick: 'controlSideBar'
          }
        ]
      },
      contextData: [
        {
          label: 'Montant de la facture H.T.',
          value: `${currencyFormatter.format(invoice.amountExcludingTax)}`,
          piIcon: walletIcon
        },
        {
          label: 'Date du virement',
          value: invoice.dateBankTransfer ? `${dateFormat(new Date(invoice.dateBankTransfer!))}` : 'À venir',
          piIcon: grayCalendarIcon
        },
        {
          label: 'Montant commission klubr',
          value: `${currencyFormatter.format(commissionAmount || 0)}`,
          percent: (invoice.commissionPercentage ? {
            sign: 1,
            value: `${invoice.commissionPercentage}%`,
            withoutIcon: true,
          } : undefined),
          piIcon: walletIcon
        },
        {
          label: 'Montant total Avoir: dons reçus',
          value: `${currencyFormatter.format(invoice.creditTotalAmount)}`,
          piIcon: walletIcon,
          link: {
            label: 'Liste des dons',
            piIcon: listIcon,
            routerLink: ['/don', 'listing'],
            queryParams: {
              ...(klubUuid ? {filterClubUuid: klubUuid} : {}),
              filterInvoiceUuid: invoice.uuid,
              filterDonationStatus: 'success',
            }
          },
        },
        {
          label: 'Panier Moyen',
          value: `${currencyFormatter.format(invoice.averageBasket)}`,
          piIcon: basketIcon
        },
        {
          label: 'Autres frais klubr',
          value: `${currencyFormatter.format(otherCosts || 0)}`,
          piIcon: walletIcon
        }
      ],
      contextObject: {
        type: 'invoice',
        uuid: invoice.uuid,
        invoice,
        coldData: true,
      }
    })
  }

}



