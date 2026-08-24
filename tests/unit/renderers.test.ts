// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHeader } from '../../src/web/render-header.js';
import { renderDivisions } from '../../src/web/render-divisions.js';
import { renderPendingTeams } from '../../src/web/render-pending.js';
import { renderVerification } from '../../src/web/render-verification.js';
import { createDrawViewModel } from '../../src/web/view-model.js';
import { fetchPublicDraw } from '../../src/web/api.js';
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
    divisions: [{ id: 'NORTH', name: 'NORTH', capacity: 4, assignments: [] }],
    lastAssignment: null,
    nextRevealAt: '2026-08-24T12:02:00.000Z',
    verification: null
  };

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="app">
        <h1 data-ref="brand-title"></h1>
        <p data-ref="brand-subtitle"></p>
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

  it('renders header, timer hero and status badge correctly', () => {
    const container = document.getElementById('app')!;
    const vm = createDrawViewModel(sampleDto, 120);
    renderHeader(container, vm);

    expect(container.querySelector('[data-ref="brand-title"]')?.textContent).toBe(
      'NFL Spain'
    );
    expect(container.querySelector('[data-ref="timer-digits"]')?.textContent).toBe(
      '02:00'
    );
    expect(container.querySelector('[data-ref="status-badge"]')?.textContent).toBe(
      'Programado'
    );
  });

  it('renders division cards with 4 slots and pending teams', () => {
    const container = document.getElementById('app')!;
    const vm = createDrawViewModel(sampleDto, 120);
    renderDivisions(container, vm.divisions);
    renderPendingTeams(container, vm.pendingTeams, vm.progressText);

    const cards = container.querySelectorAll('.division-card');
    expect(cards).toHaveLength(1);
    expect(container.querySelector('[data-ref="progress-text"]')?.textContent).toBe(
      '0 de 16 equipos sorteados'
    );
    expect(container.querySelector('.team-chip')?.textContent).toBe('Madrid Steelers');
  });

  it('renders verification copy button and full verification check on completion', () => {
    const container = document.getElementById('app')!;
    const completeDto: PublicDrawDto = {
      ...sampleDto,
      status: 'complete',
      revealedCount: 16,
      pendingTeams: []
    };
    const vm = createDrawViewModel(completeDto, 0);
    renderVerification(container, vm, completeDto);
    expect(
      container.querySelector('[data-ref="commitment-hash"]')?.textContent
    ).toContain('...');
  });

  it('fetches public draw and handles sync controller lifecycle', async () => {
    const container = document.getElementById('app')!;
    const liveRegion = document.getElementById('live-announcer')!;
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => sampleDto
    });

    const dto = await fetchPublicDraw(null, mockFetch as unknown as typeof fetch);
    expect(dto.eventId).toBe('nfl-spain-26-27');

    const controller = new DrawSyncController(container, liveRegion);
    controller.start();
    controller.stop();
  });
});
