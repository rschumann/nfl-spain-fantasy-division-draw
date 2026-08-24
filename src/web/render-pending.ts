import type { Team } from '../domain/types.js';

function formatChipContent(
  name: string,
  isOnline: boolean,
  isMyTeam: boolean,
  logoUrl?: string
): string {
  const dot = isOnline ? '<span class="online-dot"></span> ' : '';
  const logo = logoUrl
    ? `<img src="${logoUrl}" alt="" class="team-logo-icon" width="16" height="16" /> `
    : '';
  if (isMyTeam) {
    return `<span class="my-team-star">★</span> ${logo}${dot}<strong>${name}</strong> <span class="my-team-tag">Tú</span>`;
  }
  return `${logo}${dot}${name}`;
}

function renderChips(
  container: HTMLElement,
  teams: readonly Team[],
  onlineTeamIds: readonly string[],
  myTeamId: string | null = null
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
    const isMyTeam = team.id === myTeamId;
    let cls = 'team-chip';
    if (isOnline) cls += ' is-online';
    if (isMyTeam) cls += ' is-my-team';
    chip.className = cls;
    chip.setAttribute('data-team-id', team.id);
    chip.innerHTML = formatChipContent(team.name, isOnline, isMyTeam, team.logoUrl);
    container.appendChild(chip);
  }
}

export function renderPendingTeams(
  container: HTMLElement,
  pendingTeams: readonly Team[],
  progressText: string,
  onlineTeamIds: readonly string[] = [],
  myTeamId: string | null = null
): void {
  const pendingBox = container.querySelector('[data-ref="pending-box"]');
  if (pendingBox) {
    const titleEl = pendingBox.querySelector('[data-ref="pending-title"]');
    if (titleEl) titleEl.textContent = `Equipos pendientes (${pendingTeams.length})`;
    const chipsEl = pendingBox.querySelector<HTMLElement>('[data-ref="pending-chips"]');
    if (chipsEl) renderChips(chipsEl, pendingTeams, onlineTeamIds, myTeamId);
  }
  const progressEl = container.querySelector('[data-ref="progress-text"]');
  if (progressEl) progressEl.textContent = progressText;
}
