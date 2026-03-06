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

    // Wrap in transaction: if any step fails, all changes are rolled back
    // to avoid leaving the schema in an inconsistent state on re-run.
    await knex.transaction(async (trx) => {
        await migrateUp(trx);
    });
}

async function migrateUp(trx) {
    await trx.schema.alterTable('webhook_logs', (table) => {
        // Rename columns
        table.renameColumn('account_id', 'stripe_account_id');
        table.renameColumn('error_message', 'processing_error');

        // Add new columns
        table.string('source');
        table.string('status').defaultTo('received');
    });

    // Migrate data: processed → status
    await trx('webhook_logs')
        .where('processed', true)
        .update({ status: 'processed' });
    await trx('webhook_logs')
        .where('processed', false)
        .update({ status: 'received' });

    // Backfill source: rows with stripe_account_id → 'connect', others → 'platform'
    await trx('webhook_logs')
        .whereNotNull('stripe_account_id')
        .update({ source: 'connect' });
    await trx('webhook_logs')
        .whereNull('stripe_account_id')
        .update({ source: 'platform' });

    // Now drop the old processed column and enforce NOT NULL on new columns
    await trx.schema.alterTable('webhook_logs', (table) => {
        table.dropColumn('processed');
        table.string('source').notNullable().alter();
        table.string('status').notNullable().defaultTo('received').alter();
    });

    // Add indexes (event_id already has unique constraint → implicit index)
    // Wrapped in try/catch for idempotency if up() is partially re-run
    try {
        await trx.schema.alterTable('webhook_logs', (table) => {
            table.index(['event_type'], 'idx_webhook_logs_event_type');
            table.index(['status'], 'idx_webhook_logs_status');
            table.index(['created_at'], 'idx_webhook_logs_created_at');
            table.index(['source'], 'idx_webhook_logs_source');
        });
    } catch (err: any) {
        if (!err.message?.includes('already exists')) throw err;
        // Indexes already exist from a previous partial run — safe to continue
    }

    // Drop obsolete index from previous migration (may not exist)
    try {
        await trx.schema.alterTable('webhook_logs', (table) => {
            table.dropIndex([], 'idx_webhook_logs_processed_retry');
        });
    } catch (err: any) {
        if (!err.message?.includes('does not exist') && !err.message?.includes('not found')) throw err;
        // Index does not exist — safe to continue
    }
}

export async function down(knex) {
    const hasTable = await knex.schema.hasTable('webhook_logs');
    if (!hasTable) return;

    await knex.transaction(async (trx) => {
        await migrateDown(trx);
    });
}

async function migrateDown(trx) {
    // Drop new indexes (try/catch for safety during partial rollbacks)
    try {
        await trx.schema.alterTable('webhook_logs', (table) => {
            table.dropIndex([], 'idx_webhook_logs_event_type');
            table.dropIndex([], 'idx_webhook_logs_status');
            table.dropIndex([], 'idx_webhook_logs_created_at');
            table.dropIndex([], 'idx_webhook_logs_source');
        });
    } catch (err: any) {
        if (!err.message?.includes('does not exist') && !err.message?.includes('not found')) throw err;
        // Indexes may not exist if up() was partially applied
    }

    // Re-add processed column
    await trx.schema.alterTable('webhook_logs', (table) => {
        table.boolean('processed').defaultTo(false).notNullable();
    });

    // Migrate status → processed
    // Note: 'ignored' and 'processing' map to processed:true as a best-effort rollback.
    // The old schema had no 'ignored' concept — expired events were simply marked processed:true.
    // 'processing' events (stuck mid-flight) are also mapped to processed:true to prevent
    // the old retry logic from re-processing them. This is lossy but acceptable for rollback.
    await trx('webhook_logs')
        .whereIn('status', ['processed', 'ignored', 'processing'])
        .update({ processed: true });

    // Clear processed_at for ignored events.
    // Note: this is slightly inconsistent — ignored events did have processed_at set
    // by the retry handler, and the old schema had this column too. We clear it here
    // because in the old flow, expired events were never explicitly timestamped.
    // This is a minor data fidelity trade-off in an already-lossy rollback.
    await trx('webhook_logs')
        .where('status', 'ignored')
        .update({ processed_at: null });

    // Drop new columns and rename back
    await trx.schema.alterTable('webhook_logs', (table) => {
        table.dropColumn('status');
        table.dropColumn('source');
        table.renameColumn('stripe_account_id', 'account_id');
        table.renameColumn('processing_error', 'error_message');
    });

    // Re-add old index
    await trx.schema.alterTable('webhook_logs', (table) => {
        table.index(['processed', 'retry_count'], 'idx_webhook_logs_processed_retry');
    });
}
