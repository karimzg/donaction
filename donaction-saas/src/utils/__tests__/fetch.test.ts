import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Fetch } from '../fetch';

describe('Fetch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    import.meta.env.VITE_STRAPI_API_URL = 'http://localhost:1337';
    import.meta.env.VITE_STRAPI_API_TOKEN = 'test-token';
  });

  describe('successful requests', () => {
    it('calls fetch with correct URL (base + endpoint)', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      });
      global.fetch = mockFetch;

      await Fetch({
        endpoint: '/api/clubs',
        method: 'GET',
      });

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:1337/api/clubs', expect.any(Object));
    });

    it('sends Authorization header with Bearer token', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      });
      global.fetch = mockFetch;

      await Fetch({
        endpoint: '/api/clubs',
        method: 'GET',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        }),
      );
    });

    it('sends Content-Type application/json for non-blob', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      });
      global.fetch = mockFetch;

      await Fetch({
        endpoint: '/api/clubs',
        method: 'POST',
        data: { name: 'Test Club' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('sends JSON.stringify(data) as body', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      });
      global.fetch = mockFetch;

      const testData = { name: 'Test Club', active: true };

      await Fetch({
        endpoint: '/api/clubs',
        method: 'POST',
        data: testData,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(testData),
        }),
      );
    });

    it('returns parsed JSON on success', async () => {
      const responseData = { id: 1, name: 'Test Club' };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => responseData,
      });
      global.fetch = mockFetch;

      const result = await Fetch({
        endpoint: '/api/clubs',
        method: 'GET',
      });

      expect(result).toEqual(responseData);
    });
  });

  describe('blob/FormData requests', () => {
    it('does NOT send Content-Type header when isBlob=true', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      });
      global.fetch = mockFetch;

      await Fetch({
        endpoint: '/api/upload',
        method: 'POST',
        data: new FormData(),
        isBlob: true,
      });

      const callArgs = mockFetch.mock.calls[0][1];
      expect(callArgs.headers).not.toHaveProperty('Content-Type');
      expect(callArgs.headers).toHaveProperty('Authorization');
    });

    it('sends FormData directly as body (not stringified)', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      });
      global.fetch = mockFetch;

      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'test.txt');

      await Fetch({
        endpoint: '/api/upload',
        method: 'POST',
        data: formData,
        isBlob: true,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: formData,
        }),
      );
    });
  });

  describe('error handling', () => {
    it('throws parsed JSON when response.ok is false', async () => {
      const errorResponse = { error: 'Unauthorized', statusCode: 401 };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => errorResponse,
      });
      global.fetch = mockFetch;

      await expect(
        Fetch({
          endpoint: '/api/clubs',
          method: 'GET',
        }),
      ).rejects.toEqual(errorResponse);
    });

    it('throws error on 400 Bad Request', async () => {
      const errorResponse = { error: 'Bad Request', statusCode: 400 };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => errorResponse,
      });
      global.fetch = mockFetch;

      await expect(
        Fetch({
          endpoint: '/api/clubs',
          method: 'POST',
          data: { invalid: 'data' },
        }),
      ).rejects.toEqual(errorResponse);
    });

    it('throws error on 500 Internal Server Error', async () => {
      const errorResponse = { error: 'Internal Server Error', statusCode: 500 };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => errorResponse,
      });
      global.fetch = mockFetch;

      await expect(
        Fetch({
          endpoint: '/api/clubs',
          method: 'GET',
        }),
      ).rejects.toEqual(errorResponse);
    });
  });

  describe('HTTP methods', () => {
    it('uses GET method', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      });
      global.fetch = mockFetch;

      await Fetch({
        endpoint: '/api/clubs',
        method: 'GET',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'GET',
        }),
      );
    });

    it('uses POST method', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      });
      global.fetch = mockFetch;

      await Fetch({
        endpoint: '/api/clubs',
        method: 'POST',
        data: { name: 'Test' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });

    it('uses PUT method', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      });
      global.fetch = mockFetch;

      await Fetch({
        endpoint: '/api/clubs/1',
        method: 'PUT',
        data: { name: 'Updated' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PUT',
        }),
      );
    });

    it('uses DELETE method', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      });
      global.fetch = mockFetch;

      await Fetch({
        endpoint: '/api/clubs/1',
        method: 'DELETE',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'DELETE',
        }),
      );
    });
  });

  describe('edge cases', () => {
    it('handles undefined data parameter', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      });
      global.fetch = mockFetch;

      await Fetch({
        endpoint: '/api/clubs',
        method: 'GET',
      });

      const callArgs = mockFetch.mock.calls[0][1];
      expect(callArgs.body).toBeUndefined();
    });

    it('handles empty FormData', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      });
      global.fetch = mockFetch;

      const formData = new FormData();

      await Fetch({
        endpoint: '/api/upload',
        method: 'POST',
        data: formData,
        isBlob: true,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: formData,
        }),
      );
    });

    it('preserves Authorization header with FormData', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      });
      global.fetch = mockFetch;

      const formData = new FormData();

      await Fetch({
        endpoint: '/api/upload',
        method: 'POST',
        data: formData,
        isBlob: true,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        }),
      );
    });
  });
});
