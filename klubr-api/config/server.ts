import cronTasks from './cronTasks';

export default ({ env }: { env: any }) => ({
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    app: {
        keys: env.array('APP_KEYS', ['myKeyA', 'myKeyB']),
    },
    url: env('STRAPI_PUBLIC_URL', undefined),
    webhooks: {
        // Add this to not receive populated relations in webhooks
        populateRelations: false,
    },
    cron: {
        enabled: env.bool('CRON_ENABLED', true),
        tasks: cronTasks,
    },
    settings: {
        // ...
        logger: {
            level: env('LOG_LEVEL', 'info'),
            // L'emplacement des journaux peut être spécifié ici
            // Exemple : 'logs/strapi.log'
        },
    },
});
