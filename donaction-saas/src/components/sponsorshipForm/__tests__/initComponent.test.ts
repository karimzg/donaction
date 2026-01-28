import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';

// Mock modules BEFORE importing the module under test
vi.mock('../../../utils/fetch', () => import('./mocks/fetch.mock'));
vi.mock('../logic/useSponsorshipForm.svelte', () => import('./mocks/useSponsorshipForm.mock'));

import { initComponent } from '../logic/initComponent';
import { Fetch } from '../../../utils/fetch';
import { FORM_CONFIG, SUBSCRIPTION } from '../logic/useSponsorshipForm.svelte';
import { resetMocks } from './mocks/useSponsorshipForm.mock';

describe('initComponent', () => {
  const mockScript = {
    src: 'https://example.com/components/KlubrSponsorshipForm.es.js?apiToken=testToken',
  };

  const mockFetchResponse = {
    klubr: {
      uuid: 'mockKlubrUuid',
      trade_policy: { allowKlubrContribution: true },
    },
    project: { uuid: 'mockProjectUuid' },
  };

  let originalQuerySelectorAll: typeof document.querySelectorAll;

  beforeEach(() => {
    resetMocks();

    // Save and mock document.querySelectorAll
    originalQuerySelectorAll = document.querySelectorAll.bind(document);
    document.querySelectorAll = vi.fn().mockReturnValue([mockScript]) as any;

    // Setup Fetch mock to resolve with expected response
    (Fetch as Mock).mockResolvedValue(mockFetchResponse);
  });

  afterEach(() => {
    // Restore original
    document.querySelectorAll = originalQuerySelectorAll;
    vi.restoreAllMocks();
  });

  it('should initialize component with valid API token and data', async () => {
    await initComponent('mockKlubrUuid', 'mockProjectUuid');

    expect(Fetch).toHaveBeenCalledWith({
      endpoint: '/api/klubr-subscriptions/decrypt',
      method: 'POST',
      data: {
        apiToken: 'testToken',
        klubrUuid: 'mockKlubrUuid',
        projectUuid: 'mockProjectUuid',
      },
    });

    expect(SUBSCRIPTION.token).toBe('testToken');
    expect(SUBSCRIPTION.klubr).toEqual(mockFetchResponse.klubr);
    expect(SUBSCRIPTION.project).toEqual(mockFetchResponse.project);
    expect(SUBSCRIPTION.allowKlubrContribution).toBe(true);
    expect(SUBSCRIPTION.allowProjectSelection).toBe(false); // project exists so selection not allowed
    expect(FORM_CONFIG.clubUuid).toBe('mockKlubrUuid');
    expect(FORM_CONFIG.projectUuid).toBe('mockProjectUuid');
  });

  it('should set allowProjectSelection to true when no project returned', async () => {
    (Fetch as Mock).mockResolvedValue({
      klubr: { uuid: 'mockKlubrUuid', trade_policy: { allowKlubrContribution: false } },
      project: null,
    });

    await initComponent('mockKlubrUuid');

    expect(SUBSCRIPTION.allowProjectSelection).toBe(true);
    expect(FORM_CONFIG.projectUuid).toBe(null);
  });

  it('should throw an error when API token is missing', async () => {
    document.querySelectorAll = vi.fn().mockReturnValue([
      { src: 'https://example.com/KlubrSponsorshipForm.es.js' }, // No apiToken param
    ]) as any;

    await expect(initComponent()).rejects.toThrow("Can't find the api token");
  });

  it('should throw an error when script element not found', async () => {
    document.querySelectorAll = vi.fn().mockReturnValue([]) as any;

    await expect(initComponent()).rejects.toThrow();
  });

  it('should reject when Fetch fails', async () => {
    (Fetch as Mock).mockRejectedValue(new Error('Fetch error'));

    await expect(initComponent('mockKlubrUuid', 'mockProjectUuid')).rejects.toThrow('Fetch error');
  });

  it('should extract apiToken from script src query params', async () => {
    document.querySelectorAll = vi.fn().mockReturnValue([
      { src: 'https://cdn.example.com/widget/KlubrSponsorshipForm.es.js?apiToken=customToken123&other=param' },
    ]) as any;

    await initComponent();

    expect(Fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ apiToken: 'customToken123' }),
      })
    );
    expect(SUBSCRIPTION.token).toBe('customToken123');
  });
});
