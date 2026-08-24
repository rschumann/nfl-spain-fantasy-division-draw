import type { DrawPlan, Team, Division, Assignment, DivisionId } from './types.js';
import { sha256Bytes } from './sha256.js';
import { bytesToHex } from './random-stream.js';
import { createDrawPlan, ALGORITHM_VERSION } from './create-plan.js';
import { validateDrawInvariants } from './invariants.js';

export function canonicalizeDrawPlan(plan: DrawPlan): string {
  const lines: string[] = [
    `algorithm:${plan.algorithmVersion}`,
    `eventId:${plan.eventId}`,
    `lockedAt:${plan.lockedAt}`,
    `seedHex:${plan.seedHex}`,
    'assignments:'
  ];
  for (const a of plan.assignments) {
    lines.push(`${a.position}|${a.teamId}|${a.divisionId}|${a.revealAt}`);
  }
  return lines.join('\n') + '\n';
}

export function computeCommitmentHash(canonicalPayload: string): string {
  const bytes = new TextEncoder().encode(canonicalPayload);
  return bytesToHex(sha256Bytes(bytes));
}

export interface VerificationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

function parseCanonicalHeader(lines: string[]): {
  algorithm: string;
  eventId: string;
  lockedAt: string;
  seedHex: string;
} {
  const getVal = (prefix: string): string => {
    const line = lines.find((l) => l.startsWith(prefix));
    if (!line) throw new Error(`Missing ${prefix} in payload`);
    return line.substring(prefix.length);
  };
  return {
    algorithm: getVal('algorithm:'),
    eventId: getVal('eventId:'),
    lockedAt: getVal('lockedAt:'),
    seedHex: getVal('seedHex:')
  };
}

function parseCanonicalAssignments(lines: string[]): Assignment[] {
  const assignIdx = lines.indexOf('assignments:');
  if (assignIdx === -1) throw new Error('Missing assignments: section in payload');
  const assignmentLines = lines.slice(assignIdx + 1).filter((l) => l.trim().length > 0);
  return assignmentLines.map((line) => {
    const p = line.split('|');
    if (p.length !== 4) throw new Error(`Invalid assignment line format: ${line}`);
    return {
      position: parseInt(p[0]!, 10),
      teamId: p[1]!,
      divisionId: p[2]! as DivisionId,
      revealAt: p[3]!
    };
  });
}

function deriveTiming(assignments: readonly Assignment[]): {
  startAtUtc: string;
  interval: number;
} {
  const first = assignments[0];
  const second = assignments[1];
  if (!first || !second) throw new Error('Insufficient assignments to verify timing');
  const interval =
    (new Date(second.revealAt).getTime() - new Date(first.revealAt).getTime()) / 1000;
  const startAtUtc = new Date(
    new Date(first.revealAt).getTime() - interval * 1000
  ).toISOString();
  return { startAtUtc, interval };
}

function compareAssignments(
  orig: readonly Assignment[],
  repro: readonly Assignment[],
  errs: string[]
): void {
  for (let i = 0; i < 16; i++) {
    const o = orig[i]!;
    const r = repro[i]!;
    if (
      o.teamId !== r.teamId ||
      o.divisionId !== r.divisionId ||
      o.revealAt !== r.revealAt
    ) {
      errs.push(`Assignment ${i + 1} mismatch between payload and reproduced plan`);
    }
  }
}

function verifyPlanReproduction(
  hdr: { eventId: string; lockedAt: string; seedHex: string },
  assignments: Assignment[],
  teams: readonly Team[],
  divisions: readonly Division[],
  errors: string[]
): void {
  const timing = deriveTiming(assignments);
  const repro = createDrawPlan(
    hdr.eventId,
    hdr.seedHex,
    timing.startAtUtc,
    timing.interval,
    hdr.lockedAt,
    teams,
    divisions
  );
  compareAssignments(assignments, repro.assignments, errors);
  const inv = validateDrawInvariants(
    teams,
    divisions,
    assignments,
    timing.startAtUtc,
    timing.interval
  );
  if (!inv.valid) errors.push(...inv.errors);
}

export function verifyDrawCommitment(
  canonicalPayload: string,
  expectedHash: string,
  teams: readonly Team[],
  divisions: readonly Division[]
): VerificationResult {
  const errors: string[] = [];
  const calculatedHash = computeCommitmentHash(canonicalPayload);
  if (calculatedHash !== expectedHash) {
    errors.push(`Hash mismatch: expected ${expectedHash}, got ${calculatedHash}`);
  }
  try {
    const lines = canonicalPayload.split('\n').map((l) => l.trim());
    const header = parseCanonicalHeader(lines);
    if (header.algorithm !== ALGORITHM_VERSION) {
      errors.push(`Unsupported algorithm: ${header.algorithm}`);
    }
    const assignments = parseCanonicalAssignments(lines);
    if (assignments.length !== 16)
      errors.push(`Expected 16 assignments, got ${assignments.length}`);
    verifyPlanReproduction(header, assignments, teams, divisions, errors);
  } catch (err) {
    errors.push(`Parse error: ${err instanceof Error ? err.message : String(err)}`);
  }
  return { valid: errors.length === 0, errors };
}
