import { Core, factories } from '@strapi/strapi';
import Stripe from 'stripe';
import {
    createConnectedAccount,
    generateAccountLink,
    syncAccountStatus,
    BusinessType,
} from '../../../helpers/stripe-connect-helper';
import { ConnectedAccountEntity } from '../../../_types';

export default factories.createCoreService(
    'api::stripe-connect.stripe-connect',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        /**
         * Creates a new Stripe connected account for a klubr
         * @param klubrId - Klubr database ID
         * @param businessType - Business type for Stripe account
         * @param country - Country code (default: FR)
         * @returns Created Stripe account
         */
        async createAccount(
            klubrId: number,
            businessType: BusinessType,
            country: string = 'FR'
        ): Promise<Stripe.Account> {
            console.log(
                `🔵 Service: Création compte Stripe Connect pour klubr ${klubrId}`
            );

            const account = await createConnectedAccount(
                klubrId,
                businessType,
                country
            );

            return account;
        },

        /**
         * Generates an onboarding link for Stripe Connect account
         * @param accountId - Stripe account ID
         * @param refreshUrl - URL to redirect if link expires
         * @param returnUrl - URL to redirect after onboarding
         * @returns Account link object
         */
        async generateOnboardingLink(
            accountId: string,
            refreshUrl: string,
            returnUrl: string
        ): Promise<Stripe.AccountLink> {
            console.log(
                `🔗 Service: Génération lien onboarding pour compte ${accountId}`
            );

            const accountLink = await generateAccountLink(
                accountId,
                refreshUrl,
                returnUrl
            );

            return accountLink;
        },

        /**
         * Syncs connected account status from Stripe to database
         * @param accountId - Stripe account ID
         * @returns Updated connected account entity
         */
        async syncAccountStatus(
            accountId: string
        ): Promise<ConnectedAccountEntity> {
            console.log(
                `🔄 Service: Synchronisation statut pour compte ${accountId}`
            );

            const updatedAccount = await syncAccountStatus(accountId);

            return updatedAccount;
        },

        /**
         * Retrieves a connected account by Stripe account ID
         * @param accountId - Stripe account ID
         * @returns Connected account entity or null
         */
        async retrieveAccount(
            accountId: string
        ): Promise<ConnectedAccountEntity | null> {
            console.log(
                `🔍 Service: Récupération compte connecté ${accountId}`
            );

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
         * @param klubrId - Klubr database ID
         * @returns Connected account entity or null
         */
        async retrieveAccountByKlubr(
            klubrId: number
        ): Promise<ConnectedAccountEntity | null> {
            console.log(
                `🔍 Service: Récupération compte connecté pour klubr ${klubrId}`
            );

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
         * @param accountId - Stripe account ID
         * @param data - Data to update
         * @returns Updated connected account entity
         */
        async updateAccountStatus(
            accountId: string,
            data: Partial<ConnectedAccountEntity>
        ): Promise<ConnectedAccountEntity> {
            console.log(
                `✏️ Service: Mise à jour manuelle du compte ${accountId}`
            );

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
         * @param filters - Filter criteria
         * @returns Array of connected account entities
         */
        async listAccounts(filters?: {
            account_status?: string;
            verification_status?: string;
            onboarding_completed?: boolean;
        }): Promise<ConnectedAccountEntity[]> {
            console.log(`📋 Service: Liste des comptes connectés`);

            const where: any = {};

            if (filters?.account_status) {
                where.account_status = { $eq: filters.account_status };
            }

            if (filters?.verification_status) {
                where.verification_status = { $eq: filters.verification_status };
            }

            if (filters?.onboarding_completed !== undefined) {
                where.onboarding_completed = { $eq: filters.onboarding_completed };
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
