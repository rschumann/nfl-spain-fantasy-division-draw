import type { Clock, DrawRepository } from './ports.js';
import type { AppConfig } from '../config/load-config.js';
import type { PublicDrawDto, Team } from '../domain/types.js';
import { computePublicDrawState } from '../domain/public-state.js';

export async function getPublicDrawState(
  config: AppConfig,
  repository: DrawRepository,
  clock: Clock,
  liveTeams?: readonly Team[]
): Promise<PublicDrawDto> {
  const lockedState = await repository.loadLockedDraw(config.eventId);
  if (!lockedState) {
    throw new Error(`Locked draw state not found for eventId: ${config.eventId}`);
  }
  return computePublicDrawState(
    lockedState,
    liveTeams || config.teams,
    config.divisions,
    {
      leagueName: config.leagueName,
      seasonLabel: config.seasonLabel,
      timezone: config.timezone,
      startAtUtc: config.startAtUtc,
      interval: config.revealIntervalSeconds
    },
    clock.now()
  );
}
