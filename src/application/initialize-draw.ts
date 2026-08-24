import type { Clock, EntropySource, DrawRepository } from './ports.js';
import type { AppConfig } from '../config/load-config.js';
import type { LockedDrawState, DrawPlan } from '../domain/types.js';
import { createDrawPlan } from '../domain/create-plan.js';
import { canonicalizeDrawPlan, computeCommitmentHash } from '../domain/commitment.js';

function buildLockedState(config: AppConfig, plan: DrawPlan): LockedDrawState {
  const canonical = canonicalizeDrawPlan(plan);
  const hash = computeCommitmentHash(canonical);
  return {
    schemaVersion: 1,
    algorithmVersion: plan.algorithmVersion,
    eventId: config.eventId,
    configFingerprint: config.configFingerprint,
    lockedAt: plan.lockedAt,
    seedHex: plan.seedHex,
    commitmentHash: hash,
    assignments: plan.assignments
  };
}

async function createAndPersistNewDraw(
  config: AppConfig,
  clock: Clock,
  entropy: EntropySource,
  repository: DrawRepository
): Promise<LockedDrawState> {
  const seedHex = entropy.generateSeedHex();
  const lockedAt = clock.now().toISOString();
  const plan = createDrawPlan(
    config.eventId,
    seedHex,
    config.startAtUtc,
    config.revealIntervalSeconds,
    lockedAt,
    config.teams,
    config.divisions
  );
  const state = buildLockedState(config, plan);
  await repository.saveLockedDraw(state);
  return state;
}

export async function initializeDraw(
  config: AppConfig,
  clock: Clock,
  entropy: EntropySource,
  repository: DrawRepository
): Promise<LockedDrawState> {
  if (config.resetOnStart && repository.resetAllowedState) {
    await repository.resetAllowedState();
    return createAndPersistNewDraw(config, clock, entropy, repository);
  }
  const existing = await repository.loadLockedDraw(config.eventId);
  if (existing) {
    if (existing.configFingerprint !== config.configFingerprint) {
      throw new Error(
        `Configuration mismatch: existing locked draw fingerprint (${existing.configFingerprint}) does not match current configuration (${config.configFingerprint})`
      );
    }
    return existing;
  }
  return createAndPersistNewDraw(config, clock, entropy, repository);
}
