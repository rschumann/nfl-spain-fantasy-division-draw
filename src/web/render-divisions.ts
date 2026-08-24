import type { PublicDivision, PublicAssignment } from '../domain/types.js';

function createSlotElement(assignment?: PublicAssignment): HTMLElement {
  const li = document.createElement('li');
  li.className = 'slot-item';
  if (assignment) {
    const teamSpan = document.createElement('span');
    teamSpan.className = 'slot-team';
    teamSpan.textContent = assignment.teamName;
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

function renderDivisionCard(division: PublicDivision): HTMLElement {
  const card = document.createElement('div');
  card.className = `division-card div-${division.id}`;
  card.setAttribute('data-division', division.id);

  const header = document.createElement('div');
  header.className = 'division-header';
  header.textContent = `${division.name} (${division.assignments.length}/4)`;
  card.appendChild(header);

  const list = document.createElement('ul');
  list.className = 'slot-list';
  for (let i = 0; i < 4; i++) {
    const assignment = division.assignments[i];
    list.appendChild(createSlotElement(assignment));
  }
  card.appendChild(list);
  return card;
}

export function renderDivisions(
  container: HTMLElement,
  divisions: readonly PublicDivision[]
): void {
  const grid = container.querySelector('[data-ref="divisions-grid"]');
  if (!grid) return;
  grid.replaceChildren();
  for (const div of divisions) {
    grid.appendChild(renderDivisionCard(div));
  }
}
