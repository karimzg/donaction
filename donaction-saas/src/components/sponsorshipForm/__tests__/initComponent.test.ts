// import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// import { initComponent } from '../logic/initComponent';
// import { Fetch } from '../../../utils/fetch';
// import { FORM_CONFIG, SUBSCRIPTION } from '../logic/useSponsorshipForm.svelte';
//
// vi.mock('../../../utils/fetch');
// vi.stubGlobal('document', {
//   querySelectorAll: vi.fn(),
// });
//
// describe('initComponent', () => {
//   const mockScript = {
//     src: 'https://example.com/klubr-web-components/components/KlubrSponsorshipForm.es.js?apiToken=testToken',
//   };
//
//   beforeEach(() => {
//     vi.clearAllMocks();
//     // Mock document.querySelectorAll
//     document.querySelectorAll = vi.fn(() => [mockScript]);
//
//     // Mock Fetch
//     Fetch.mockResolvedValue({
//       klubr: { uuid: 'mockKlubrUuid' },
//       project: { uuid: 'mockProjectUuid' },
//     });
//
//     // Mock environment variable
//     import.meta.env = { VITE_ENVIRONMENT: 'development' };
//   });
//
//   afterEach(() => {
//     vi.resetAllMocks();
//   });
//
//   it('should initialize component with valid API token and data', async () => {
//     await expect(initComponent('mockKlubrUuid', 'mockProjectUuid')).resolves.not.toThrow();
//
//     expect(Fetch).toHaveBeenCalledWith({
//       endpoint: '/api/klubr-subscriptions/decrypt',
//       method: 'POST',
//       data: {
//         apiToken: 'testToken',
//         klubrUuid: 'mockKlubrUuid',
//         projectUuid: 'mockProjectUuid',
//       },
//     });
//
//     expect(SUBSCRIPTION.token).toBe('testToken');
//     expect(SUBSCRIPTION.klubr).toEqual({ uuid: 'mockKlubrUuid' });
//     expect(SUBSCRIPTION.project).toEqual({ uuid: 'mockProjectUuid' });
//     expect(FORM_CONFIG.clubUuid).toBe('mockKlubrUuid');
//     expect(FORM_CONFIG.projectUuid).toBe('mockProjectUuid');
//   });
//
//   it('should throw an error when API token is missing', async () => {
//     document.querySelectorAll = vi.fn(() => [{}]); // No src or API token
//
//     await expect(initComponent()).rejects.toThrow("Can't find the api token");
//   });
//
//   it('should reject when Fetch fails', async () => {
//     Fetch.mockRejectedValue(new Error('Fetch error'));
//
//     await expect(initComponent('mockKlubrUuid', 'mockProjectUuid')).rejects.toThrow('Fetch error');
//   });
// });
