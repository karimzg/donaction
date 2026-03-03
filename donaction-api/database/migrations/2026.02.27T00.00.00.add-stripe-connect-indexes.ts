/**
 * Add performance indexes for Stripe Connect tables
 */
export async function up(knex) {
    // webhook_logs: index on processed for retry queries
    const hasWebhookLogsTable = await knex.schema.hasTable('webhook_logs');
    if (hasWebhookLogsTable) {
        await knex.schema.alterTable('webhook_logs', (table) => {
            table.index(['processed', 'retry_count'], 'idx_webhook_logs_processed_retry');
        });
    }

    // connected_accounts: index on stripe_account_id (most frequently queried column)
    const hasConnectedAccounts = await knex.schema.hasTable('connected_accounts');
    if (hasConnectedAccounts) {
        await knex.schema.alterTable('connected_accounts', (table) => {
            table.index(['stripe_account_id'], 'idx_connected_accounts_stripe_account_id');
        });
    }

    // financial_audit_logs: index on performed_at for time-range queries
    const hasAuditTable = await knex.schema.hasTable('financial_audit_logs');
    if (hasAuditTable) {
        await knex.schema.alterTable('financial_audit_logs', (table) => {
            table.index(['performed_at'], 'idx_financial_audit_logs_performed_at');
            table.index(['action_type'], 'idx_financial_audit_logs_action_type');
        });
    }
}

export async function down(knex) {
    const hasWebhookTable = await knex.schema.hasTable('webhook_logs');
    if (hasWebhookTable) {
        await knex.schema.alterTable('webhook_logs', (table) => {
            table.dropIndex([], 'idx_webhook_logs_processed_retry');
        });
    }

    const hasConnectedAccounts = await knex.schema.hasTable('connected_accounts');
    if (hasConnectedAccounts) {
        await knex.schema.alterTable('connected_accounts', (table) => {
            table.dropIndex([], 'idx_connected_accounts_stripe_account_id');
        });
    }

    const hasAuditTable = await knex.schema.hasTable('financial_audit_logs');
    if (hasAuditTable) {
        await knex.schema.alterTable('financial_audit_logs', (table) => {
            table.dropIndex([], 'idx_financial_audit_logs_performed_at');
            table.dropIndex([], 'idx_financial_audit_logs_action_type');
        });
    }
}
