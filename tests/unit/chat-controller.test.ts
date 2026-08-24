// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  buildChatLayout,
  renderSessionArea,
  renderMessages
} from '../../src/web/chat/render-chat.js';
import { ChatController } from '../../src/web/chat/chat-controller.js';
import * as chatApi from '../../src/web/chat/chat-api.js';

describe('Chat Controller and UI Renderer', () => {
  let container: HTMLElement;
  let toggleBtn: HTMLButtonElement;

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <div id="chat-root"></div>
      <button id="toggle-btn"></button>
      <div id="pending-box">
        <span class="team-chip" data-team-id="madrid-steelers">Madrid</span>
      </div>
    `;
    container = document.getElementById('chat-root')!;
    toggleBtn = document.getElementById('toggle-btn') as HTMLButtonElement;
  });

  it('renders chat layout and empty/populated messages', () => {
    buildChatLayout(container);
    const list = container.querySelector<HTMLElement>('[data-ref="chat-messages"]')!;
    renderMessages(list, []);
    expect(list.textContent).toContain('No hay mensajes');

    renderMessages(
      list,
      [
        {
          id: '1',
          teamId: 'madrid-steelers',
          teamName: 'Madrid Steelers',
          body: 'Hola',
          createdAt: '2026-08-24T12:00:00.000Z'
        }
      ],
      ['madrid-steelers']
    );
    expect(list.textContent).toContain('Madrid Steelers');
  });

  it('toggles session areas for spectator and logged in team', () => {
    buildChatLayout(container);
    const formArea = container.querySelector<HTMLElement>('[data-ref="chat-form-area"]')!;
    const badge = container.querySelector<HTMLElement>(
      '[data-ref="chat-session-badge"]'
    )!;

    renderSessionArea(formArea, badge, null, 2);
    expect(badge.textContent).toContain('2 online');
    expect(formArea.querySelector('[data-ref="chat-key-input"]')).not.toBeNull();

    renderSessionArea(formArea, badge, {
      key: 'k1',
      teamId: 'madrid-steelers',
      teamName: 'Madrid Steelers'
    });
    expect(formArea.querySelector('[data-ref="chat-input"]')).not.toBeNull();
  });

  it('handles emoji picker toggle, login rejection and full message flow', async () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(chatApi, 'fetchMessages').mockResolvedValue({
      messages: [],
      onlineTeamIds: ['madrid-steelers']
    });
    vi.spyOn(chatApi, 'loginWithTeamKey')
      .mockResolvedValueOnce({ valid: false, error: 'Bad key' })
      .mockResolvedValueOnce({
        valid: true,
        teamId: 'madrid-steelers',
        teamName: 'Madrid Steelers'
      });
    vi.spyOn(chatApi, 'sendChatMessage').mockResolvedValue({ ok: true });

    const controller = new ChatController(container, toggleBtn);
    await controller.start();

    const loginInput = container.querySelector<HTMLInputElement>(
      '[data-ref="chat-key-input"]'
    );
    const loginForm = container.querySelector<HTMLFormElement>(
      '[data-ref="chat-login-form"]'
    );
    if (loginInput && loginForm) {
      loginInput.value = 'bad';
      loginForm.dispatchEvent(new Event('submit'));
      loginInput.value = 'steelers-7821';
      loginForm.dispatchEvent(new Event('submit'));
    }

    const emojiToggle = container.querySelector<HTMLButtonElement>(
      '[data-ref="emoji-toggle-btn"]'
    );
    emojiToggle?.click();
    const msgInput = container.querySelector<HTMLInputElement>('[data-ref="chat-input"]');
    const msgForm = container.querySelector<HTMLFormElement>('[data-ref="chat-form"]');
    if (msgInput && msgForm) {
      msgInput.value = 'Mensaje';
      msgForm.dispatchEvent(new Event('submit'));
    }

    container.querySelector<HTMLButtonElement>('[data-ref="btn-logout"]')?.click();
    controller.stop();
  });
});
