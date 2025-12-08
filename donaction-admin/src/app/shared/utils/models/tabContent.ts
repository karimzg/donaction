import { DonationDetails } from "./donation-details";
import { Invoice } from "./invoice";
import { ApiListResult, Severity } from "./misc";
import { KlubProject, Klubr } from "./klubr";

export type TabContentContext = 'CLUB' | 'PROJETS' | 'FACTURES';

export interface ITabContent {
  contextDetail: {
    title: {
      icon?: ITabIcon,
      piIcon?: ITabPiIcon;
      label: string,
      extra?: {
        label: string
        severity?: Severity
      }
    },
    links: Array<ITabLink>,
    version: number
  },
  contextData: Array<ITabContentDetail>,
  contextObject?: {
    type: 'invoice' | 'notBilledDonations' | 'project',
    uuid?: string,
    donations?: ApiListResult<DonationDetails>,
    invoice?: Invoice,
    project?: KlubProject,
    coldData?: boolean,
    klubr?: Klubr,
    [key: string]: any
  }
}

export interface ITabContentDetail {
  label: string,
  value: string | number,
  reference?: TabContentDetailReference,
  progress?: number,
  unboldValue?: boolean,
  link?: ITabLink,
  percent?: {
    sign: 1 | -1,
    value: string,
    withoutIcon?: boolean,
  },
  action?: {
    icon?: ITabIcon,
    piIcon?: ITabPiIcon;
    action: ITabActions,
  },
  icon?: ITabIcon;
  piIcon?: ITabPiIcon;
}

export type ITabActions = 'controlSideBar' | 'changeProjectDate' | 'downloadInvoice';

export interface ITabLink {
  icon?: ITabIcon;
  piIcon?: ITabPiIcon;
  label: string;
  onClick?: ITabActions;
  url?: string;
  queryParams?: { [key: string]: string };
  routerLink?: Array<string>;
}

export interface ITabIcon {
  path: string;
  width: number;
  height: number;
}

export interface ITabPiIcon {
  name: string;
  color?: string;
}

export enum TabContentDetailReference {
  TOTAL_AMOUNT = 'totalAmount',
  NB_DONATIONS = 'nbDonations',
  AVERAGE_BASKET = 'averageBasket',
  INVOICE = 'invoice',
  DEADLINE = 'dateLimiteFinancementProjet',
  EXPECTED_AMOUNT = 'montantAFinancer',
}

export type ITab = {
  context: TabContentContext;
  content: Array<ITabContent>;
}
export type ISideBar = {
  context: TabContentContext;
  content?: ITabContent;
}

export const calendarIcon: ITabPiIcon = {name: 'pi-calendar'}
export const listIcon: ITabPiIcon = {name: 'pi-list-check'}
export const orangeCalendarIcon: ITabPiIcon = {name: 'pi-calendar', color: '#F69707'}
export const grayCalendarIcon: ITabPiIcon = {name: 'pi-calendar'}
export const showDetailsIcon: ITabPiIcon = {name: 'pi-eye'}
export const walletIcon: ITabPiIcon = {name: 'pi-wallet'}
export const basketIcon: ITabPiIcon = {name: 'pi-shopping-bag'}
export const downloadIcon: ITabPiIcon = {name: 'pi-download'}
export const facturesGrayIcon: ITabPiIcon = {name: 'pi-file'}
export const facturesWhiteIcon: ITabPiIcon = {name: 'pi-file'}
export const penIcon: ITabPiIcon = {name: 'pi-pencil'}
export const inboxIcon: ITabPiIcon = {name: 'pi-inbox'}
