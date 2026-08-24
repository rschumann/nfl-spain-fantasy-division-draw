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

  it('inserts emoji at cursor position and updates value', () => {
    const controller = new EmojiPickerController(toggleBtn, popover, input);
    controller.open();
    const picker = popover.querySelector('emoji-picker');
    expect(picker).not.toBeNull();

    picker?.dispatchEvent(
      new CustomEvent('emoji-click', {
        detail: { unicode: '🏈' }
      })
    );
    expect(input.value).toBe('Hello 🏈');
    controller.close();
  });
});
