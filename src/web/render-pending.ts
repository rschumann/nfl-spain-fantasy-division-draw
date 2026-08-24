import type { Team } from '../domain/types.js';

function renderChips(
  container: HTMLElement,
  teams: readonly Team[],
  onlineTeamIds: readonly string[]
): void {
  container.replaceChildren();
  if (teams.length === 0) {
    const emptySpan = document.createElement('span');
    emptySpan.className = 'team-chip';
    emptySpan.textContent = 'Todos los equipos han sido sorteados.';
    container.appendChild(emptySpan);
    return;
  }
  for (const team of teams) {
    const chip = document.createElement('span');
    const isOnline = onlineTeamIds.includes(team.id);
    chip.className = isOnline ? 'team-chip is-online' : 'team-chip';
    chip.setAttribute('data-team-id', team.id);
    chip.innerHTML = isOnline
      ? `<span class="online-dot"></span> ${team.name}`
      : team.name;
    container.appendChild(chip);
  }
}

export function renderPendingTeams(
  container: HTMLElement,
  pendingTeams: readonly Team[],
  progressText: string,
  onlineTeamIds: readonly string[] = []
): void {
  const pendingBox = container.querySelector('[data-ref="pending-box"]');
  if (pendingBox) {
    const titleEl = pendingBox.querySelector('[data-ref="pending-title"]');
    if (titleEl) titleEl.textContent = `Equipos pendientes (${pendingTeams.length})`;
    const chipsEl = pendingBox.querySelector<HTMLElement>('[data-ref="pending-chips"]');
    if (chipsEl) renderChips(chipsEl, pendingTeams, onlineTeamIds);
  }
  const progressEl = container.querySelector('[data-ref="progress-text"]');
  if (progressEl) progressEl.textContent = progressText;
}
