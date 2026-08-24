import { buildChatLayout, renderSessionArea, renderMessages } from './render-chat.js';
import {
  getStoredSession,
  getUrlKey,
  saveStoredSession,
  clearStoredSession,
  type TeamSession
} from './chat-session.js';
import { fetchMessages, loginWithTeamKey, sendChatMessage } from './chat-api.js';
import { ChatSheetController } from './chat-sheet.js';
import { EmojiPickerController } from './emoji-picker.js';
import { globalPresence } from '../presence.js';

export class ChatController {
  private session: TeamSession | null = null;
  private pollIntervalId: number | null = null;
  private messagesListEl: HTMLElement | null = null;
  private badgeEl: HTMLElement | null = null;
  private formAreaEl: HTMLElement | null = null;

  constructor(
    private readonly container: HTMLElement,
    private readonly toggleBtn: HTMLElement | null
  ) {}

  async start(): Promise<void> {
    buildChatLayout(this.container);
    new ChatSheetController(this.container, this.toggleBtn);
    this.messagesListEl = this.container.querySelector('[data-ref="chat-messages"]');
    this.badgeEl = this.container.querySelector('[data-ref="chat-session-badge"]');
    this.formAreaEl = this.container.querySelector('[data-ref="chat-form-area"]');

    await this.resolveInitialSession();
    this.renderSession(0);
    await this.syncMessages();
    this.pollIntervalId = window.setInterval(() => this.syncMessages(), 2000);
  }

  private async resolveInitialSession(): Promise<void> {
    const urlKey = getUrlKey();
    if (urlKey) {
      const res = await loginWithTeamKey(urlKey);
      if (res.valid && res.teamId && res.teamName) {
        this.session = { key: urlKey, teamId: res.teamId, teamName: res.teamName };
        saveStoredSession(this.session);
        return;
      }
    }
    this.session = getStoredSession();
  }

  private renderSession(onlineCount = 0): void {
    if (!this.formAreaEl || !this.badgeEl) return;
    renderSessionArea(this.formAreaEl, this.badgeEl, this.session, onlineCount);
    this.attachFormListeners();
    this.attachEmojiPicker();
  }

  private attachEmojiPicker(): void {
    const toggle = this.container.querySelector<HTMLElement>(
      '[data-ref="emoji-toggle-btn"]'
    );
    const pop = this.container.querySelector<HTMLElement>('[data-ref="emoji-popover"]');
    const input = this.container.querySelector<HTMLInputElement>(
      '[data-ref="chat-input"]'
    );
    if (toggle && pop && input) new EmojiPickerController(toggle, pop, input);
  }

  private attachFormListeners(): void {
    const logoutBtn = this.container.querySelector<HTMLButtonElement>(
      '[data-ref="btn-logout"]'
    );
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        clearStoredSession();
        this.session = null;
        this.renderSession();
      };
    }
    const loginForm = this.container.querySelector<HTMLFormElement>(
      '[data-ref="chat-login-form"]'
    );
    if (loginForm) this.setupLoginForm(loginForm);
    const msgForm = this.container.querySelector<HTMLFormElement>(
      '[data-ref="chat-form"]'
    );
    if (msgForm) this.setupMessageForm(msgForm);
  }

  private setupLoginForm(form: HTMLFormElement): void {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const input = form.querySelector<HTMLInputElement>('[data-ref="chat-key-input"]');
      const key = (input?.value ?? '').trim();
      if (!key) return;
      const res = await loginWithTeamKey(key);
      if (res.valid && res.teamId && res.teamName) {
        this.session = { key, teamId: res.teamId, teamName: res.teamName };
        saveStoredSession(this.session);
        this.renderSession();
        await this.syncMessages();
      } else {
        alert(res.error ?? 'Clave de equipo no válida');
      }
    };
  }

  private setupMessageForm(form: HTMLFormElement): void {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const input = form.querySelector<HTMLInputElement>('[data-ref="chat-input"]');
      const text = (input?.value ?? '').trim();
      if (!text || !this.session) return;
      input!.value = '';
      await sendChatMessage(this.session.key, text);
      await this.syncMessages();
    };
  }

  private updateOnlineStatus(onlineTeamIds: readonly string[]): void {
    document.querySelectorAll<HTMLElement>('.team-chip').forEach((chip) => {
      const teamId = chip.getAttribute('data-team-id');
      const isOnline = teamId ? onlineTeamIds.includes(teamId) : false;
      chip.classList.toggle('is-online', isOnline);
      let dot = chip.querySelector('.online-dot');
      if (isOnline && !dot) {
        dot = document.createElement('span');
        dot.className = 'online-dot';
        chip.prepend(dot);
      } else if (!isOnline && dot) {
        dot.remove();
      }
    });
  }

  async syncMessages(): Promise<void> {
    if (!this.messagesListEl) return;
    const { messages, onlineTeamIds } = await fetchMessages(this.session?.key);
    globalPresence.setOnline(onlineTeamIds);
    renderMessages(this.messagesListEl, messages, onlineTeamIds);
    this.updateOnlineStatus(onlineTeamIds);
    if (!this.session && this.badgeEl) {
      const spectatorEl = this.badgeEl.querySelector('.badge-spectator');
      if (spectatorEl) {
        const countText =
          onlineTeamIds.length > 0 ? ` (${onlineTeamIds.length} online)` : '';
        spectatorEl.textContent = `👁️ Espectador${countText}`;
      }
    }
  }

  stop(): void {
    if (this.pollIntervalId !== null) {
      window.clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
  }
}
