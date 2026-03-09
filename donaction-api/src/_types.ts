import { Data } from '@strapi/strapi';
import type Stripe from 'stripe';

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
    Data.ContentType<'api::trade-policy.trade-policy'> & {
        /** Stripe processing fee rate, stored as percentage (e.g. 1.5 for 1.5%) */
        stripe_fee_percentage?: number;
        /** Stripe fixed fee per transaction in euros (e.g. 0.25 for €0.25) */
        stripe_fee_fixed?: number;
    };
export type ConnectedAccountEntity =
    Data.ContentType<'api::connected-account.connected-account'>;

/**
 * Connected account with optional klubr relation.
 * Used when the klubr field shape depends on whether the caller populated the
 * relation (object) or not (numeric FK). Strapi's generated ContentType doesn't
 * model this populate-dependent variance.
 */
export type ConnectedAccountWithOptionalKlubr = {
    id: number;
    documentId: string;
    account_status?: string;
    klubr?: KlubrEntity | number | null;
};
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
    | Stripe.ExternalAccount
    | Stripe.Dispute;

/**
 * Webhook log entity for storing Stripe webhook events
 */
export type WebhookLogSource = 'platform' | 'connect';
export type WebhookLogStatus =
    | 'received'
    | 'processing'
    | 'processed'
    | 'failed'
    | 'ignored';

export type WebhookLogEntity = Data.ContentType<'api::webhook-log.webhook-log'> & {
    id?: number;
    documentId?: string;
    event_id: string;
    event_type: string;
    source: WebhookLogSource;
    stripe_account_id?: string;
    payload: StripeWebhookPayload;
    status: WebhookLogStatus;
    processing_error?: string;
    retry_count: number;
    processed_at?: string;
    related_don?: KlubDonEntity;
    related_klubr?: KlubrEntity;
};

/**
 * Possible values for dispute status
 */
export type DisputeStatusValue =
    | 'none'
    | 'warning_received'
    | 'warning_under_review'
    | 'warning_closed'
    | 'open'
    | 'under_review'
    | 'won'
    | 'lost';

/**
 * Minimal shape for klub_don used by dispute helpers
 */
export interface DisputeKlubDon {
    documentId: string;
    disputeId?: string | null;
    disputeClosedAt?: string | Date | null;
    klubr?: {
        documentId: string;
        denomination?: string;
        uuid?: string;
    } | null;
}
