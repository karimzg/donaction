import { Core, factories } from '@strapi/strapi';
import Stripe from 'stripe';
import {
    createConnectedAccount,
    generateAccountLink,
    syncAccountStatus,
    BusinessType,
} from '../../../helpers/stripe-connect-helper';
import { ConnectedAccountEntity } from '../../../_types';
import { logSimple } from '../../../helpers/logger';

export default factories.createCoreService(
    'api::connected-account.connected-account',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        /**
         * Creates a new Stripe connected account for a klubr
         */
        async createAccount(
            klubrId: number,
            businessType: BusinessType,
            country: string = 'FR'
        ): Promise<Stripe.Account> {
            logSimple({
                message: `Création compte Stripe Connect pour klubr ${klubrId}`,
                color: 'blue',
                prefix: 'StripeConnect',
            });

            return createConnectedAccount(klubrId, businessType, country);
        },

        /**
         * Generates an onboarding link for Stripe Connect account
         */
        async generateOnboardingLink(
            accountId: string,
            refreshUrl: string,
            returnUrl: string
        ): Promise<Stripe.AccountLink> {
            logSimple({
                message: `Génération lien onboarding pour compte ${accountId}`,
                color: 'blue',
                prefix: 'StripeConnect',
            });

            return generateAccountLink(accountId, refreshUrl, returnUrl);
        },

        /**
         * Syncs connected account status from Stripe to database
         */
        async syncAccountStatus(
            accountId: string
        ): Promise<ConnectedAccountEntity> {
            logSimple({
                message: `Synchronisation statut pour compte ${accountId}`,
                color: 'blue',
                prefix: 'StripeConnect',
            });

            return syncAccountStatus(accountId);
        },

        /**
         * Retrieves a connected account by Stripe account ID
         */
        async retrieveAccount(
            accountId: string
        ): Promise<ConnectedAccountEntity | null> {
            const account = await strapi.db
                .query('api::connected-account.connected-account')
                .findOne({
                    where: { stripe_account_id: accountId },
                    populate: { klubr: true },
                });

            return account as ConnectedAccountEntity | null;
        },

        /**
         * Retrieves a connected account by klubr ID
         */
        async retrieveAccountByKlubr(
            klubrId: number
        ): Promise<ConnectedAccountEntity | null> {
            const account = await strapi.db
                .query('api::connected-account.connected-account')
                .findOne({
                    where: { klubr: klubrId },
                    populate: { klubr: true },
                });

            return account as ConnectedAccountEntity | null;
        },

        /**
         * Updates connected account status manually
         */
        async updateAccountStatus(
            accountId: string,
            data: Partial<ConnectedAccountEntity>
        ): Promise<ConnectedAccountEntity> {
            const account = await strapi.db
                .query('api::connected-account.connected-account')
                .findOne({
                    where: { stripe_account_id: accountId },
                });

            if (!account) {
                throw new Error(
                    `Compte connecté introuvable: ${accountId}`
                );
            }

            const updated = await strapi.db
                .query('api::connected-account.connected-account')
                .update({
                    where: { id: account.id },
                    data: {
                        ...data,
                        last_sync: new Date(),
                    },
                });

            return updated as ConnectedAccountEntity;
        },

        /**
         * Lists all connected accounts with optional filtering
         */
        async listAccounts(filters?: {
            account_status?: string;
            verification_status?: string;
            onboarding_completed?: boolean;
        }): Promise<ConnectedAccountEntity[]> {
            const where: any = {};

            if (filters?.account_status) {
                where.account_status = { $eq: filters.account_status };
            }

            if (filters?.verification_status) {
                where.verification_status = {
                    $eq: filters.verification_status,
                };
            }

            if (filters?.onboarding_completed !== undefined) {
                where.onboarding_completed = {
                    $eq: filters.onboarding_completed,
                };
            }

            const accounts = await strapi.db
                .query('api::connected-account.connected-account')
                .findMany({
                    where,
                    populate: { klubr: true },
                    orderBy: [{ createdAt: 'desc' }],
                });

            return accounts as ConnectedAccountEntity[];
        },
    })
);
