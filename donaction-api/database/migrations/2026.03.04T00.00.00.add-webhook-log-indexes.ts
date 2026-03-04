/**
 * Add performance indexes for webhook_logs table
 * Supports: idempotence lookups (event_id), filtering by type/status, time-range queries
 */
export async function up(knex) {
    const hasTable = await knex.schema.hasTable('webhook_logs');
    if (!hasTable) return;

    await knex.schema.alterTable('webhook_logs', (table) => {
        table.index(['event_id'], 'idx_webhook_logs_event_id');
        table.index(['event_type'], 'idx_webhook_logs_event_type');
        table.index(['status'], 'idx_webhook_logs_status');
        table.index(['created_at'], 'idx_webhook_logs_created_at');
    });
}

export async function down(knex) {
    const hasTable = await knex.schema.hasTable('webhook_logs');
    if (!hasTable) return;

    await knex.schema.alterTable('webhook_logs', (table) => {
        table.dropIndex([], 'idx_webhook_logs_event_id');
        table.dropIndex([], 'idx_webhook_logs_event_type');
        table.dropIndex([], 'idx_webhook_logs_status');
        table.dropIndex([], 'idx_webhook_logs_created_at');
    });
}
