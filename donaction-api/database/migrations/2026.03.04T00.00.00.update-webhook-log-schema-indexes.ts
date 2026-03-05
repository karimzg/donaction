/**
 * Migration: Update webhook-log schema (US-WH-001)
 *
 * 1. Rename columns: account_id → stripe_account_id, error_message → processing_error
 * 2. Convert processed (boolean) → status (string enum)
 * 3. Add source column with backfill
 * 4. Drop old compound index, add new indexes
 *
 * Compatible with both PostgreSQL (prod) and SQLite (dev).
 */

/** Check if a column exists in the table */
async function hasColumn(knex, table: string, column: string): Promise<boolean> {
    return knex.schema.hasColumn(table, column);
}

/** Safely drop an index — catches errors if the index doesn't exist */
async function safeDropIndex(knex, table: string, indexName: string): Promise<void> {
    try {
        await knex.schema.alterTable(table, (t) => {
            t.dropIndex([], indexName);
        });
    } catch {
        // Index doesn't exist — ignore
    }
}

export async function up(knex) {
    const hasTable = await knex.schema.hasTable('webhook_logs');
    if (!hasTable) return;

    // --- Step 1: Rename columns ---

    if (await hasColumn(knex, 'webhook_logs', 'account_id')) {
        await knex.schema.alterTable('webhook_logs', (table) => {
            table.renameColumn('account_id', 'stripe_account_id');
        });
    }

    if (await hasColumn(knex, 'webhook_logs', 'error_message')) {
        await knex.schema.alterTable('webhook_logs', (table) => {
            table.renameColumn('error_message', 'processing_error');
        });
    }

    // --- Step 2: Convert processed (boolean) → status (string) ---

    if (await hasColumn(knex, 'webhook_logs', 'processed')) {
        // Add status column
        await knex.schema.alterTable('webhook_logs', (table) => {
            table.string('status').defaultTo('received').notNullable();
        });

        // Migrate data: processed=true → 'processed', processed=false → 'received'
        await knex('webhook_logs').where({ processed: true }).update({ status: 'processed' });
        await knex('webhook_logs').where({ processed: false }).update({ status: 'received' });

        // Drop old boolean column
        await knex.schema.alterTable('webhook_logs', (table) => {
            table.dropColumn('processed');
        });
    }

    // --- Step 3: Add source column with backfill ---

    if (!(await hasColumn(knex, 'webhook_logs', 'source'))) {
        await knex.schema.alterTable('webhook_logs', (table) => {
            table.string('source').defaultTo('connect').notNullable();
        });

        // Backfill: rows with stripe_account_id → 'connect', without → 'platform'
        await knex('webhook_logs')
            .whereNull('stripe_account_id')
            .update({ source: 'platform' });
        // Rows with stripe_account_id already default to 'connect'
    }

    // --- Step 4: Drop old index, add new indexes ---

    await safeDropIndex(knex, 'webhook_logs', 'idx_webhook_logs_processed_retry');

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
    await safeDropIndex(knex, 'webhook_logs', 'idx_webhook_logs_event_id');
    await safeDropIndex(knex, 'webhook_logs', 'idx_webhook_logs_event_type');
    await safeDropIndex(knex, 'webhook_logs', 'idx_webhook_logs_status');
    await safeDropIndex(knex, 'webhook_logs', 'idx_webhook_logs_created');

    // Restore processed boolean from status
    if (await hasColumn(knex, 'webhook_logs', 'status')) {
        await knex.schema.alterTable('webhook_logs', (table) => {
            table.boolean('processed').defaultTo(false).notNullable();
        });

        await knex('webhook_logs').where({ status: 'processed' }).update({ processed: true });
        await knex('webhook_logs').whereNot({ status: 'processed' }).update({ processed: false });

        await knex.schema.alterTable('webhook_logs', (table) => {
            table.dropColumn('status');
        });
    }

    // Drop source column
    if (await hasColumn(knex, 'webhook_logs', 'source')) {
        await knex.schema.alterTable('webhook_logs', (table) => {
            table.dropColumn('source');
        });
    }

    // Rename columns back
    if (await hasColumn(knex, 'webhook_logs', 'stripe_account_id')) {
        await knex.schema.alterTable('webhook_logs', (table) => {
            table.renameColumn('stripe_account_id', 'account_id');
        });
    }

    if (await hasColumn(knex, 'webhook_logs', 'processing_error')) {
        await knex.schema.alterTable('webhook_logs', (table) => {
            table.renameColumn('processing_error', 'error_message');
        });
    }

    // Restore old compound index
    await knex.schema.alterTable('webhook_logs', (table) => {
        table.index(['processed', 'retry_count'], 'idx_webhook_logs_processed_retry');
    });
}
