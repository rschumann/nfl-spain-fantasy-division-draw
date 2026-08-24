export class ChatSheetController {
  private isOpen = false;

  constructor(
    private readonly panel: HTMLElement,
    private readonly toggleBtn: HTMLElement | null
  ) {
    this.setupListeners();
  }

  private setupListeners(): void {
    if (this.toggleBtn) {
      this.toggleBtn.onclick = () => this.toggle();
    }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    this.isOpen = true;
    this.panel.classList.add('sheet-open');
    if (this.toggleBtn) {
      this.toggleBtn.setAttribute('aria-expanded', 'true');
    }
  }

  close(): void {
    this.isOpen = false;
    this.panel.classList.remove('sheet-open');
    if (this.toggleBtn) {
      this.toggleBtn.setAttribute('aria-expanded', 'false');
    }
  }
}
