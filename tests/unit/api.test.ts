import { describe, it, expect, vi } from 'vitest';
import { fetchPublicDraw } from '../../src/web/api.js';

describe('Web API Fetcher (Task 06)', () => {
  it('throws on non-OK response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500
    });
    await expect(
      fetchPublicDraw(null, mockFetch as unknown as typeof fetch)
    ).rejects.toThrow('API error: HTTP 500');
  });
});
