import { describe, it, expect } from 'vitest';
import { createDrawPlan } from '../../src/domain/create-plan.js';
import {
  canonicalizeDrawPlan,
  computeCommitmentHash
} from '../../src/domain/commitment.js';
import { computePublicDrawState } from '../../src/domain/public-state.js';
import { SAMPLE_TEAMS, SAMPLE_DIVISIONS } from '../fixtures/draw-fixtures.js';
import type { LockedDrawState } from '../../src/domain/types.js';

describe('Public Draw State Time Projection (Task 05)', () => {
  const seed = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const startAtUtc = '2026-08-24T12:00:00.000Z';
  const startTime = new Date(startAtUtc).getTime();
  const meta = {
    leagueName: 'NFL Spain',
    seasonLabel: '26-27',
    timezone: 'Europe/Madrid',
    startAtUtc,
    interval: 120
  };

  const plan = createDrawPlan(
    'nfl-spain-26-27',
    seed,
    startAtUtc,
    120,
    '2026-08-24T10:00:00.000Z',
    SAMPLE_TEAMS,
    SAMPLE_DIVISIONS
  );
  const lockedState: LockedDrawState = {
    schemaVersion: 1,
    algorithmVersion: plan.algorithmVersion,
    eventId: 'nfl-spain-26-27',
    configFingerprint: 'f'.repeat(64),
    lockedAt: plan.lockedAt,
    seedHex: seed,
    commitmentHash: computeCommitmentHash(canonicalizeDrawPlan(plan)),
    assignments: plan.assignments
  };

  it('projects scheduled state before start time', () => {
    const beforeStart = new Date(startTime - 60000);
    const dto = computePublicDrawState(
      lockedState,
      SAMPLE_TEAMS,
      SAMPLE_DIVISIONS,
      meta,
      beforeStart
    );
    expect(dto.status).toBe('scheduled');
    expect(dto.revealedCount).toBe(0);
    expect(dto.pendingTeams).toHaveLength(16);
    expect(dto.lastAssignment).toBeNull();
    expect(dto.nextRevealAt).toBe('2026-08-24T12:02:00.000Z');
    expect(dto.verification).toBeNull();
  });

  it('respects exact +/- 1ms boundaries for revealAt(1)', () => {
    const firstRevealMs = startTime + 120 * 1000;
    const dtoBefore = computePublicDrawState(
      lockedState,
      SAMPLE_TEAMS,
      SAMPLE_DIVISIONS,
      meta,
      new Date(firstRevealMs - 1)
    );
    expect(dtoBefore.revealedCount).toBe(0);

    const dtoAt = computePublicDrawState(
      lockedState,
      SAMPLE_TEAMS,
      SAMPLE_DIVISIONS,
      meta,
      new Date(firstRevealMs)
    );
    expect(dtoAt.revealedCount).toBe(1);
    expect(dtoAt.status).toBe('running');
    expect(dtoAt.pendingTeams).toHaveLength(15);
    expect(dtoAt.lastAssignment?.position).toBe(1);

    const dtoAfter = computePublicDrawState(
      lockedState,
      SAMPLE_TEAMS,
      SAMPLE_DIVISIONS,
      meta,
      new Date(firstRevealMs + 1)
    );
    expect(dtoAfter.revealedCount).toBe(1);
  });

  it('projects complete state at revealAt(16) with full verification payload', () => {
    const completionMs = startTime + 16 * 120 * 1000;
    const dto = computePublicDrawState(
      lockedState,
      SAMPLE_TEAMS,
      SAMPLE_DIVISIONS,
      meta,
      new Date(completionMs)
    );
    expect(dto.status).toBe('complete');
    expect(dto.revealedCount).toBe(16);
    expect(dto.pendingTeams).toHaveLength(0);
    expect(dto.nextRevealAt).toBeNull();
    expect(dto.verification).not.toBeNull();
    expect(dto.verification?.seedHex).toBe(seed);
  });
});
