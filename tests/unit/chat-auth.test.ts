import { describe, it, expect, vi } from 'vitest';
import { ensureAnonymousAuth, getCurrentUid } from '../../src/web/chat/chat-auth.js';
import { getFirebaseClient } from '../../src/web/chat/firebase-client.js';
import type { Auth, User } from 'firebase/auth';

vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual('firebase/auth');
  return {
    ...actual,
    signInAnonymously: vi.fn().mockImplementation(async () => ({
      user: { uid: 'user-anon-456' } as User
    })),
    getAuth: vi.fn().mockReturnValue({ currentUser: null }),
    connectAuthEmulator: vi.fn()
  };
});

describe('Chat Auth & Firebase Client (Task 07)', () => {
  it('returns existing currentUser when available', async () => {
    const mockUser = { uid: 'user-existing-123' } as User;
    const mockAuth = { currentUser: mockUser } as unknown as Auth;

    const user = await ensureAnonymousAuth(mockAuth);
    expect(user.uid).toBe('user-existing-123');
  });

  it('signs in anonymously when currentUser is null', async () => {
    const mockAuth = {
      currentUser: null,
      app: {}
    } as unknown as Auth;

    const user = await ensureAnonymousAuth(mockAuth);
    expect(user.uid).toBe('user-anon-456');
  });

  it('gets current UID or null', () => {
    const mockAuthWithUser = { currentUser: { uid: 'uid-1' } } as unknown as Auth;
    expect(getCurrentUid(mockAuthWithUser)).toBe('uid-1');

    const mockAuthNoUser = { currentUser: null } as unknown as Auth;
    expect(getCurrentUid(mockAuthNoUser)).toBeNull();
  });

  it('initializes Firebase client bundle', () => {
    const client = getFirebaseClient({
      apiKey: 'fake-api-key',
      authDomain: 'nfl-spain-local.firebaseapp.com',
      projectId: 'nfl-spain-draw-local',
      appId: '1:123:web:456',
      useEmulators: true
    });
    expect(client.app).toBeDefined();
    expect(client.auth).toBeDefined();
    expect(client.db).toBeDefined();
  });
});
