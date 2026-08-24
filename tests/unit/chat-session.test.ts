// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getUrlKey,
  getStoredSession,
  saveStoredSession,
  clearStoredSession
} from '../../src/web/chat/chat-session.js';

describe('Chat Session Management', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it('extracts key from url search params', () => {
    window.history.replaceState({}, '', '/?key=steelers-7821');
    expect(getUrlKey()).toBe('steelers-7821');

    window.history.replaceState({}, '', '/?token=token-123');
    expect(getUrlKey()).toBe('token-123');
  });

  it('saves, retrieves and clears stored session', () => {
    expect(getStoredSession()).toBeNull();
    saveStoredSession({ key: 'k1', teamId: 't1', teamName: 'Team One' });
    expect(getStoredSession()).toEqual({ key: 'k1', teamId: 't1', teamName: 'Team One' });
    clearStoredSession();
    expect(getStoredSession()).toBeNull();
  });

  it('handles localStorage errors gracefully', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Access denied');
    });
    expect(getStoredSession()).toBeNull();
  });
});
