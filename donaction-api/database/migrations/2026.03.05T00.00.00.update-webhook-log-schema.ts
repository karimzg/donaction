/**
 * Migration: Update webhook_logs schema to match US-WH-001 spec
 *
 * Changes:
 * - Rename account_id → stripe_account_id
 * - Rename error_message → processing_error
 * - Add source enum column (platform/connect)
 * - Add status enum column, migrate from processed boolean
 * - Drop processed boolean column
 * - Add recommended SQL indexes
 * - Drop obsolete index
 */
export async function up(knex) {
    const hasTable = await knex.schema.hasTable('webhook_logs');
    if (!hasTable) return;

    await knex.schema.alterTable('webhook_logs', (table) => {
        // Rename columns
        table.renameColumn('account_id', 'stripe_account_id');
        table.renameColumn('error_message', 'processing_error');

        // Add new columns
        table.string('source');
        table.string('status').defaultTo('received');
    });

    // Migrate data: processed → status
    await knex('webhook_logs')
        .where('processed', true)
        .update({ status: 'processed' });
    await knex('webhook_logs')
        .where('processed', false)
        .update({ status: 'received' });

    // Backfill source: rows with stripe_account_id → 'connect', others → 'platform'
    await knex('webhook_logs')
        .whereNotNull('stripe_account_id')
        .update({ source: 'connect' });
    await knex('webhook_logs')
        .whereNull('stripe_account_id')
        .update({ source: 'platform' });

    // Now drop the old processed column and enforce NOT NULL on new columns
    await knex.schema.alterTable('webhook_logs', (table) => {
        table.dropColumn('processed');
        table.string('source').notNullable().alter();
        table.string('status').notNullable().defaultTo('received').alter();
    });

    // Add indexes (event_id already has unique constraint → implicit index)
    await knex.schema.alterTable('webhook_logs', (table) => {
        table.index(['event_type'], 'idx_webhook_logs_event_type');
        table.index(['status'], 'idx_webhook_logs_status');
        table.index(['created_at'], 'idx_webhook_logs_created_at');
        table.index(['source'], 'idx_webhook_logs_source');
    });

    // Drop obsolete index from previous migration (may not exist)
    try {
        await knex.schema.alterTable('webhook_logs', (table) => {
            table.dropIndex([], 'idx_webhook_logs_processed_retry');
        });
    } catch {
        // Index may not exist if previous migration was not run
    }
}

export async function down(knex) {
    const hasTable = await knex.schema.hasTable('webhook_logs');
    if (!hasTable) return;

    // Drop new indexes
    await knex.schema.alterTable('webhook_logs', (table) => {
        table.dropIndex([], 'idx_webhook_logs_event_type');
        table.dropIndex([], 'idx_webhook_logs_status');
        table.dropIndex([], 'idx_webhook_logs_created_at');
        table.dropIndex([], 'idx_webhook_logs_source');
    });

    // Re-add processed column
    await knex.schema.alterTable('webhook_logs', (table) => {
        table.boolean('processed').defaultTo(false).notNullable();
    });

    // Migrate status → processed
    await knex('webhook_logs')
        .where('status', 'processed')
        .update({ processed: true });

    // Drop new columns and rename back
    await knex.schema.alterTable('webhook_logs', (table) => {
        table.dropColumn('status');
        table.dropColumn('source');
        table.renameColumn('stripe_account_id', 'account_id');
        table.renameColumn('processing_error', 'error_message');
    });

    // Re-add old index
    await knex.schema.alterTable('webhook_logs', (table) => {
        table.index(['processed', 'retry_count'], 'idx_webhook_logs_processed_retry');
    });
}
