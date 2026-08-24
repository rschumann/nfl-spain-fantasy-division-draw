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
  teamMap: Map<string, Team>
): PublicAssignment {
  const t = teamMap.get(a.teamId);
  return {
    position: a.position,
    teamId: a.teamId,
    teamName: t ? t.name : a.teamId,
    logoUrl: t?.logoUrl,
    divisionId: a.divisionId,
    revealAt: a.revealAt
  };
}

function buildDivisions(
  divisions: readonly Division[],
  revealed: readonly PublicAssignment[],
  teamCount: number
): readonly PublicDivision[] {
  const cap = Math.ceil(teamCount / divisions.length);
  return divisions.map((div) => ({
    id: div.id,
    name: div.name,
    capacity: cap,
    assignments: revealed.filter((a) => a.divisionId === div.id)
  }));
}

function deriveStatus(revealedCount: number, totalTeams: number): DrawStatus {
  if (revealedCount === 0) return 'scheduled';
  if (revealedCount === totalTeams) return 'complete';
  return 'running';
}

function buildVerification(
  state: LockedDrawState,
  revealedCount: number,
  totalTeams: number
): { canonicalPayload: string; seedHex: string } | null {
  if (revealedCount < totalTeams) return null;
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
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const raw = state.assignments.filter((a) => new Date(a.revealAt).getTime() <= nowMs);
  const publicAssignments = raw.map((a) => createPublicAssignment(a, teamMap));
  const assignedTeamIds = new Set(raw.map((a) => a.teamId));
  return {
    count: raw.length,
    publicAssignments,
    pending: teams.filter((t) => !assignedTeamIds.has(t.id))
  };
}

function getPointers(
  count: number,
  assignments: readonly Assignment[],
  pub: readonly PublicAssignment[],
  total: number
) {
  return {
    lastAssignment: count > 0 ? (pub[count - 1] ?? null) : null,
    nextRevealAt: count < total ? (assignments[count]?.revealAt ?? null) : null
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
  const cap = Math.ceil(teams.length / divisions.length);
  const ptrs = getPointers(r.count, state.assignments, r.publicAssignments, teams.length);
  return {
    eventId: state.eventId,
    leagueName: meta.leagueName,
    seasonLabel: meta.seasonLabel,
    timezone: meta.timezone,
    status: deriveStatus(r.count, teams.length),
    serverNow: now.toISOString(),
    startAt: meta.startAtUtc,
    revealIntervalSeconds: meta.interval,
    teamCount: teams.length,
    divisionCapacity: cap,
    revealedCount: r.count,
    commitmentHash: state.commitmentHash,
    pendingTeams: r.pending,
    divisions: buildDivisions(divisions, r.publicAssignments, teams.length),
    verification: buildVerification(state, r.count, teams.length),
    ...ptrs
  };
}
