import { vi } from 'vitest';

/**
 * Mock for src/utils/fetch.ts
 *
 * Provides a mockable Fetch function for testing API calls.
 */

export const Fetch = vi.fn();

/**
 * Helper to reset Fetch mock between tests.
 */
export function resetFetchMock() {
  Fetch.mockReset();
}
