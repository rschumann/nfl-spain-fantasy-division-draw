import type { LockedDrawState } from '../domain/types.js';

export interface Clock {
  now(): Date;
}

export interface EntropySource {
  generateSeedHex(): string;
}

export interface DrawRepository {
  loadLockedDraw(eventId: string): Promise<LockedDrawState | null>;
  saveLockedDraw(state: LockedDrawState): Promise<void>;
  resetAllowedState?(): Promise<void>;
}
