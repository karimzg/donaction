import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { strapiLog, logSimple, logBlock, COLORS } from './index';

describe('strapiLog', () => {
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
        delete (globalThis as any).strapi;
    });

    describe('when strapi.log is available', () => {
        const mockStrapiLog = {
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
        };

        beforeEach(() => {
            (globalThis as any).strapi = { log: mockStrapiLog };
        });

        it('info delegates to strapi.log.info', () => {
            strapiLog.info('test message');
            expect(mockStrapiLog.info).toHaveBeenCalledWith('test message');
            expect(console.log).not.toHaveBeenCalled();
        });

        it('warn delegates to strapi.log.warn', () => {
            strapiLog.warn('warning');
            expect(mockStrapiLog.warn).toHaveBeenCalledWith('warning');
            expect(console.warn).not.toHaveBeenCalled();
        });

        it('error delegates to strapi.log.error', () => {
            strapiLog.error('error msg');
            expect(mockStrapiLog.error).toHaveBeenCalledWith('error msg');
        });

        it('error with second arg concatenates', () => {
            strapiLog.error('prefix:', 'details');
            expect(mockStrapiLog.error).toHaveBeenCalledWith(
                'prefix: details'
            );
        });
    });

    describe('when strapi is not available', () => {
        it('info falls back to console.log', () => {
            strapiLog.info('fallback');
            expect(console.log).toHaveBeenCalledWith('fallback');
        });

        it('warn falls back to console.warn', () => {
            strapiLog.warn('fallback warn');
            expect(console.warn).toHaveBeenCalledWith('fallback warn');
        });

        it('error falls back to console.error', () => {
            strapiLog.error('fallback error');
            expect(console.error).toHaveBeenCalledWith('fallback error', '');
        });
    });
});

describe('logSimple', () => {
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('outputs formatted message with prefix', () => {
        logSimple({ message: 'hello', prefix: 'Test' });
        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining('hello')
        );
        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining('[Test]')
        );
    });
});

describe('logBlock', () => {
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('does nothing with empty entries', () => {
        logBlock({ statusColor: COLORS.blue, entries: [] });
        expect(console.log).not.toHaveBeenCalled();
    });

    it('outputs separator and entries', () => {
        logBlock({
            statusColor: COLORS.green,
            entries: [{ key: 'Action', value: 'test' }],
            prefix: 'Test',
        });
        // separator + entry + separator = at least 3 calls + 1 blank line
        expect(console.log).toHaveBeenCalledTimes(4);
    });
});
