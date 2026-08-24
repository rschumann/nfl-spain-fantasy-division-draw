import type { ChatMessage } from './chat-repository.js';
import teamsData from '../../../config/teams.json' with { type: 'json' };

function formatTime(date: Date | null): string {
  if (!date) return '...';
  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

function createMessageElement(
  msg: ChatMessage,
  teamMap: Map<string, string>
): HTMLElement {
  const li = document.createElement('li');
  li.className = 'chat-message-item';

  const header = document.createElement('div');
  header.className = 'chat-message-header';

  const sender = document.createElement('span');
  sender.className = 'chat-sender-team';
  sender.textContent = teamMap.get(msg.teamId) || msg.teamId;

  const time = document.createElement('span');
  time.className = 'chat-message-time';
  time.textContent = formatTime(msg.createdAt);

  header.appendChild(sender);
  header.appendChild(time);

  const body = document.createElement('p');
  body.className = 'chat-message-body';
  body.textContent = msg.body;

  li.appendChild(header);
  li.appendChild(body);
  return li;
}

export function renderMessages(
  container: HTMLElement,
  messages: readonly ChatMessage[]
): void {
  const list = container.querySelector<HTMLElement>('[data-ref="chat-messages"]');
  if (!list) return;
  const teamMap = new Map(
    teamsData.map((t: { id: string; name: string }) => [t.id, t.name])
  );
  list.replaceChildren();
  for (const msg of messages) {
    list.appendChild(createMessageElement(msg, teamMap));
  }
  list.scrollTop = list.scrollHeight;
}

export function buildChatLayout(container: HTMLElement, selectedTeamId: string): void {
  container.innerHTML = `
    <div class="chat-header">
      <h3 class="chat-title">Chat de la liga</h3>
      <select class="chat-identity-select" data-ref="team-select" aria-label="Seleccionar equipo emisor"></select>
    </div>
    <ul class="chat-messages" data-ref="chat-messages" aria-label="Mensajes del chat"></ul>
    <form class="chat-form" data-ref="chat-form">
      <input type="text" class="chat-input" data-ref="chat-input" placeholder="Escribe un mensaje..." maxlength="500" required />
      <button type="submit" class="chat-send-btn" data-ref="chat-send">Enviar</button>
    </form>
  `;
  const select = container.querySelector<HTMLSelectElement>('[data-ref="team-select"]');
  if (select) {
    for (const team of teamsData) {
      const opt = document.createElement('option');
      opt.value = team.id;
      opt.textContent = team.name;
      if (team.id === selectedTeamId) opt.selected = true;
      select.appendChild(opt);
    }
  }
}
