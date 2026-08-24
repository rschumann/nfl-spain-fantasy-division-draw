export type DivisionId = 'NORTH' | 'EAST' | 'WEST' | 'SOUTH';

export interface Team {
  readonly id: string;
  readonly name: string;
  readonly logoUrl?: string;
}

export interface Division {
  readonly id: DivisionId;
  readonly name: string;
}

export interface Assignment {
  readonly position: number;
  readonly teamId: string;
  readonly divisionId: DivisionId;
  readonly revealAt: string;
}

export interface DrawPlan {
  readonly eventId: string;
  readonly algorithmVersion: string;
  readonly seedHex: string;
  readonly lockedAt: string;
  readonly assignments: readonly Assignment[];
}

export interface LockedDrawState {
  readonly schemaVersion: number;
  readonly algorithmVersion: string;
  readonly eventId: string;
  readonly configFingerprint: string;
  readonly lockedAt: string;
  readonly seedHex: string;
  readonly commitmentHash: string;
  readonly assignments: readonly Assignment[];
}

export type DrawStatus = 'scheduled' | 'running' | 'complete' | 'error';

export interface PublicAssignment {
  readonly position: number;
  readonly teamId: string;
  readonly teamName: string;
  readonly logoUrl?: string;
  readonly divisionId: DivisionId;
  readonly revealAt: string;
}

export interface PublicDivision {
  readonly id: DivisionId;
  readonly name: string;
  readonly capacity: number;
  readonly assignments: readonly PublicAssignment[];
}

export interface VerificationPayload {
  readonly canonicalPayload: string;
  readonly seedHex: string;
}

export interface PublicDrawDto {
  readonly eventId: string;
  readonly leagueName: string;
  readonly seasonLabel: string;
  readonly timezone: string;
  readonly status: DrawStatus;
  readonly serverNow: string;
  readonly startAt: string;
  readonly revealIntervalSeconds: number;
  readonly teamCount: number;
  readonly divisionCapacity: number;
  readonly revealedCount: number;
  readonly commitmentHash: string;
  readonly pendingTeams: readonly Team[];
  readonly divisions: readonly PublicDivision[];
  readonly lastAssignment: PublicAssignment | null;
  readonly nextRevealAt: string | null;
  readonly verification: VerificationPayload | null;
}
