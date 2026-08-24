// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChatController } from '../../src/web/chat/chat-controller.js';
import * as firebaseClient from '../../src/web/chat/firebase-client.js';
import * as chatAuth from '../../src/web/chat/chat-auth.js';
import * as chatRepo from '../../src/web/chat/chat-repository.js';
import type { Auth, User } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseApp } from 'firebase/app';

describe('Chat Controller Branches (Task 08)', () => {
  let container: HTMLElement;
  let toggleBtn: HTMLButtonElement;

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <div id="chat-root"></div>
      <button id="toggle-btn"></button>
    `;
    container = document.getElementById('chat-root')!;
    toggleBtn = document.getElementById('toggle-btn') as HTMLButtonElement;
  });

  it('connects auth, listener and handles message dispatch when firebase succeeds', async () => {
    const mockAuth = {} as Auth;
    const mockDb = {} as Firestore;
    const mockApp = {} as FirebaseApp;
    vi.spyOn(firebaseClient, 'getFirebaseClient').mockReturnValue({
      app: mockApp,
      auth: mockAuth,
      db: mockDb
    });
    vi.spyOn(chatAuth, 'ensureAnonymousAuth').mockResolvedValue({
      uid: 'user-789'
    } as User);
    const unsubSpy = vi.fn();
    vi.spyOn(chatRepo, 'subscribeToMessages').mockReturnValue(unsubSpy);
    const sendSpy = vi.spyOn(chatRepo, 'sendMessage').mockResolvedValue();

    const controller = new ChatController(container, toggleBtn, {
      apiKey: 'k',
      authDomain: 'd',
      projectId: 'nfl-spain-draw-local',
      appId: 'a',
      useEmulators: false
    });

    await controller.start();

    const input = container.querySelector<HTMLInputElement>('[data-ref="chat-input"]');
    const form = container.querySelector<HTMLFormElement>('[data-ref="chat-form"]');
    if (input && form) {
      input.value = 'Mensaje de prueba exitoso';
      form.dispatchEvent(new Event('submit'));
      expect(sendSpy).toHaveBeenCalled();
    }

    controller.stop();
    expect(unsubSpy).toHaveBeenCalled();
  });
});
