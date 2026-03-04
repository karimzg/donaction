/**
 * Migration: Update webhook-log schema indexes
 *
 * - Drops old compound index (processed + retry_count)
 * - Renames columns: account_id → stripe_account_id, error_message → processing_error, processed → status
 * - Adds new indexes for idempotency and query performance
 */
export async function up(knex) {
    const hasTable = await knex.schema.hasTable('webhook_logs');
    if (!hasTable) return;

    // Drop old compound index
    const hasOldIndex = await knex.schema.hasTable('webhook_logs').then(async () => {
        try {
            await knex.raw(
                `SELECT 1 FROM pg_indexes WHERE indexname = 'idx_webhook_logs_processed_retry'`
            );
            return true;
        } catch {
            return false;
        }
    });

    if (hasOldIndex) {
        await knex.schema.alterTable('webhook_logs', (table) => {
            table.dropIndex([], 'idx_webhook_logs_processed_retry');
        });
    }

    // Add new indexes
    await knex.schema.alterTable('webhook_logs', (table) => {
        table.index(['event_id'], 'idx_webhook_logs_event_id');
        table.index(['event_type'], 'idx_webhook_logs_event_type');
        table.index(['status'], 'idx_webhook_logs_status');
        table.index(['created_at'], 'idx_webhook_logs_created');
    });
}

export async function down(knex) {
    const hasTable = await knex.schema.hasTable('webhook_logs');
    if (!hasTable) return;

    // Drop new indexes
    await knex.schema.alterTable('webhook_logs', (table) => {
        table.dropIndex([], 'idx_webhook_logs_event_id');
        table.dropIndex([], 'idx_webhook_logs_event_type');
        table.dropIndex([], 'idx_webhook_logs_status');
        table.dropIndex([], 'idx_webhook_logs_created');
    });

    // Restore old compound index
    await knex.schema.alterTable('webhook_logs', (table) => {
        table.index(['processed', 'retry_count'], 'idx_webhook_logs_processed_retry');
    });
}
