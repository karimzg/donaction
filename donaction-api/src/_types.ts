import { Data } from '@strapi/strapi';
import Stripe from 'stripe';

export type BlogEntity = Data.ContentType<'api::blog.blog'>;
export type CguEntity = Data.ContentType<'api::cgu.cgu'>;
export type CguKlubEntity = Data.ContentType<'api::cgu-klub.cgu-klub'>;
export type ContactEntity = Data.ContentType<'api::contact.contact'>;
export type FederationEntity = Data.ContentType<'api::federation.federation'>;
export type InvoiceEntity = Data.ContentType<'api::invoice.invoice'>;
export type InvoiceLineEntity =
    Data.ContentType<'api::invoice-line.invoice-line'>;
export type KlubDonEntity = Data.ContentType<'api::klub-don.klub-don'>;
export type KlubDonPaymentEntity =
    Data.ContentType<'api::klub-don-payment.klub-don-payment'>;
export type KlubProjetEntity = Data.ContentType<'api::klub-projet.klub-projet'>;
export type KlubrEntity = Data.ContentType<'api::klubr.klubr'>;
export type KlubrDocumentEntity =
    Data.ContentType<'api::klubr-document.klubr-document'>;
export type KlubrDonateurEntity =
    Data.ContentType<'api::klubr-donateur.klubr-donateur'>;
export type KlubrHouseEntity = Data.ContentType<'api::klubr-house.klubr-house'>;
export type KlubrInfoEntity = Data.ContentType<'api::klubr-info.klubr-info'>;
export type KlubrMemberEntity =
    Data.ContentType<'api::klubr-membre.klubr-membre'>;
export type KlubrSubscriptionEntity =
    Data.ContentType<'api::klubr-subscription.klubr-subscription'>;
export type MecenatReassuranceEntity =
    Data.ContentType<'api::mecenat-reassurance.mecenat-reassurance'>;
export type NewsletterEntity = Data.ContentType<'api::newsletter.newsletter'>;
export type PageContactEntity =
    Data.ContentType<'api::page-contact.page-contact'>;
export type PageCookieEntity = Data.ContentType<'api::page-cookie.page-cookie'>;
export type PageHomeEntity = Data.ContentType<'api::page-home.page-home'>;
export type PageListeDonEntity =
    Data.ContentType<'api::page-liste-don.page-liste-don'>;
export type PageMecenatEntity =
    Data.ContentType<'api::page-mecenat.page-mecenat'>;
export type TemplateProjectsCategoryEntity =
    Data.ContentType<'api::template-projects-category.template-projects-category'>;
export type TemplateProjectsLibraryEntity =
    Data.ContentType<'api::template-projects-library.template-projects-library'>;
export type TradePolicyEntity =
    Data.ContentType<'api::trade-policy.trade-policy'>;
export type ConnectedAccountEntity =
    Data.ContentType<'api::connected-account.connected-account'>;
export type WebhookLogEntity = Data.ContentType<'api::webhook-log.webhook-log'>;
export type FinancialAuditLogEntity =
    Data.ContentType<'api::financial-audit-log.financial-audit-log'>;
export type ReceiptCancellationEntity =
    Data.ContentType<'api::receipt-cancellation.receipt-cancellation'>;

export type UserEntity = Data.ContentType<'plugin::users-permissions.user'>;
export type UserRoleEntity = Data.ContentType<'plugin::users-permissions.role'>;
export type UserPermissionEntity =
    Data.ContentType<'plugin::users-permissions.permission'>;

export type PaginationEntity = {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
};

export type LifecycleEvent<T> = {
    params: {
        data: Partial<T>;
        where?: Record<string, any>;
        select?: string[];
        populate?: string[];
    };
    result?: T;
    model: string;
};

/**
 * Stripe webhook payload types
 * Union type covering all possible Stripe Connect webhook event payloads
 */
export type StripeWebhookPayload =
    | Stripe.Account
    | Stripe.BankAccount
    | Stripe.Card
    | Stripe.Capability
    | Stripe.Person
    | Stripe.AccountSession
    | Stripe.ExternalAccount;

/**
 * Webhook log entity for storing Stripe webhook events
 */
export type WebhookLogEntity = Data.ContentType<'api::webhook-log.webhook-log', 'fields'> & {
    id?: number;
    documentId?: string;
    event_id: string;
    event_type: string;
    account_id?: string;
    payload: StripeWebhookPayload;
    processed: boolean;
    retry_count: number;
    error_message?: string;
};
