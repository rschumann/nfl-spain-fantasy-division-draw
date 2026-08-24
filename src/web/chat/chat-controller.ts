import { getFirebaseClient, type FirebaseClientConfig } from './firebase-client.js';
import { ensureAnonymousAuth } from './chat-auth.js';
import { getSelectedTeamId, setSelectedTeamId } from './chat-identity.js';
import { subscribeToMessages, sendMessage, type ChatMessage } from './chat-repository.js';
import { buildChatLayout, renderMessages } from './render-chat.js';
import { ChatSheetController } from './chat-sheet.js';
import type { Unsubscribe, Firestore } from 'firebase/firestore';

export class ChatController {
  private unsubscribe: Unsubscribe | null = null;
  private currentUid: string | null = null;
  private currentTeamId: string;
  readonly sheet: ChatSheetController;

  constructor(
    private readonly container: HTMLElement,
    toggleBtn: HTMLElement | null,
    private readonly config: FirebaseClientConfig,
    private readonly roomId = 'nfl-spain-26-27'
  ) {
    this.currentTeamId = getSelectedTeamId();
    this.sheet = new ChatSheetController(container, toggleBtn);
  }

  private setupIdentityListener(): void {
    const select = this.container.querySelector<HTMLSelectElement>(
      '[data-ref="team-select"]'
    );
    if (select) {
      select.onchange = () => {
        this.currentTeamId = select.value;
        setSelectedTeamId(select.value);
      };
    }
  }

  private setupFormListener(db: Firestore): void {
    const form = this.container.querySelector<HTMLFormElement>('[data-ref="chat-form"]');
    const input = this.container.querySelector<HTMLInputElement>(
      '[data-ref="chat-input"]'
    );
    if (!form || !input) return;

    form.onsubmit = async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text || !this.currentUid) return;
      input.value = '';
      try {
        await sendMessage(db, this.roomId, this.currentUid, this.currentTeamId, text);
      } catch (err) {
        console.warn('Chat send message failed:', err);
      }
    };
  }

  async start(): Promise<void> {
    buildChatLayout(this.container, this.currentTeamId);
    this.setupIdentityListener();
    try {
      const { auth, db } = getFirebaseClient(this.config);
      const user = await ensureAnonymousAuth(auth);
      this.currentUid = user.uid;
      this.setupFormListener(db);
      this.unsubscribe = subscribeToMessages(
        db,
        this.roomId,
        (msgs: readonly ChatMessage[]) => renderMessages(this.container, msgs),
        (err) => console.warn('Chat subscription warning:', err)
      );
    } catch (err) {
      console.warn('Chat initialization degraded gracefully:', err);
      const list = this.container.querySelector('[data-ref="chat-messages"]');
      if (list)
        list.innerHTML =
          '<li class="chat-message-item">Chat temporalmente no disponible.</li>';
    }
  }

  stop(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}
