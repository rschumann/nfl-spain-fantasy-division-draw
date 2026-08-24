import type { Team, Division, Assignment, DrawPlan, DivisionId } from './types.js';
import { DeterministicRandomStream } from './random-stream.js';
import { fisherYatesShuffle } from './shuffle.js';
import { validateDrawInvariants } from './invariants.js';

export const ALGORITHM_VERSION = 'hmac-sha256-fisher-yates-v1';

export interface PlanOptions {
  readonly eventId: string;
  readonly seedHex: string;
  readonly startAtUtc: string;
  readonly intervalSeconds: number;
  readonly lockedAt: string;
}

function createDivisionSlots(
  divisions: readonly Division[],
  teamCount: number
): DivisionId[] {
  const slots: DivisionId[] = [];
  const baseCap = Math.floor(teamCount / divisions.length);
  const remainder = teamCount % divisions.length;
  divisions.forEach((div, idx) => {
    const count = baseCap + (idx < remainder ? 1 : 0);
    for (let i = 0; i < count; i++) slots.push(div.id);
  });
  return slots;
}

function buildAssignments(
  teams: readonly Team[],
  slots: readonly DivisionId[],
  startAtUtc: string,
  intervalSeconds: number
): Assignment[] {
  const startTime = new Date(startAtUtc).getTime();
  return teams.map((team, idx) => ({
    position: idx + 1,
    teamId: team.id,
    divisionId: slots[idx]!,
    revealAt: new Date(startTime + (idx + 1) * intervalSeconds * 1000).toISOString()
  }));
}

function shuffleTeamsAndSlots(
  seedHex: string,
  teams: readonly Team[],
  divisions: readonly Division[]
): { teams: Team[]; slots: DivisionId[] } {
  const teamStream = new DeterministicRandomStream(seedHex, 'teams');
  const slotStream = new DeterministicRandomStream(seedHex, 'division-slots');
  const rawSlots = createDivisionSlots(divisions, teams.length);
  return {
    teams: fisherYatesShuffle(teams, teamStream),
    slots: fisherYatesShuffle(rawSlots, slotStream)
  };
}

export function createDrawPlan(
  eventId: string,
  seedHex: string,
  startAtUtc: string,
  intervalSeconds: number,
  lockedAt: string,
  teams: readonly Team[],
  divisions: readonly Division[]
): DrawPlan {
  const s = shuffleTeamsAndSlots(seedHex, teams, divisions);
  const a = buildAssignments(s.teams, s.slots, startAtUtc, intervalSeconds);
  const inv = validateDrawInvariants(teams, divisions, a, startAtUtc, intervalSeconds);
  if (!inv.valid)
    throw new Error(`Draw plan invariant violation: ${inv.errors.join(', ')}`);
  return {
    eventId,
    algorithmVersion: ALGORITHM_VERSION,
    seedHex,
    lockedAt,
    assignments: a
  };
}
