// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { ChatSheetController } from '../../src/web/chat/chat-sheet.js';
import { buildChatLayout, renderMessages } from '../../src/web/chat/render-chat.js';
import type { ChatMessage } from '../../src/web/chat/chat-repository.js';

describe('Chat Sheet & Render (Task 08)', () => {
  let panel: HTMLElement;
  let toggleBtn: HTMLButtonElement;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="chat-panel" class="chat-section"></div>
      <button id="toggle-btn" aria-expanded="false">Toggle</button>
    `;
    panel = document.getElementById('chat-panel')!;
    toggleBtn = document.getElementById('toggle-btn') as HTMLButtonElement;
  });

  it('manages sheet open, close and toggle states with a11y', () => {
    const sheet = new ChatSheetController(panel, toggleBtn);
    expect(panel.classList.contains('sheet-open')).toBe(false);

    sheet.open();
    expect(panel.classList.contains('sheet-open')).toBe(true);
    expect(toggleBtn.getAttribute('aria-expanded')).toBe('true');

    sheet.close();
    expect(panel.classList.contains('sheet-open')).toBe(false);
    expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');

    toggleBtn.click();
    expect(panel.classList.contains('sheet-open')).toBe(true);
  });

  it('closes sheet on Escape key press', () => {
    const sheet = new ChatSheetController(panel, toggleBtn);
    sheet.open();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(panel.classList.contains('sheet-open')).toBe(false);
  });

  it('builds layout with team options and renders messages safely', () => {
    buildChatLayout(panel, 'madrid-steelers');
    const select = panel.querySelector('select');
    expect(select?.options.length).toBe(16);

    const msgs: ChatMessage[] = [
      {
        id: '1',
        uid: 'user-1',
        teamId: 'madrid-steelers',
        body: 'Buena suerte a todos!',
        createdAt: new Date('2026-08-24T12:05:00.000Z')
      }
    ];
    renderMessages(panel, msgs);
    const messageBody = panel.querySelector('.chat-message-body');
    expect(messageBody?.textContent).toBe('Buena suerte a todos!');
  });
});
