import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

// Stub env vars before importing helpers
vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_fake');
vi.stubEnv('STRIPE_WEBHOOK_SECRET_CONNECT', 'whsec_fake');

// Module references (populated in beforeAll after mocks are set up)
let handleWebhookEvent: Awaited<
    typeof import('../../../helpers/stripe-webhook-handlers')
>['handleWebhookEvent'];
let isDuplicateStatus: Awaited<
    typeof import('../../webhook-log/services/webhook-log-helpers')
>['isDuplicateStatus'];

// Mock Strapi's createCoreController factory to capture the inner function.
vi.mock('@strapi/strapi', () => ({
    factories: {
        createCoreController: (_uid: string, fn: Function) => {
            return { __factoryFn: fn };
        },
    },
}));

vi.mock('../../../helpers/stripe-webhook-handlers', () => ({
    handleWebhookEvent: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../../helpers/logger', () => ({
    logBlock: vi.fn(),
    logSimple: vi.fn(),
    strapiLog: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    COLORS: {
        reset: '',
        green: '',
        blue: '',
        yellow: '',
        red: '',
        gray: '',
    },
}));

vi.mock('../../../helpers/sanitizeHelpers', () => ({
    removeId: vi.fn((data: any) => data),
}));

vi.mock('../../webhook-log/services/webhook-log-helpers', () => ({
    isDuplicateStatus: vi.fn().mockReturnValue(false),
}));

vi.mock('../../../helpers/stripe-connect-helper', () => ({
    stripe: {},
}));

// ---------- Helpers ----------

/** Build a minimal Stripe event object for testing */
const makeStripeEvent = (
    overrides: Record<string, any> = {}
): Record<string, any> => ({
    id: 'evt_test_123',
    type: 'account.updated',
    account: 'acct_connect_123',
    data: { object: { id: 'acct_connect_123' } },
    ...overrides,
});

/** Build a mock Koa context */
const makeCtx = (
    stripeEvent: Record<string, any> | null = makeStripeEvent()
) => ({
    state: { stripeEvent },
    send: vi.fn(),
    badRequest: vi.fn(),
    internalServerError: vi.fn(),
});

/** Build a mock webhook log entry */
const makeWebhookLog = (
    overrides: Record<string, any> = {}
): Record<string, any> => ({
    id: 1,
    documentId: 'doc_abc123',
    event_id: 'evt_test_123',
    status: 'received',
    retry_count: 0,
    ...overrides,
});

// ---------- Test suite ----------

describe('stripe-connect handleWebhook controller', () => {
    let controller: Record<string, Function>;
    let mockStrapi: any;

    beforeAll(async () => {
        // Import mocked modules
        const webhookHandlers = await import(
            '../../../helpers/stripe-webhook-handlers'
        );
        handleWebhookEvent = webhookHandlers.handleWebhookEvent;

        const webhookLogHelpers = await import(
            '../../webhook-log/services/webhook-log-helpers'
        );
        isDuplicateStatus = webhookLogHelpers.isDuplicateStatus;
    });

    beforeEach(async () => {
        vi.clearAllMocks();

        // Build mock strapi instance
        mockStrapi = {
            requestContext: {
                get: vi.fn(),
            },
            documents: vi.fn().mockReturnValue({
                create: vi.fn().mockResolvedValue(makeWebhookLog()),
                update: vi.fn().mockResolvedValue(makeWebhookLog()),
            }),
            db: {
                query: vi.fn().mockReturnValue({
                    findOne: vi.fn().mockResolvedValue(null),
                    update: vi
                        .fn()
                        .mockResolvedValue(
                            makeWebhookLog({ status: 'processing' })
                        ),
                }),
            },
            service: vi.fn().mockReturnValue({}),
        };

        // Import controller and extract factory function
        const controllerModule = await import('./stripe-connect');
        const factoryFn = (controllerModule.default as any).__factoryFn;
        controller = factoryFn({ strapi: mockStrapi });
    });

    // --- Validation ---

    it('returns 400 when stripeEvent is missing from ctx.state', async () => {
        const ctx = makeCtx(null);
        mockStrapi.requestContext.get.mockReturnValue(ctx);

        await controller.handleWebhook();

        expect(ctx.badRequest).toHaveBeenCalledWith(
            expect.stringContaining('manquant')
        );
    });

    it('returns 400 when event type is missing', async () => {
        const ctx = makeCtx(makeStripeEvent({ type: undefined }));
        mockStrapi.requestContext.get.mockReturnValue(ctx);

        await controller.handleWebhook();

        expect(ctx.badRequest).toHaveBeenCalledWith(
            expect.stringContaining('invalide')
        );
    });

    it('returns 400 when event id is missing', async () => {
        const ctx = makeCtx(makeStripeEvent({ id: undefined }));
        mockStrapi.requestContext.get.mockReturnValue(ctx);

        await controller.handleWebhook();

        expect(ctx.badRequest).toHaveBeenCalledWith(
            expect.stringContaining('invalide')
        );
    });

    it('returns 400 when event data is missing', async () => {
        const ctx = makeCtx(makeStripeEvent({ data: undefined }));
        mockStrapi.requestContext.get.mockReturnValue(ctx);

        await controller.handleWebhook();

        expect(ctx.badRequest).toHaveBeenCalledWith(
            expect.stringContaining('invalide')
        );
    });

    // --- Idempotency: duplicate via unique constraint ---

    it('returns 200 for duplicate event (unique constraint race)', async () => {
        const ctx = makeCtx();
        mockStrapi.requestContext.get.mockReturnValue(ctx);

        // Simulate unique constraint violation on create
        const uniqueError = new Error('unique violation');
        (uniqueError as any).code = '23505';
        (uniqueError as any).detail = 'Key already exists';
        mockStrapi.documents.mockReturnValue({
            create: vi.fn().mockRejectedValue(uniqueError),
            update: vi.fn().mockResolvedValue(makeWebhookLog()),
        });

        // findOne returns existing log with 'processed' status
        const existingLog = makeWebhookLog({ status: 'processed' });
        mockStrapi.db.query.mockReturnValue({
            findOne: vi.fn().mockResolvedValue(existingLog),
            update: vi.fn(),
        });

        vi.mocked(isDuplicateStatus).mockReturnValue(true);

        await controller.handleWebhook();

        expect(ctx.send).toHaveBeenCalledWith({ received: true });
        expect(handleWebhookEvent).not.toHaveBeenCalled();
    });

    // --- Idempotency: optimistic lock fails ---

    it('returns 200 when optimistic lock claim fails (concurrent processing)', async () => {
        const ctx = makeCtx();
        mockStrapi.requestContext.get.mockReturnValue(ctx);

        // Create succeeds, but claim fails (null returned from update)
        mockStrapi.db.query.mockReturnValue({
            findOne: vi.fn(),
            update: vi.fn().mockResolvedValue(null),
        });

        await controller.handleWebhook();

        expect(ctx.send).toHaveBeenCalledWith({ received: true });
        expect(handleWebhookEvent).not.toHaveBeenCalled();
    });

    // --- Happy path ---

    it('processes event successfully and returns 200', async () => {
        const ctx = makeCtx();
        mockStrapi.requestContext.get.mockReturnValue(ctx);

        await controller.handleWebhook();

        expect(handleWebhookEvent).toHaveBeenCalledWith(
            mockStrapi,
            ctx.state.stripeEvent
        );
        expect(ctx.send).toHaveBeenCalledWith({ received: true });
    });

    it('sets source to "connect" when event.account is present', async () => {
        const ctx = makeCtx(
            makeStripeEvent({ account: 'acct_connect_456' })
        );
        mockStrapi.requestContext.get.mockReturnValue(ctx);

        await controller.handleWebhook();

        expect(mockStrapi.documents).toHaveBeenCalledWith(
            'api::webhook-log.webhook-log'
        );
        const createCall = mockStrapi.documents().create;
        expect(createCall).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    source: 'connect',
                }),
            })
        );
    });

    it('sets source to "platform" when event.account is absent', async () => {
        const ctx = makeCtx(
            makeStripeEvent({ account: undefined })
        );
        mockStrapi.requestContext.get.mockReturnValue(ctx);

        await controller.handleWebhook();

        expect(mockStrapi.documents).toHaveBeenCalledWith(
            'api::webhook-log.webhook-log'
        );
        const createCall = mockStrapi.documents().create;
        expect(createCall).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    source: 'platform',
                }),
            })
        );
    });

    // --- Handler error ---

    it('returns 200 even when handler throws (avoids Stripe retries)', async () => {
        const ctx = makeCtx();
        mockStrapi.requestContext.get.mockReturnValue(ctx);

        vi.mocked(handleWebhookEvent).mockRejectedValueOnce(
            new Error('handler crash')
        );

        await controller.handleWebhook();

        // Should still return 200 to Stripe
        expect(ctx.send).toHaveBeenCalledWith({ received: true });
        // Status should be updated to 'failed'
        const updateCall = mockStrapi.documents().update;
        expect(updateCall).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    status: 'failed',
                    processing_error: 'handler crash',
                }),
            })
        );
    });

    // --- Unexpected error ---

    it('returns 500 for unexpected infrastructure errors', async () => {
        const ctx = makeCtx();
        mockStrapi.requestContext.get.mockReturnValue(ctx);

        // Simulate an unexpected error (not unique constraint)
        const dbError = new Error('connection timeout');
        mockStrapi.documents.mockReturnValue({
            create: vi.fn().mockRejectedValue(dbError),
            update: vi.fn(),
        });

        await controller.handleWebhook();

        expect(ctx.internalServerError).toHaveBeenCalled();
    });
});
