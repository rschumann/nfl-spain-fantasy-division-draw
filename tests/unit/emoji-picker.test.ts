// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { EmojiPickerController } from '../../src/web/chat/emoji-picker.js';

describe('Emoji Picker Controller', () => {
  let toggleBtn: HTMLButtonElement;
  let popover: HTMLElement;
  let input: HTMLInputElement;

  beforeEach(() => {
    document.body.innerHTML = `
      <input id="input" type="text" value="Hello " />
      <button id="toggle">😊</button>
      <div id="popover" style="display: none;"></div>
    `;
    toggleBtn = document.getElementById('toggle') as HTMLButtonElement;
    popover = document.getElementById('popover')!;
    input = document.getElementById('input') as HTMLInputElement;
  });

  it('toggles popover open and close on button click', () => {
    const controller = new EmojiPickerController(toggleBtn, popover, input);
    expect(popover.style.display).toBe('none');

    toggleBtn.click();
    expect(popover.style.display).toBe('block');

    toggleBtn.click();
    expect(popover.style.display).toBe('none');
    controller.close();
  });

  it('closes popover on escape key and outside click', () => {
    const controller = new EmojiPickerController(toggleBtn, popover, input);
    controller.open();
    expect(popover.style.display).toBe('block');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(popover.style.display).toBe('none');

    controller.open();
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(popover.style.display).toBe('none');
  });

  it('filters emojis via search input in real-time', () => {
    const controller = new EmojiPickerController(toggleBtn, popover, input);
    controller.open();
    const searchInput = popover.querySelector<HTMLInputElement>('.emoji-search-input');
    expect(searchInput).not.toBeNull();

    searchInput!.value = 'futbol';
    searchInput!.dispatchEvent(new Event('input'));
    const buttons = popover.querySelectorAll('.emoji-btn');
    expect(buttons.length).toBeGreaterThan(0);
    expect(Array.from(buttons).some((b) => b.textContent === '🏈')).toBe(true);

    searchInput!.value = 'nonexistentqueryxyz';
    searchInput!.dispatchEvent(new Event('input'));
    expect(popover.querySelector('.emoji-no-results')).not.toBeNull();
  });

  it('inserts emoji on click at cursor position and updates value', () => {
    const controller = new EmojiPickerController(toggleBtn, popover, input);
    controller.open();
    const footballBtn = Array.from(
      popover.querySelectorAll<HTMLButtonElement>('.emoji-btn')
    ).find((b) => b.textContent === '😀');
    expect(footballBtn).toBeDefined();

    footballBtn!.click();
    expect(input.value).toBe('Hello 😀');
    controller.close();
  });
});
