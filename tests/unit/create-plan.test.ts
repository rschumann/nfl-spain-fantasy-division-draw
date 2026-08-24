import { describe, it, expect } from 'vitest';
import { createDrawPlan } from '../../src/domain/create-plan.js';
import { validateDrawInvariants } from '../../src/domain/invariants.js';
import { SAMPLE_TEAMS, SAMPLE_DIVISIONS } from '../fixtures/draw-fixtures.js';

describe('Draw Plan Creation & Invariants (Task 03)', () => {
  const seed1 = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const seed2 = 'fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210';
  const startAt = '2026-08-24T12:00:00.000Z';
  const lockedAt = '2026-08-24T10:00:00.000Z';

  it('creates balanced 16-team plan with exact division capacities', () => {
    const plan = createDrawPlan(
      'nfl-spain-26-27',
      seed1,
      startAt,
      120,
      lockedAt,
      SAMPLE_TEAMS,
      SAMPLE_DIVISIONS
    );
    expect(plan.assignments).toHaveLength(16);
    expect(plan.assignments[0]!.position).toBe(1);
    expect(plan.assignments[0]!.revealAt).toBe('2026-08-24T12:02:00.000Z');
    expect(plan.assignments[15]!.position).toBe(16);
    expect(plan.assignments[15]!.revealAt).toBe('2026-08-24T12:32:00.000Z');

    const counts: Record<string, number> = { NORTH: 0, EAST: 0, WEST: 0, SOUTH: 0 };
    plan.assignments.forEach((a) => {
      counts[a.divisionId] = (counts[a.divisionId] ?? 0) + 1;
    });
    expect(counts).toEqual({ NORTH: 4, EAST: 4, WEST: 4, SOUTH: 4 });
  });

  it('reproduces identical plan for identical seed and parameters', () => {
    const p1 = createDrawPlan(
      'nfl-spain-26-27',
      seed1,
      startAt,
      120,
      lockedAt,
      SAMPLE_TEAMS,
      SAMPLE_DIVISIONS
    );
    const p2 = createDrawPlan(
      'nfl-spain-26-27',
      seed1,
      startAt,
      120,
      lockedAt,
      SAMPLE_TEAMS,
      SAMPLE_DIVISIONS
    );
    expect(p1).toEqual(p2);
  });

  it('produces different plans for different seeds', () => {
    const p1 = createDrawPlan(
      'nfl-spain-26-27',
      seed1,
      startAt,
      120,
      lockedAt,
      SAMPLE_TEAMS,
      SAMPLE_DIVISIONS
    );
    const p2 = createDrawPlan(
      'nfl-spain-26-27',
      seed2,
      startAt,
      120,
      lockedAt,
      SAMPLE_TEAMS,
      SAMPLE_DIVISIONS
    );
    expect(p1.assignments).not.toEqual(p2.assignments);
  });

  it('verifies 10,000 generated plans all satisfy 7 draw invariants', () => {
    for (let i = 0; i < 10000; i++) {
      const hexSeed = (i.toString(16).padStart(8, '0') + 'a'.repeat(56)).substring(0, 64);
      const plan = createDrawPlan(
        'nfl-spain-26-27',
        hexSeed,
        startAt,
        120,
        lockedAt,
        SAMPLE_TEAMS,
        SAMPLE_DIVISIONS
      );
      const inv = validateDrawInvariants(
        SAMPLE_TEAMS,
        SAMPLE_DIVISIONS,
        plan.assignments,
        startAt,
        120
      );
      expect(inv.valid).toBe(true);
      expect(inv.errors).toHaveLength(0);
    }
  }, 60000);

  it('invariants validator flags corrupted assignments', () => {
    const plan = createDrawPlan(
      'nfl-spain-26-27',
      seed1,
      startAt,
      120,
      lockedAt,
      SAMPLE_TEAMS,
      SAMPLE_DIVISIONS
    );
    const corrupted = [...plan.assignments];
    corrupted[0] = { ...corrupted[0]!, teamId: corrupted[1]!.teamId };
    const res = validateDrawInvariants(
      SAMPLE_TEAMS,
      SAMPLE_DIVISIONS,
      corrupted,
      startAt,
      120
    );
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes('multiple times'))).toBe(true);
  });
});
