import type { Team, Division, Assignment, DivisionId } from './types.js';

export interface InvariantValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

function validateTeamsAndDivisions(
  teams: readonly Team[],
  divisions: readonly Division[],
  errors: string[]
): void {
  if (teams.length !== 16) errors.push(`Expected 16 teams, got ${teams.length}`);
  if (new Set(teams.map((t) => t.id)).size !== teams.length) {
    errors.push('Duplicate team id found');
  }
  if (divisions.length !== 4)
    errors.push(`Expected 4 divisions, got ${divisions.length}`);
  if (new Set(divisions.map((d) => d.id)).size !== divisions.length) {
    errors.push('Duplicate division id found');
  }
}

function validatePositionsAndTiming(
  assignments: readonly Assignment[],
  startAtUtc: string,
  intervalSeconds: number,
  errors: string[]
): void {
  const startTime = new Date(startAtUtc).getTime();
  assignments.forEach((a, idx) => {
    const expectedPos = idx + 1;
    if (a.position !== expectedPos) {
      errors.push(
        `Assignment at index ${idx} has position ${a.position}, expected ${expectedPos}`
      );
    }
    const expectedTime = startTime + expectedPos * intervalSeconds * 1000;
    const actualTime = new Date(a.revealAt).getTime();
    if (actualTime !== expectedTime) {
      errors.push(
        `Assignment ${expectedPos} revealAt mismatch: expected ${new Date(expectedTime).toISOString()}, got ${a.revealAt}`
      );
    }
  });
}

function validateDivisionBalance(
  assignments: readonly Assignment[],
  teams: readonly Team[],
  divisions: readonly Division[],
  errors: string[]
): void {
  const teamIds = new Set(teams.map((t) => t.id));
  const assignedTeamIds = new Set<string>();
  const divCounts: Record<DivisionId, number> = { NORTH: 0, EAST: 0, WEST: 0, SOUTH: 0 };
  for (const a of assignments) {
    if (!teamIds.has(a.teamId)) errors.push(`Unknown team id: ${a.teamId}`);
    if (assignedTeamIds.has(a.teamId))
      errors.push(`Team assigned multiple times: ${a.teamId}`);
    assignedTeamIds.add(a.teamId);
    if (divCounts[a.divisionId] !== undefined) divCounts[a.divisionId]++;
    else errors.push(`Invalid division id: ${a.divisionId}`);
  }
  for (const d of divisions) {
    if (divCounts[d.id] !== 4) {
      errors.push(`Division ${d.id} has ${divCounts[d.id]} teams, expected 4`);
    }
  }
}

export function validateDrawInvariants(
  teams: readonly Team[],
  divisions: readonly Division[],
  assignments: readonly Assignment[],
  startAtUtc: string,
  intervalSeconds: number
): InvariantValidationResult {
  const errors: string[] = [];
  validateTeamsAndDivisions(teams, divisions, errors);
  if (assignments.length !== 16) {
    errors.push(`Expected 16 assignments, got ${assignments.length}`);
  }
  validatePositionsAndTiming(assignments, startAtUtc, intervalSeconds, errors);
  validateDivisionBalance(assignments, teams, divisions, errors);
  return { valid: errors.length === 0, errors };
}
