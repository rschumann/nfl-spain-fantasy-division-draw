import 'emoji-picker-element';

export class EmojiPickerController {
  private isOpen = false;
  private pickerElement: HTMLElement | null = null;

  constructor(
    private readonly toggleBtn: HTMLElement,
    private readonly popoverContainer: HTMLElement,
    private readonly inputEl: HTMLInputElement
  ) {
    this.setupListeners();
  }

  private setupListeners(): void {
    this.toggleBtn.onclick = (e) => {
      e.stopPropagation();
      this.toggle();
    };

    document.addEventListener('click', (e) => {
      if (
        this.isOpen &&
        !this.popoverContainer.contains(e.target as Node) &&
        e.target !== this.toggleBtn
      ) {
        this.close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  private ensurePickerMounted(): void {
    if (this.pickerElement) return;
    const picker = document.createElement('emoji-picker');
    picker.className = 'dark';
    picker.addEventListener('emoji-click', (event: Event) => {
      const customEvent = event as CustomEvent<{ unicode: string }>;
      if (customEvent.detail?.unicode) {
        this.insertEmoji(customEvent.detail.unicode);
      }
    });
    this.popoverContainer.appendChild(picker);
    this.pickerElement = picker;
  }

  private insertEmoji(emoji: string): void {
    const start = this.inputEl.selectionStart ?? this.inputEl.value.length;
    const end = this.inputEl.selectionEnd ?? this.inputEl.value.length;
    const val = this.inputEl.value;
    this.inputEl.value = val.substring(0, start) + emoji + val.substring(end);
    this.inputEl.selectionStart = this.inputEl.selectionEnd = start + emoji.length;
    this.inputEl.focus();
  }

  toggle(): void {
    if (this.isOpen) this.close();
    else this.open();
  }

  open(): void {
    this.ensurePickerMounted();
    this.isOpen = true;
    this.popoverContainer.style.display = 'block';
    this.toggleBtn.setAttribute('aria-expanded', 'true');
  }

  close(): void {
    this.isOpen = false;
    this.popoverContainer.style.display = 'none';
    this.toggleBtn.setAttribute('aria-expanded', 'false');
  }
}
