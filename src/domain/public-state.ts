import type {
  LockedDrawState,
  PublicDrawDto,
  PublicAssignment,
  PublicDivision,
  Team,
  Division,
  DrawStatus,
  Assignment
} from './types.js';
import { canonicalizeDrawPlan } from './commitment.js';

export interface PublicStateMeta {
  readonly leagueName: string;
  readonly seasonLabel: string;
  readonly timezone: string;
  readonly startAtUtc: string;
  readonly interval: number;
}

function createPublicAssignment(
  a: Assignment,
  teamMap: Map<string, string>
): PublicAssignment {
  return {
    position: a.position,
    teamId: a.teamId,
    teamName: teamMap.get(a.teamId) || a.teamId,
    divisionId: a.divisionId,
    revealAt: a.revealAt
  };
}

function buildDivisions(
  divisions: readonly Division[],
  revealed: readonly PublicAssignment[]
): readonly PublicDivision[] {
  return divisions.map((div) => ({
    id: div.id,
    name: div.name,
    capacity: 4,
    assignments: revealed.filter((a) => a.divisionId === div.id)
  }));
}

function deriveStatus(revealedCount: number): DrawStatus {
  if (revealedCount === 0) return 'scheduled';
  if (revealedCount === 16) return 'complete';
  return 'running';
}

function buildVerification(
  state: LockedDrawState,
  revealedCount: number
): { canonicalPayload: string; seedHex: string } | null {
  if (revealedCount < 16) return null;
  const canonical = canonicalizeDrawPlan({
    eventId: state.eventId,
    algorithmVersion: state.algorithmVersion,
    seedHex: state.seedHex,
    lockedAt: state.lockedAt,
    assignments: state.assignments
  });
  return { canonicalPayload: canonical, seedHex: state.seedHex };
}

function filterRevealed(state: LockedDrawState, teams: readonly Team[], nowMs: number) {
  const teamMap = new Map(teams.map((t) => [t.id, t.name]));
  const raw = state.assignments.filter((a) => new Date(a.revealAt).getTime() <= nowMs);
  const publicAssignments = raw.map((a) => createPublicAssignment(a, teamMap));
  const assignedTeamIds = new Set(raw.map((a) => a.teamId));
  return {
    count: raw.length,
    publicAssignments,
    pending: teams.filter((t) => !assignedTeamIds.has(t.id))
  };
}

export function computePublicDrawState(
  state: LockedDrawState,
  teams: readonly Team[],
  divisions: readonly Division[],
  meta: PublicStateMeta,
  now: Date
): PublicDrawDto {
  const r = filterRevealed(state, teams, now.getTime());
  return {
    eventId: state.eventId,
    leagueName: meta.leagueName,
    seasonLabel: meta.seasonLabel,
    timezone: meta.timezone,
    status: deriveStatus(r.count),
    serverNow: now.toISOString(),
    startAt: meta.startAtUtc,
    revealIntervalSeconds: meta.interval,
    teamCount: teams.length,
    divisionCapacity: 4,
    revealedCount: r.count,
    commitmentHash: state.commitmentHash,
    pendingTeams: r.pending,
    divisions: buildDivisions(divisions, r.publicAssignments),
    lastAssignment: r.count > 0 ? (r.publicAssignments[r.count - 1] ?? null) : null,
    nextRevealAt: r.count < 16 ? (state.assignments[r.count]?.revealAt ?? null) : null,
    verification: buildVerification(state, r.count)
  };
}
