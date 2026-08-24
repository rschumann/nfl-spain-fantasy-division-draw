// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { ChatSheetController } from '../../src/web/chat/chat-sheet.js';

describe('ChatSheetController (Mobile Sheet Toggle)', () => {
  let panel: HTMLElement;
  let toggleBtn: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    panel = document.createElement('div');
    toggleBtn = document.createElement('button');
    document.body.appendChild(panel);
    document.body.appendChild(toggleBtn);
  });

  it('toggles open and closed on button click and keyboard escape', () => {
    const controller = new ChatSheetController(panel, toggleBtn);

    toggleBtn.click();
    expect(panel.classList.contains('sheet-open')).toBe(true);
    expect(toggleBtn.getAttribute('aria-expanded')).toBe('true');

    toggleBtn.click();
    expect(panel.classList.contains('sheet-open')).toBe(false);
    expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');

    controller.open();
    expect(panel.classList.contains('sheet-open')).toBe(true);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(panel.classList.contains('sheet-open')).toBe(false);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(panel.classList.contains('sheet-open')).toBe(false);
  });

  it('functions without toggle button', () => {
    const controller = new ChatSheetController(panel, null);
    controller.toggle();
    expect(panel.classList.contains('sheet-open')).toBe(true);
    controller.close();
    expect(panel.classList.contains('sheet-open')).toBe(false);
  });
});
