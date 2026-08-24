import { describe, it, expect } from 'vitest';
import { createDrawPlan } from '../../src/domain/create-plan.js';
import {
  canonicalizeDrawPlan,
  computeCommitmentHash,
  verifyDrawCommitment
} from '../../src/domain/commitment.js';
import { SAMPLE_TEAMS, SAMPLE_DIVISIONS } from '../fixtures/draw-fixtures.js';

describe('Commitment Hash & Verification (Task 03)', () => {
  const seed = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const startAt = '2026-08-24T12:00:00.000Z';
  const lockedAt = '2026-08-24T10:00:00.000Z';

  it('generates canonical payload and computes valid commitment hash', () => {
    const plan = createDrawPlan(
      'nfl-spain-26-27',
      seed,
      startAt,
      120,
      lockedAt,
      SAMPLE_TEAMS,
      SAMPLE_DIVISIONS
    );
    const payload = canonicalizeDrawPlan(plan);
    expect(payload).toContain('algorithm:hmac-sha256-fisher-yates-v1\n');
    expect(payload).toContain(`seedHex:${seed}\n`);
    expect(payload).toContain('assignments:\n');

    const hash = computeCommitmentHash(payload);
    expect(hash).toHaveLength(64);

    const result = verifyDrawCommitment(payload, hash, SAMPLE_TEAMS, SAMPLE_DIVISIONS);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails verification when hash is modified', () => {
    const plan = createDrawPlan(
      'nfl-spain-26-27',
      seed,
      startAt,
      120,
      lockedAt,
      SAMPLE_TEAMS,
      SAMPLE_DIVISIONS
    );
    const payload = canonicalizeDrawPlan(plan);
    const badHash = '0'.repeat(64);
    const result = verifyDrawCommitment(payload, badHash, SAMPLE_TEAMS, SAMPLE_DIVISIONS);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Hash mismatch'))).toBe(true);
  });

  it('fails verification when seed is altered in payload', () => {
    const plan = createDrawPlan(
      'nfl-spain-26-27',
      seed,
      startAt,
      120,
      lockedAt,
      SAMPLE_TEAMS,
      SAMPLE_DIVISIONS
    );
    const payload = canonicalizeDrawPlan(plan);
    const tamperedPayload = payload.replace(seed, 'f'.repeat(64));
    const tamperedHash = computeCommitmentHash(tamperedPayload);
    const result = verifyDrawCommitment(
      tamperedPayload,
      tamperedHash,
      SAMPLE_TEAMS,
      SAMPLE_DIVISIONS
    );
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((e) =>
        e.includes('mismatch between payload and reproduced plan')
      )
    ).toBe(true);
  });

  it('fails verification when an assignment team is altered in payload', () => {
    const plan = createDrawPlan(
      'nfl-spain-26-27',
      seed,
      startAt,
      120,
      lockedAt,
      SAMPLE_TEAMS,
      SAMPLE_DIVISIONS
    );
    const payload = canonicalizeDrawPlan(plan);
    const firstTeam = plan.assignments[0]!.teamId;
    const secondTeam = plan.assignments[1]!.teamId;
    const tamperedPayload = payload.replace(`1|${firstTeam}|`, `1|${secondTeam}|`);
    const tamperedHash = computeCommitmentHash(tamperedPayload);
    const result = verifyDrawCommitment(
      tamperedPayload,
      tamperedHash,
      SAMPLE_TEAMS,
      SAMPLE_DIVISIONS
    );
    expect(result.valid).toBe(false);
  });

  it('fails verification when payload is malformed or headers missing', () => {
    const badPayload = 'invalid payload content without structure';
    const hash = computeCommitmentHash(badPayload);
    const result = verifyDrawCommitment(badPayload, hash, SAMPLE_TEAMS, SAMPLE_DIVISIONS);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Parse error'))).toBe(true);
  });

  it('fails verification when algorithm header is unsupported', () => {
    const plan = createDrawPlan(
      'nfl-spain-26-27',
      seed,
      startAt,
      120,
      lockedAt,
      SAMPLE_TEAMS,
      SAMPLE_DIVISIONS
    );
    const payload = canonicalizeDrawPlan(plan);
    const tamperedPayload = payload.replace(
      'hmac-sha256-fisher-yates-v1',
      'insecure-algo-v0'
    );
    const tamperedHash = computeCommitmentHash(tamperedPayload);
    const result = verifyDrawCommitment(
      tamperedPayload,
      tamperedHash,
      SAMPLE_TEAMS,
      SAMPLE_DIVISIONS
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Unsupported algorithm'))).toBe(true);
  });
});
