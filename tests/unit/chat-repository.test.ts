import { describe, it, expect, vi } from 'vitest';
import {
  subscribeToMessages,
  sendMessage,
  type ChatMessage
} from '../../src/web/chat/chat-repository.js';
import type { Firestore } from 'firebase/firestore';

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: vi.fn().mockReturnValue({}),
    query: vi.fn().mockReturnValue({}),
    orderBy: vi.fn().mockReturnValue({}),
    limitToLast: vi.fn().mockReturnValue({}),
    serverTimestamp: vi.fn().mockReturnValue('SERVER_TIMESTAMP'),
    addDoc: vi.fn().mockResolvedValue({ id: 'msg-doc-1' }),
    onSnapshot: vi.fn().mockImplementation((_q, onNext, _onError) => {
      onNext({
        docs: [
          {
            id: 'm1',
            data: () => ({
              uid: 'u1',
              teamId: 'madrid-steelers',
              body: 'Mensaje de prueba',
              createdAt: { toDate: () => new Date('2026-08-24T12:00:00.000Z') }
            })
          }
        ]
      });
      return vi.fn();
    })
  };
});

describe('Chat Repository (Task 08)', () => {
  const mockDb = {} as Firestore;

  it('subscribes to messages and receives mapped documents', () => {
    let received: readonly ChatMessage[] = [];
    const unsub = subscribeToMessages(mockDb, 'nfl-spain-26-27', (msgs) => {
      received = msgs;
    });
    expect(received).toHaveLength(1);
    expect(received[0]?.id).toBe('m1');
    expect(received[0]?.body).toBe('Mensaje de prueba');
    expect(typeof unsub).toBe('function');
  });

  it('sends trimmed message with server timestamp', async () => {
    await expect(
      sendMessage(mockDb, 'nfl-spain-26-27', 'u1', 'madrid-steelers', '  Hola mundo  ')
    ).resolves.toBeUndefined();
  });
});
