import { describe, it, expect } from 'vitest';
import { validateDrawInvariants } from '../../src/domain/invariants.js';
import { createDrawPlan } from '../../src/domain/create-plan.js';
import { SAMPLE_TEAMS, SAMPLE_DIVISIONS } from '../fixtures/draw-fixtures.js';
import type { Team, Division, Assignment, DivisionId } from '../../src/domain/types.js';

describe('Draw Invariants Detailed Validation (Task 03)', () => {
  const seed = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const startAt = '2026-08-24T12:00:00.000Z';
  const plan = createDrawPlan(
    'nfl-spain-26-27',
    seed,
    startAt,
    120,
    '2026-08-24T10:00:00.000Z',
    SAMPLE_TEAMS,
    SAMPLE_DIVISIONS
  );

  it('detects invalid team count and duplicate teams', () => {
    const fewTeams = SAMPLE_TEAMS.slice(0, 15);
    const res1 = validateDrawInvariants(
      fewTeams,
      SAMPLE_DIVISIONS,
      plan.assignments,
      startAt,
      120
    );
    expect(res1.valid).toBe(false);
    expect(res1.errors.some((e) => e.includes('Expected 16 teams'))).toBe(true);

    const dupTeams: Team[] = [
      ...SAMPLE_TEAMS.slice(0, 15),
      { id: SAMPLE_TEAMS[0]!.id, name: 'Dup' }
    ];
    const res2 = validateDrawInvariants(
      dupTeams,
      SAMPLE_DIVISIONS,
      plan.assignments,
      startAt,
      120
    );
    expect(res2.valid).toBe(false);
    expect(res2.errors.some((e) => e.includes('Duplicate team id'))).toBe(true);
  });

  it('detects invalid division count and duplicate divisions', () => {
    const fewDivs = SAMPLE_DIVISIONS.slice(0, 3);
    const res1 = validateDrawInvariants(
      SAMPLE_TEAMS,
      fewDivs,
      plan.assignments,
      startAt,
      120
    );
    expect(res1.valid).toBe(false);
    expect(res1.errors.some((e) => e.includes('Expected 4 divisions'))).toBe(true);

    const dupDivs: Division[] = [...fewDivs, { id: fewDivs[0]!.id, name: 'Dup' }];
    const res2 = validateDrawInvariants(
      SAMPLE_TEAMS,
      dupDivs,
      plan.assignments,
      startAt,
      120
    );
    expect(res2.valid).toBe(false);
    expect(res2.errors.some((e) => e.includes('Duplicate division id'))).toBe(true);
  });

  it('detects position and reveal timing mismatches', () => {
    const badPos: Assignment[] = plan.assignments.map((a, i) => ({
      ...a,
      position: i === 0 ? 99 : a.position
    }));
    const res1 = validateDrawInvariants(
      SAMPLE_TEAMS,
      SAMPLE_DIVISIONS,
      badPos,
      startAt,
      120
    );
    expect(res1.valid).toBe(false);

    const badTime: Assignment[] = plan.assignments.map((a, i) => ({
      ...a,
      revealAt: i === 0 ? '2026-08-24T00:00:00.000Z' : a.revealAt
    }));
    const res2 = validateDrawInvariants(
      SAMPLE_TEAMS,
      SAMPLE_DIVISIONS,
      badTime,
      startAt,
      120
    );
    expect(res2.valid).toBe(false);
  });

  it('detects unknown teams and invalid division counts in assignments', () => {
    const unknownTeam: Assignment[] = plan.assignments.map((a, i) =>
      i === 0 ? { ...a, teamId: 'unknown-team-x' } : a
    );
    const res1 = validateDrawInvariants(
      SAMPLE_TEAMS,
      SAMPLE_DIVISIONS,
      unknownTeam,
      startAt,
      120
    );
    expect(res1.valid).toBe(false);

    const unbalanced: Assignment[] = plan.assignments.map((a, i) =>
      i === 0 ? { ...a, divisionId: 'NORTH' as DivisionId } : a
    );
    const res2 = validateDrawInvariants(
      SAMPLE_TEAMS,
      SAMPLE_DIVISIONS,
      unbalanced,
      startAt,
      120
    );
    expect(res2.valid).toBe(false);
  });

  it('detects wrong assignment count', () => {
    const fewAssignments = plan.assignments.slice(0, 15);
    const res = validateDrawInvariants(
      SAMPLE_TEAMS,
      SAMPLE_DIVISIONS,
      fewAssignments,
      startAt,
      120
    );
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes('Expected 16 assignments'))).toBe(true);
  });
});
