import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  loginWithTeamKey,
  fetchMessages,
  sendChatMessage
} from '../../src/web/chat/chat-api.js';

describe('Chat API Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('handles login network errors and api responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true, teamId: 't1', teamName: 'Team 1' })
    } as Response);
    const success = await loginWithTeamKey('good-key');
    expect(success.valid).toBe(true);

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid key' })
    } as Response);
    const failure = await loginWithTeamKey('bad-key');
    expect(failure.valid).toBe(false);

    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));
    const netErr = await loginWithTeamKey('k');
    expect(netErr.valid).toBe(false);
  });

  it('fetches messages with and without key, and handles fetch errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        messages: [{ id: '1', body: 'Hello' }],
        onlineTeamIds: ['t1']
      })
    } as Response);
    const res = await fetchMessages('my-key');
    expect(res.messages).toHaveLength(1);

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => ({})
    } as Response);
    const failRes = await fetchMessages();
    expect(failRes.messages).toHaveLength(0);

    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Down'));
    const errRes = await fetchMessages();
    expect(errRes.messages).toHaveLength(0);
  });

  it('handles message send success and failure modes', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true })
    } as Response);
    const ok = await sendChatMessage('k', 'Hi');
    expect(ok.ok).toBe(true);

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Too long' })
    } as Response);
    const bad = await sendChatMessage('k', 'Hi');
    expect(bad.ok).toBe(false);

    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Timeout'));
    const err = await sendChatMessage('k', 'Hi');
    expect(err.ok).toBe(false);
  });
});
