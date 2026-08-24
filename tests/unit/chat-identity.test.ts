// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getSelectedTeamId,
  setSelectedTeamId
} from '../../src/web/chat/chat-identity.js';

describe('Chat Identity Storage (Task 08)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default teamId when localStorage is empty', () => {
    const id = getSelectedTeamId('madrid-steelers');
    expect(id).toBe('madrid-steelers');
  });

  it('persists and retrieves selected teamId', () => {
    setSelectedTeamId('barcelona-dragons');
    const id = getSelectedTeamId();
    expect(id).toBe('barcelona-dragons');
  });

  it('handles localStorage exceptions gracefully', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Access denied');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });
    expect(getSelectedTeamId('madrid-steelers')).toBe('madrid-steelers');
    expect(() => setSelectedTeamId('team-1')).not.toThrow();
  });
});
