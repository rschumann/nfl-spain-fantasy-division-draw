import type { ChatMessage } from './chat-api.js';
import type { TeamSession } from './chat-session.js';

const QUICK_EMOJIS = ['🏈', '🏆', '🔥', '👏', '😂', '🙌', '🍿', '🎉', '💪', '🎯'];

export function buildChatLayout(container: HTMLElement): void {
  container.innerHTML = `
    <div class="chat-header">
      <h2 class="chat-title">Chat de la liga</h2>
      <div data-ref="chat-session-badge" class="chat-session-badge"></div>
    </div>
    <ul data-ref="chat-messages" class="chat-messages" aria-live="polite"></ul>
    <div data-ref="chat-form-area" class="chat-form-area"></div>
  `;
}

function buildEmojiBar(): string {
  const btns = QUICK_EMOJIS.map(
    (e) => `<button type="button" class="emoji-btn" data-emoji="${e}">${e}</button>`
  ).join('');
  return `<div class="chat-emoji-bar" data-ref="chat-emoji-bar">${btns}</div>`;
}

function renderTeamArea(
  area: HTMLElement,
  badge: HTMLElement,
  session: TeamSession
): void {
  badge.innerHTML = `
    <span class="badge-team"><span class="online-dot"></span> 🏈 ${session.teamName}</span>
    <button type="button" data-ref="btn-logout" class="btn-logout">Salir</button>
  `;
  area.innerHTML = `
    <form data-ref="chat-form" class="chat-form">
      ${buildEmojiBar()}
      <div class="chat-input-row">
        <input data-ref="chat-input" class="chat-input" type="text" placeholder="Escribe como ${session.teamName}..." maxlength="280" required />
        <button type="submit" class="chat-send-btn">Enviar</button>
      </div>
    </form>
  `;
}

export function renderSessionArea(
  area: HTMLElement,
  badge: HTMLElement,
  session: TeamSession | null,
  onlineCount = 0
): void {
  if (session) {
    renderTeamArea(area, badge, session);
    return;
  }
  const countText = onlineCount > 0 ? ` (${onlineCount} online)` : '';
  badge.innerHTML = `<span class="badge-spectator">👁️ Espectador${countText}</span>`;
  area.innerHTML = `
    <form data-ref="chat-login-form" class="chat-form">
      <div class="chat-input-row">
        <input data-ref="chat-key-input" class="chat-input" type="text" placeholder="Introduce tu clave de equipo..." required />
        <button type="submit" class="chat-send-btn">Entrar</button>
      </div>
    </form>
  `;
}

function buildMessageItem(msg: ChatMessage, isOnline: boolean): HTMLElement {
  const li = document.createElement('li');
  li.className = 'chat-message-item';
  const header = document.createElement('div');
  header.className = 'chat-message-header';
  const sender = document.createElement('span');
  sender.className = 'chat-sender-team';
  sender.innerHTML = isOnline
    ? `${msg.teamName} <span class="online-dot"></span>`
    : msg.teamName;
  const time = document.createElement('span');
  time.textContent = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  header.appendChild(sender);
  header.appendChild(time);
  const body = document.createElement('div');
  body.className = 'chat-message-body';
  body.textContent = msg.body;
  li.appendChild(header);
  li.appendChild(body);
  return li;
}

export function renderMessages(
  listEl: HTMLElement,
  messages: readonly ChatMessage[],
  onlineTeamIds: readonly string[] = []
): void {
  listEl.replaceChildren();
  if (messages.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'chat-empty';
    empty.textContent = 'No hay mensajes aún. ¡Sé el primero en animar!';
    listEl.appendChild(empty);
    return;
  }
  for (const msg of messages) {
    listEl.appendChild(buildMessageItem(msg, onlineTeamIds.includes(msg.teamId)));
  }
  listEl.scrollTop = listEl.scrollHeight;
}
