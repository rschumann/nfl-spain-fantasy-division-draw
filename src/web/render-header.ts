import type { DrawViewModel } from './view-model.js';

export function renderHeader(container: HTMLElement, vm: DrawViewModel): void {
  const brandTitle = container.querySelector('[data-ref="brand-title"]');
  if (brandTitle) brandTitle.textContent = vm.leagueName;

  const brandSubtitle = container.querySelector('[data-ref="brand-subtitle"]');
  if (brandSubtitle) {
    brandSubtitle.textContent = `Sorteo de divisiones · Temporada ${vm.seasonLabel}`;
  }

  const statusBadge = container.querySelector('[data-ref="status-badge"]');
  if (statusBadge) {
    statusBadge.textContent = vm.status;
    statusBadge.className = `status-badge ${vm.statusBadgeClass}`;
  }

  renderTimerHero(container, vm);
}

function renderTimerHero(container: HTMLElement, vm: DrawViewModel): void {
  const timerHero = container.querySelector<HTMLElement>('[data-ref="timer-hero"]');
  if (!timerHero) return;

  const timerLabel = timerHero.querySelector('[data-ref="timer-label"]');
  if (timerLabel)
    timerLabel.textContent = vm.showTimer ? vm.timerLabel : 'Sorteo finalizado';

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
