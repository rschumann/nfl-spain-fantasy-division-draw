import type { Team, Division, Assignment } from './types.js';

export interface InvariantValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

function validateTeamsAndDivisions(
  teams: readonly Team[],
  divisions: readonly Division[],
  errors: string[]
): void {
  if (teams.length < 2) errors.push(`Expected at least 2 teams, got ${teams.length}`);
  if (new Set(teams.map((t) => t.id)).size !== teams.length) {
    errors.push('Duplicate team id found');
  }
  if (divisions.length < 2) {
    errors.push(`Expected at least 2 divisions, got ${divisions.length}`);
  }
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
  const divCounts = new Map<string, number>(divisions.map((d) => [d.id, 0]));
  for (const a of assignments) {
    if (!teamIds.has(a.teamId)) errors.push(`Unknown team id: ${a.teamId}`);
    if (assignedTeamIds.has(a.teamId))
      errors.push(`Team assigned multiple times: ${a.teamId}`);
    assignedTeamIds.add(a.teamId);
    const curr = divCounts.get(a.divisionId);
    if (curr !== undefined) divCounts.set(a.divisionId, curr + 1);
    else errors.push(`Invalid division id: ${a.divisionId}`);
  }
  const minCap = Math.floor(teams.length / divisions.length);
  const maxCap = Math.ceil(teams.length / divisions.length);
  for (const d of divisions) {
    const count = divCounts.get(d.id) ?? 0;
    if (count < minCap || count > maxCap) {
      errors.push(`Division ${d.id} has ${count} teams, expected ${minCap}-${maxCap}`);
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
  if (assignments.length !== teams.length) {
    errors.push(`Expected ${teams.length} assignments, got ${assignments.length}`);
  }
  validatePositionsAndTiming(assignments, startAtUtc, intervalSeconds, errors);
  validateDivisionBalance(assignments, teams, divisions, errors);
  return { valid: errors.length === 0, errors };
}
