import { existsSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect, beforeEach } from 'vitest';
import fastify from 'fastify';
import { createChatRoutes } from '../../src/server/routes/chat-route.js';
import { ChatStore } from '../../src/server/chat-store.js';

describe('Chat Routes and Message Store', () => {
  let chatStore: ChatStore;

  beforeEach(() => {
    chatStore = new ChatStore(undefined, 5);
  });

  it('handles message storage and trimming', () => {
    for (let i = 1; i <= 7; i++) {
      chatStore.addMessage('t1', 'Team 1', `Msg ${i}`);
    }
    const msgs = chatStore.getMessages();
    expect(msgs).toHaveLength(5);
    expect(msgs[0]?.body).toBe('Msg 3');
    chatStore.clear();
    expect(chatStore.getMessages()).toHaveLength(0);
  });

  it('persists and reloads messages to and from disk', () => {
    const tmp = resolve(process.cwd(), '.data/test-chat.json');
    if (existsSync(tmp)) unlinkSync(tmp);
    const store = new ChatStore(tmp, 5);
    store.addMessage('t1', 'Team 1', 'Persistent msg');
    const reloaded = new ChatStore(tmp, 5);
    expect(reloaded.getMessages()).toHaveLength(1);
    reloaded.clear();
    if (existsSync(tmp)) unlinkSync(tmp);
  });

  it('posts and gets messages with presence info', async () => {
    const app = fastify();
    await app.register(createChatRoutes(chatStore));

    const postRes = await app.inject({
      method: 'POST',
      url: '/api/chat/messages',
      payload: { key: 'steelers-7821', body: '¡Vamos Madrid!' }
    });
    expect(postRes.statusCode).toBe(201);
    expect(postRes.json().onlineTeamIds).toContain('madrid-steelers');

    const getWithKey = await app.inject({
      method: 'GET',
      url: '/api/chat/messages?key=patriots-4912'
    });
    expect(getWithKey.statusCode).toBe(200);
    expect(getWithKey.json().onlineTeamIds).toContain('toledo-patriots');

    const presenceRes = await app.inject({
      method: 'GET',
      url: '/api/chat/presence'
    });
    expect(presenceRes.statusCode).toBe(200);
    expect(presenceRes.json().onlineTeamIds).toBeDefined();
  });

  it('rejects unauthenticated or invalid message submissions', async () => {
    const app = fastify();
    await app.register(createChatRoutes(chatStore));

    const noKey = await app.inject({
      method: 'POST',
      url: '/api/chat/messages',
      payload: { body: 'Hola' }
    });
    expect(noKey.statusCode).toBe(401);

    const badKey = await app.inject({
      method: 'POST',
      url: '/api/chat/messages',
      payload: { key: 'wrong', body: 'Hola' }
    });
    expect(badKey.statusCode).toBe(401);

    const empty = await app.inject({
      method: 'POST',
      url: '/api/chat/messages',
      payload: { key: 'steelers-7821', body: '   ' }
    });
    expect(empty.statusCode).toBe(400);
  });
});
