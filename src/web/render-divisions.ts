import type { PublicDivision, PublicAssignment } from '../domain/types.js';

function formatSlotTeam(name: string, isOnline: boolean, isMyTeam: boolean): string {
  const dot = isOnline ? '<span class="online-dot"></span> ' : '';
  if (isMyTeam) {
    return `<span class="my-team-star">★</span> ${dot}<strong>${name}</strong> <span class="my-team-tag">Tu equipo</span>`;
  }
  return isOnline ? `${dot}${name}` : name;
}

function createSlotElement(
  assignment?: PublicAssignment,
  onlineTeamIds: readonly string[] = [],
  myTeamId: string | null = null
): HTMLElement {
  const li = document.createElement('li');
  li.className = 'slot-item';
  if (assignment) {
    const isOnline = onlineTeamIds.includes(assignment.teamId);
    const isMyTeam = assignment.teamId === myTeamId;
    if (isOnline) li.classList.add('is-online');
    if (isMyTeam) li.classList.add('is-my-team');
    const teamSpan = document.createElement('span');
    teamSpan.className = 'slot-team';
    teamSpan.innerHTML = formatSlotTeam(assignment.teamName, isOnline, isMyTeam);
    const orderSpan = document.createElement('span');
    orderSpan.className = 'slot-order';
    orderSpan.textContent = `#${assignment.position}`;
    li.appendChild(teamSpan);
    li.appendChild(orderSpan);
  } else {
    const emptySpan = document.createElement('span');
    emptySpan.className = 'slot-empty';
    emptySpan.textContent = 'Pendiente';
    li.appendChild(emptySpan);
  }
  return li;
}

function renderDivisionCard(
  division: PublicDivision,
  onlineTeamIds: readonly string[],
  myTeamId: string | null = null
): HTMLElement {
  const card = document.createElement('div');
  const hasMyTeam = myTeamId
    ? division.assignments.some((a) => a.teamId === myTeamId)
    : false;
  card.className = `division-card div-${division.id}${hasMyTeam ? ' has-my-team' : ''}`;
  card.setAttribute('data-division', division.id);

  const header = document.createElement('div');
  header.className = 'division-header';
  header.textContent = `${division.name} (${division.assignments.length}/4)`;
  card.appendChild(header);

  const list = document.createElement('ul');
  list.className = 'slot-list';
  for (let i = 0; i < 4; i++) {
    const assignment = division.assignments[i];
    list.appendChild(createSlotElement(assignment, onlineTeamIds, myTeamId));
  }
  card.appendChild(list);
  return card;
}

export function renderDivisions(
  container: HTMLElement,
  divisions: readonly PublicDivision[],
  onlineTeamIds: readonly string[] = [],
  myTeamId: string | null = null
): void {
  const grid = container.querySelector('[data-ref="divisions-grid"]');
  if (!grid) return;
  grid.replaceChildren();
  for (const div of divisions) {
    grid.appendChild(renderDivisionCard(div, onlineTeamIds, myTeamId));
  }
}
