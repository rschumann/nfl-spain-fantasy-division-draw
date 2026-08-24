import type { DrawViewModel } from './view-model.js';
import type { UserTeamIdentity } from './presence.js';

function renderMyTeamBadge(headerEl: HTMLElement, myTeam: UserTeamIdentity | null): void {
  let badge = headerEl.querySelector<HTMLElement>('[data-ref="my-team-badge"]');
  if (myTeam) {
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'my-team-badge';
      badge.setAttribute('data-ref', 'my-team-badge');
      headerEl.appendChild(badge);
    }
    badge.innerHTML = `🏈 Tu franquicia: <strong>${myTeam.teamName}</strong>`;
  } else if (badge) {
    badge.remove();
  }
}

function renderBrandInfo(container: HTMLElement, vm: DrawViewModel): void {
  const brandTitle = container.querySelector('[data-ref="brand-title"]');
  if (brandTitle) {
    const link = brandTitle.querySelector('a');
    if (link) {
      link.textContent = vm.leagueName;
    } else {
      brandTitle.textContent = vm.leagueName;
    }
  }
  const brandSubtitle = container.querySelector('[data-ref="brand-subtitle"]');
  if (brandSubtitle) {
    brandSubtitle.textContent = `Sorteo de divisiones · Temporada ${vm.seasonLabel}`;
  }
}

export function renderHeader(
  container: HTMLElement,
  vm: DrawViewModel,
  myTeam: UserTeamIdentity | null = null
): void {
  renderBrandInfo(container, vm);
  const statusBadge = container.querySelector('[data-ref="status-badge"]');
  if (statusBadge) {
    statusBadge.textContent = vm.status;
    statusBadge.className = `status-badge ${vm.statusBadgeClass}`;
  }
  const appHeader = container.querySelector<HTMLElement>('.app-header');
  if (appHeader) renderMyTeamBadge(appHeader, myTeam);
  renderTimerHero(container, vm);
}

function renderTimerHero(container: HTMLElement, vm: DrawViewModel): void {
  const timerHero = container.querySelector<HTMLElement>('[data-ref="timer-hero"]');
  if (!timerHero) return;

  const timerLabel = timerHero.querySelector('[data-ref="timer-label"]');
  if (timerLabel) {
    timerLabel.textContent = vm.showTimer ? vm.timerLabel : 'Sorteo finalizado';
  }

  const timerDigits = timerHero.querySelector<HTMLElement>('[data-ref="timer-digits"]');
  if (timerDigits) {
    timerDigits.textContent = vm.showTimer ? vm.timerFormatted : '16 / 16';
  }

  const spotlight = timerHero.querySelector<HTMLElement>(
    '[data-ref="spotlight-assignment"]'
  );
  if (spotlight) {
    spotlight.textContent =
      vm.spotlightText ||
      (vm.isComplete ? 'Sorteo completado con éxito' : 'Esperando primera asignación');
  }
}
