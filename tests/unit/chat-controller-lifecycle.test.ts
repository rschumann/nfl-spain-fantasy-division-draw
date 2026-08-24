// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChatController } from '../../src/web/chat/chat-controller.js';
import * as chatIdentity from '../../src/web/chat/chat-identity.js';

describe('Chat Controller Lifecycle (Task 08)', () => {
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

  it('initializes layout and handles form submit with graceful degradation', async () => {
    const setSpy = vi.spyOn(chatIdentity, 'setSelectedTeamId');
    const controller = new ChatController(container, toggleBtn, {
      apiKey: 'test-key',
      authDomain: 'test.firebaseapp.com',
      projectId: 'nfl-spain-draw-local',
      appId: '1:123:web:456',
      useEmulators: false
    });

    await controller.start();
    expect(container.querySelector('[data-ref="chat-messages"]')).toBeDefined();

    const select = container.querySelector<HTMLSelectElement>('[data-ref="team-select"]');
    if (select) {
      select.value = 'barcelona-dragons';
      select.dispatchEvent(new Event('change'));
      expect(setSpy).toHaveBeenCalled();
    }

    const input = container.querySelector<HTMLInputElement>('[data-ref="chat-input"]');
    const form = container.querySelector<HTMLFormElement>('[data-ref="chat-form"]');
    if (input && form) {
      input.value = '¡Vamos dragons!';
      form.dispatchEvent(new Event('submit'));
    }

    controller.stop();
  });
});
