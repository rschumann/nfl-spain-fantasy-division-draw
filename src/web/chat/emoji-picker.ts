import { EMOJI_CATEGORIES, type EmojiItem } from './emoji-data.js';

function filterEmojis(query: string, activeCategory: string): EmojiItem[] {
  if (!query) {
    const cat = EMOJI_CATEGORIES.find((c) => c.id === activeCategory);
    return cat ? [...cat.emojis] : [];
  }
  const results: EmojiItem[] = [];
  for (const cat of EMOJI_CATEGORIES) {
    for (const em of cat.emojis) {
      if (
        em.name.includes(query) ||
        em.tags.some((t) => t.includes(query)) ||
        em.char === query
      ) {
        if (!results.some((i) => i.char === em.char)) results.push(em);
      }
    }
  }
  return results;
}

function createEmojiBtn(item: EmojiItem, onSelect: (ch: string) => void): HTMLElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'emoji-btn';
  btn.title = item.name;
  btn.textContent = item.char;
  btn.onclick = (e) => {
    e.stopPropagation();
    onSelect(item.char);
  };
  return btn;
}

export class EmojiPickerController {
  private isOpen = false;
  private activeCategory = 'smileys';
  private searchQuery = '';

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
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  }

  private renderTabs(tabsEl: HTMLElement): void {
    tabsEl.replaceChildren();
    for (const cat of EMOJI_CATEGORIES) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `emoji-tab-btn${cat.id === this.activeCategory && !this.searchQuery ? ' is-active' : ''}`;
      btn.title = cat.label;
      btn.textContent = cat.icon;
      btn.onclick = () => {
        this.activeCategory = cat.id;
        this.searchQuery = '';
        const input =
          this.popoverContainer.querySelector<HTMLInputElement>('.emoji-search-input');
        if (input) input.value = '';
        this.renderView();
      };
      tabsEl.appendChild(btn);
    }
  }

  private renderGrid(gridEl: HTMLElement): void {
    gridEl.replaceChildren();
    const query = this.searchQuery.trim().toLowerCase();
    const items = filterEmojis(query, this.activeCategory);
    if (items.length === 0) {
      const noRes = document.createElement('div');
      noRes.className = 'emoji-no-results';
      noRes.textContent = 'No se encontraron emojis';
      gridEl.appendChild(noRes);
      return;
    }
    for (const item of items) {
      gridEl.appendChild(createEmojiBtn(item, (c) => this.insertEmoji(c)));
    }
  }

  private renderView(): void {
    const tabsEl = this.popoverContainer.querySelector<HTMLElement>('.emoji-tabs');
    const gridEl = this.popoverContainer.querySelector<HTMLElement>('.emoji-grid');
    if (tabsEl) this.renderTabs(tabsEl);
    if (gridEl) this.renderGrid(gridEl);
  }

  private initMarkup(): void {
    this.popoverContainer.innerHTML = `
      <div class="emoji-picker-panel">
        <div class="emoji-search-wrap">
          <input type="text" class="emoji-search-input" placeholder="🔍 Buscar emoji (futbol, fuego, risa)..." />
        </div>
        <div class="emoji-tabs"></div>
        <div class="emoji-grid" role="listbox"></div>
      </div>
    `;
    const input =
      this.popoverContainer.querySelector<HTMLInputElement>('.emoji-search-input');
    if (input) {
      input.oninput = () => {
        this.searchQuery = input.value;
        this.renderView();
      };
    }
  }

  private insertEmoji(emoji: string): void {
    const start = this.inputEl.selectionStart ?? this.inputEl.value.length;
    const end = this.inputEl.selectionEnd ?? this.inputEl.value.length;
    const val = this.inputEl.value;
    this.inputEl.value = val.substring(0, start) + emoji + val.substring(end);
    const nextPos = start + emoji.length;
    this.inputEl.setSelectionRange(nextPos, nextPos);
    this.inputEl.focus();
    this.inputEl.dispatchEvent(new Event('input', { bubbles: true }));
  }

  toggle(): void {
    if (this.isOpen) this.close();
    else this.open();
  }

  open(): void {
    if (!this.popoverContainer.firstElementChild) this.initMarkup();
    this.isOpen = true;
    this.popoverContainer.style.display = 'block';
    this.toggleBtn.setAttribute('aria-expanded', 'true');
    this.renderView();
  }

  close(): void {
    this.isOpen = false;
    this.popoverContainer.style.display = 'none';
    this.toggleBtn.setAttribute('aria-expanded', 'false');
  }
}
