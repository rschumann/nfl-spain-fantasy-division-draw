import { describe, it, expect } from 'vitest';
import { createDrawViewModel } from '../../src/web/view-model.js';
import { applyStaleGuard } from '../../src/web/api.js';
import type { PublicDrawDto } from '../../src/domain/types.js';

describe('Web View Model & Stale Guard (Task 06)', () => {
  const baseDto: PublicDrawDto = {
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
    commitmentHash: 'a'.repeat(64),
    pendingTeams: [{ id: 'madrid-steelers', name: 'Madrid Steelers' }],
    divisions: [{ id: 'NORTH', name: 'NORTH', capacity: 4, assignments: [] }],
    lastAssignment: null,
    nextRevealAt: '2026-08-24T12:02:00.000Z',
    verification: null
  };

  it('creates scheduled view model with countdown and progress', () => {
    const vm = createDrawViewModel(baseDto, 120);
    expect(vm.status).toBe('Programado');
    expect(vm.timerLabel).toBe('El sorteo empieza en');
    expect(vm.timerFormatted).toBe('02:00');
    expect(vm.showTimer).toBe(true);
    expect(vm.progressText).toBe('0 de 16 equipos sorteados');
    expect(vm.shortHash).toBe('aaaaaaaa...aaaaaaaa');
  });

  it('creates running view model with spotlight assignment', () => {
    const runningDto: PublicDrawDto = {
      ...baseDto,
      status: 'running',
      revealedCount: 1,
      lastAssignment: {
        position: 1,
        teamId: 'madrid-steelers',
        teamName: 'Madrid Steelers',
        divisionId: 'NORTH',
        revealAt: '2026-08-24T12:02:00.000Z'
      }
    };
    const vm = createDrawViewModel(runningDto, 90);
    expect(vm.status).toBe('En directo');
    expect(vm.timerLabel).toBe('Siguiente equipo en');
    expect(vm.spotlightText).toContain('Madrid Steelers  →  NORTH');
  });

  it('creates reconnecting view model state', () => {
    const vm = createDrawViewModel(baseDto, 120, true);
    expect(vm.status).toBe('Reconectando…');
    expect(vm.isReconnecting).toBe(true);
  });

  it('guards against stale API responses with lower revealedCount', () => {
    const current: PublicDrawDto = { ...baseDto, revealedCount: 5 };
    const stale: PublicDrawDto = {
      ...baseDto,
      revealedCount: 3,
      serverNow: '2026-08-24T12:10:00.000Z'
    };
    const result = applyStaleGuard(stale, current);
    expect(result.revealedCount).toBe(5);
    expect(result.serverNow).toBe('2026-08-24T12:10:00.000Z');
  });
});
