import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import type Stripe from 'stripe';
import type { Core } from '@strapi/strapi';

// Stub env vars before importing helpers
vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_fake');
vi.stubEnv('STRIPE_WEBHOOK_SECRET_CONNECT', 'whsec_fake');

// Module references (populated in beforeAll after mocks are set up)
let handleWebhookEvent: Awaited<typeof import('../../../helpers/stripe-webhook-handlers')>['handleWebhookEvent'];

// Mock Strapi's createCoreController factory to capture the inner function
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
    COLORS: { reset: '', green: '', blue: '', yellow: '', red: '', gray: '' },
}));

vi.mock('../../../helpers/sanitizeHelpers', () => ({
    removeId: vi.fn((data) => data),
}));

vi.mock('../../../constants', () => ({
    ALLOWED_ONBOARDING_DOMAINS: ['https://donaction.fr'],
}));

// --- Mock infrastructure ---

const mockSend = vi.fn();
const mockBadRequest = vi.fn();
const mockNotFound = vi.fn();
const mockInternalServerError = vi.fn();

const mockDocumentsCreate = vi.fn();
const mockDocumentsUpdate = vi.fn();
const mockDbQueryFindOne = vi.fn();
const mockDbQueryUpdate = vi.fn();

/** Build a mock strapi instance */
const buildMockStrapi = () => ({
    requestContext: {
        get: () => ({
            state: { stripeEvent: null as Stripe.Event | null },
            send: mockSend,
            badRequest: mockBadRequest,
            notFound: mockNotFound,
            internalServerError: mockInternalServerError,
        }),
    },
    documents: vi.fn().mockReturnValue({
        create: mockDocumentsCreate,
        update: mockDocumentsUpdate,
    }),
    db: {
        query: vi.fn().mockReturnValue({
            findOne: mockDbQueryFindOne,
            update: mockDbQueryUpdate,
        }),
    },
    service: vi.fn().mockReturnValue({}),
});

/** Build a minimal Stripe event for testing */
const makeEvent = (overrides: Partial<Stripe.Event> = {}): Stripe.Event =>
    ({
        id: 'evt_test_123',
        type: 'account.updated',
        data: { object: { id: 'acct_test' } },
        account: 'acct_connect_123',
        ...overrides,
    }) as unknown as Stripe.Event;

describe('handleWebhook — idempotency', () => {
    let controller: Record<string, Function>;
    let mockStrapi: ReturnType<typeof buildMockStrapi>;
    let factoryFn: Function;

    beforeAll(async () => {
        const mod = await import('./stripe-connect');
        factoryFn = (mod.default as any).__factoryFn;

        const handlers = await import('../../../helpers/stripe-webhook-handlers');
        handleWebhookEvent = handlers.handleWebhookEvent;
    });

    beforeEach(() => {
        vi.clearAllMocks();
        mockStrapi = buildMockStrapi();
        controller = factoryFn({ strapi: mockStrapi });
    });

    /** Inject event into the mock context */
    const setEvent = (event: Stripe.Event) => {
        mockStrapi.requestContext.get = () => ({
            state: { stripeEvent: event },
            send: mockSend,
            badRequest: mockBadRequest,
            notFound: mockNotFound,
            internalServerError: mockInternalServerError,
        });
    };

    it('creates webhook-log with status "received" for new event', async () => {
        const event = makeEvent();
        setEvent(event);

        const createdLog = {
            id: 1,
            documentId: 'doc_abc',
            event_id: event.id,
            status: 'received',
            retry_count: 0,
        };

        mockDocumentsCreate.mockResolvedValue(createdLog);
        mockDbQueryUpdate.mockResolvedValue(createdLog); // optimistic lock succeeds

        await controller.handleWebhook();

        // Verify webhook-log was created with correct fields
        expect(mockStrapi.documents).toHaveBeenCalledWith('api::webhook-log.webhook-log');
        expect(mockDocumentsCreate).toHaveBeenCalledWith({
            data: expect.objectContaining({
                event_id: event.id,
                event_type: event.type,
                stripe_account_id: 'acct_connect_123',
                source: 'connect',
                status: 'received',
                retry_count: 0,
            }),
        });
    });

    it('sets source to "platform" when event has no account', async () => {
        const event = makeEvent({ account: undefined });
        setEvent(event);

        const createdLog = {
            id: 1,
            documentId: 'doc_abc',
            event_id: event.id,
            status: 'received',
            retry_count: 0,
        };

        mockDocumentsCreate.mockResolvedValue(createdLog);
        mockDbQueryUpdate.mockResolvedValue(createdLog);

        await controller.handleWebhook();

        expect(mockDocumentsCreate).toHaveBeenCalledWith({
            data: expect.objectContaining({
                source: 'platform',
                stripe_account_id: null,
            }),
        });
    });

    it('returns { received: true } without reprocessing for already-processed duplicate', async () => {
        const event = makeEvent();
        setEvent(event);

        // Simulate unique constraint violation
        const uniqueError = new Error('duplicate') as any;
        uniqueError.code = '23505';
        uniqueError.detail = 'already exists';
        mockDocumentsCreate.mockRejectedValue(uniqueError);

        // Existing log is already processed
        mockDbQueryFindOne.mockResolvedValue({
            id: 1,
            documentId: 'doc_existing',
            event_id: event.id,
            status: 'processed',
        });

        await controller.handleWebhook();

        expect(mockSend).toHaveBeenCalledWith({ received: true });
        expect(handleWebhookEvent).not.toHaveBeenCalled();
        // Audit trail preserved — status NOT overwritten to 'ignored'
        expect(mockDbQueryUpdate).not.toHaveBeenCalled();
    });

    it('handles concurrent duplicate via PostgreSQL unique constraint', async () => {
        const event = makeEvent();
        setEvent(event);

        // Simulate unique constraint violation
        const uniqueError = new Error('duplicate') as any;
        uniqueError.code = '23505';
        uniqueError.detail = 'already exists';
        mockDocumentsCreate.mockRejectedValue(uniqueError);

        // Existing log is still in received state (the first request is processing it)
        mockDbQueryFindOne.mockResolvedValue({
            id: 1,
            documentId: 'doc_existing',
            event_id: event.id,
            status: 'received',
            retry_count: 0,
        });

        // Optimistic lock fails (first request already claimed it)
        mockDbQueryUpdate.mockResolvedValue(null);

        await controller.handleWebhook();

        // Should return success without double-processing
        expect(mockSend).toHaveBeenCalledWith({ received: true });
        expect(handleWebhookEvent).not.toHaveBeenCalled();
    });

    it('only one worker claims the event via optimistic lock', async () => {
        const event = makeEvent();
        setEvent(event);

        const createdLog = {
            id: 1,
            documentId: 'doc_abc',
            event_id: event.id,
            status: 'received',
            retry_count: 0,
        };

        mockDocumentsCreate.mockResolvedValue(createdLog);

        // Optimistic lock succeeds — WHERE status='received' matches
        mockDbQueryUpdate.mockResolvedValue(createdLog);

        await controller.handleWebhook();

        // Verify optimistic lock uses status-based WHERE clause
        expect(mockDbQueryUpdate).toHaveBeenCalledWith({
            where: { id: 1, status: 'received' },
            data: { status: 'processing' },
        });

        expect(handleWebhookEvent).toHaveBeenCalled();
    });

    it('sets status to "processed" after successful handling', async () => {
        const event = makeEvent();
        setEvent(event);

        const createdLog = {
            id: 1,
            documentId: 'doc_abc',
            event_id: event.id,
            status: 'received',
            retry_count: 0,
        };

        mockDocumentsCreate.mockResolvedValue(createdLog);
        mockDbQueryUpdate.mockResolvedValue(createdLog);

        await controller.handleWebhook();

        expect(mockDocumentsUpdate).toHaveBeenCalledWith({
            documentId: 'doc_abc',
            data: expect.objectContaining({
                status: 'processed',
                processing_error: null,
            }),
        });
    });

    it('sets status to "failed" on handler error', async () => {
        const event = makeEvent();
        setEvent(event);

        const createdLog = {
            id: 1,
            documentId: 'doc_abc',
            event_id: event.id,
            status: 'received',
            retry_count: 0,
        };

        mockDocumentsCreate.mockResolvedValue(createdLog);
        mockDbQueryUpdate.mockResolvedValue(createdLog);
        vi.mocked(handleWebhookEvent).mockRejectedValueOnce(new Error('handler boom'));

        await controller.handleWebhook();

        expect(mockDocumentsUpdate).toHaveBeenCalledWith({
            documentId: 'doc_abc',
            data: expect.objectContaining({
                status: 'failed',
                processing_error: 'handler boom',
                retry_count: 1,
            }),
        });

        // Still returns 200 to Stripe
        expect(mockSend).toHaveBeenCalledWith({ received: true });
    });

    it('rethrows non-unique-constraint errors from create', async () => {
        const event = makeEvent();
        setEvent(event);

        const connectionError = new Error('connection timeout');
        mockDocumentsCreate.mockRejectedValue(connectionError);

        await controller.handleWebhook();

        // Should hit the outer catch and return 500
        expect(mockInternalServerError).toHaveBeenCalled();
    });
});
