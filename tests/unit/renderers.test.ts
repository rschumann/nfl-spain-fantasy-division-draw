// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHeader } from '../../src/web/render-header.js';
import { renderDivisions } from '../../src/web/render-divisions.js';
import { renderPendingTeams } from '../../src/web/render-pending.js';
import { renderVerification } from '../../src/web/render-verification.js';
import { createDrawViewModel } from '../../src/web/view-model.js';
import { DrawSyncController } from '../../src/web/polling.js';
import type { PublicDrawDto } from '../../src/domain/types.js';

describe('Web Renderers and Polling Sync (Task 06)', () => {
  const sampleDto: PublicDrawDto = {
    eventId: 'nfl-spain-26-27',
    leagueName: 'NFL Spain',
    seasonLabel: '26-27',
    timezone: 'Europe/Madrid',
    status: 'scheduled',
    serverNow: '2026-08-24T12:00:00.000Z',
    startAt: '2026-08-24T12:00:00.000Z',
    revealIntervalSeconds: 120,
    teamCount: 16,
    divisionCapacity: 4,
    revealedCount: 0,
    commitmentHash: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    pendingTeams: [{ id: 'madrid-steelers', name: 'Madrid Steelers' }],
    divisions: [
      {
        id: 'NORTH',
        name: 'NORTH',
        capacity: 4,
        assignments: [
          {
            position: 1,
            teamId: 'madrid-steelers',
            teamName: 'Madrid Steelers',
            divisionId: 'NORTH',
            revealAt: '2026-08-24T12:02:00.000Z'
          }
        ]
      }
    ],
    lastAssignment: null,
    nextRevealAt: '2026-08-24T12:02:00.000Z',
    verification: null
  };

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="app">
        <h1 data-ref="brand-title"></h1>
        <p data-ref="brand-subtitle">Sorteo de divisiones · Temporada 26-27</p>
        <span data-ref="status-badge"></span>
        <div data-ref="timer-hero">
          <p data-ref="timer-label"></p>
          <div data-ref="timer-digits"></div>
          <div data-ref="spotlight-assignment"></div>
        </div>
        <div data-ref="divisions-grid"></div>
        <div data-ref="pending-box">
          <h2 data-ref="pending-title"></h2>
          <div data-ref="pending-chips"></div>
        </div>
        <p data-ref="progress-text"></p>
        <code data-ref="commitment-hash"></code>
        <button data-ref="btn-copy-hash">Copiar</button>
        <div data-ref="verification-box"></div>
      </div>
      <div id="live-announcer"></div>
    `;
  });

  it('renders header for scheduled, running and completed states', () => {
    const container = document.getElementById('app')!;
    const vm1 = createDrawViewModel(sampleDto, 120);
    renderHeader(container, vm1);
    expect(container.querySelector('[data-ref="timer-digits"]')?.textContent).toBe(
      '02:00'
    );

    const runningDto = {
      ...sampleDto,
      status: 'running' as const,
      lastAssignment: sampleDto.divisions[0]!.assignments[0]!
    };
    const vm2 = createDrawViewModel(runningDto, 60);
    renderHeader(container, vm2);
    expect(
      container.querySelector('[data-ref="spotlight-assignment"]')?.textContent
    ).toContain('Madrid Steelers');

    const completeDto = { ...sampleDto, status: 'complete' as const };
    const vm3 = createDrawViewModel(completeDto, 0);
    renderHeader(container, vm3);
    expect(container.querySelector('[data-ref="timer-digits"]')?.textContent).toBe(
      '16 / 16'
    );
  });

  it('renders division slots and empty/filled pending teams lists', () => {
    const container = document.getElementById('app')!;
    const vm = createDrawViewModel(sampleDto, 120);
    renderDivisions(container, vm.divisions);
    renderPendingTeams(container, vm.pendingTeams, vm.progressText);
    expect(container.querySelectorAll('.slot-team')).toHaveLength(1);

    renderPendingTeams(container, [], '16 de 16 equipos sorteados');
    expect(container.querySelector('.team-chip')?.textContent).toContain(
      'Todos los equipos'
    );
  });

  it('renders verification and copy button interactions', () => {
    const container = document.getElementById('app')!;
    const vm = createDrawViewModel(sampleDto, 120);
    renderVerification(container, vm, sampleDto);
    const copyBtn = container.querySelector<HTMLButtonElement>(
      '[data-ref="btn-copy-hash"]'
    );
    copyBtn?.click();
    expect(
      container.querySelector('[data-ref="commitment-hash"]')?.textContent
    ).toContain('...');
  });

  it('handles sync controller updates and live announcements', async () => {
    const container = document.getElementById('app')!;
    const liveRegion = document.getElementById('live-announcer')!;
    const fetchSpy = vi.spyOn(window, 'fetch');
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => sampleDto
    } as unknown as Response);

    const controller = new DrawSyncController(container, liveRegion);
    await controller.sync();

    const updatedDto = {
      ...sampleDto,
      revealedCount: 1,
      lastAssignment: sampleDto.divisions[0]!.assignments[0]!
    };
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedDto
    } as unknown as Response);

    await controller.sync();
    expect(liveRegion.textContent).toContain('Nueva asignación');
    controller.stop();
  });
});
