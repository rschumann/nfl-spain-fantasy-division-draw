import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { FileDrawRepository } from '../../src/adapters/file-draw-repository.js';
import { initializeDraw } from '../../src/application/initialize-draw.js';
import { loadConfig } from '../../src/config/load-config.js';
import { FixedClock, VALID_ENV_PROD } from '../fixtures/draw-fixtures.js';
import type { EntropySource } from '../../src/application/ports.js';

class FixedEntropy implements EntropySource {
  constructor(private seedHex: string) {}
  generateSeedHex(): string {
    return this.seedHex;
  }
}

describe('File Repository & Draw Initialization (Task 04)', () => {
  const testDir = join(process.cwd(), '.data-test-repo');
  const testFilePath = join(testDir, 'draw-state.json');
  const clock = new FixedClock(new Date('2026-08-24T12:00:00.000Z'));
  const entropy = new FixedEntropy(
    '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
  );

  beforeEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true, force: true });
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true, force: true });
  });

  it('persists locked state with 0600 permissions and reloads exactly', async () => {
    const repo = new FileDrawRepository(testFilePath);
    const env = { ...VALID_ENV_PROD, DRAW_STATE_PATH: testFilePath };
    const config = loadConfig(env, clock);

    const created = await initializeDraw(config, clock, entropy, repo);
    expect(created.eventId).toBe('nfl-spain-26-27');
    expect(existsSync(testFilePath)).toBe(true);

    const mode = statSync(testFilePath).mode & 0o777;
    expect(mode).toBe(0o600);

    const reloaded = await initializeDraw(config, clock, entropy, repo);
    expect(reloaded).toEqual(created);
  });

  it('fails closed on corrupted state file', async () => {
    writeFileSync(testFilePath, '{ corrupted json content ...', 'utf8');
    const repo = new FileDrawRepository(testFilePath);
    await expect(repo.loadLockedDraw('nfl-spain-26-27')).rejects.toThrow(
      /Failed to load locked draw state/
    );
  });

  it('throws on configuration fingerprint mismatch', async () => {
    const repo = new FileDrawRepository(testFilePath);
    const env1 = {
      ...VALID_ENV_PROD,
      DRAW_STATE_PATH: testFilePath,
      LEAGUE_NAME: 'NFL Spain'
    };
    const config1 = loadConfig(env1, clock);
    await initializeDraw(config1, clock, entropy, repo);

    const env2 = {
      ...VALID_ENV_PROD,
      DRAW_STATE_PATH: testFilePath,
      LEAGUE_NAME: 'NFL Spain Modified'
    };
    const config2 = loadConfig(env2, clock);
    await expect(initializeDraw(config2, clock, entropy, repo)).rejects.toThrow(
      /Configuration mismatch/
    );
  });

  it('resets state when resetOnStart is true', async () => {
    const repo = new FileDrawRepository(testFilePath);
    const env1 = {
      ...VALID_ENV_PROD,
      APP_ENV: 'local',
      DRAW_RESET_ON_START: 'false',
      DRAW_STATE_PATH: testFilePath
    };
    const config1 = loadConfig(env1, clock);
    const state1 = await initializeDraw(config1, clock, entropy, repo);

    const otherEntropy = new FixedEntropy(
      'fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210'
    );
    const env2 = {
      ...VALID_ENV_PROD,
      APP_ENV: 'local',
      DRAW_RESET_ON_START: 'true',
      DRAW_STATE_PATH: testFilePath
    };
    const config2 = loadConfig(env2, clock);
    const state2 = await initializeDraw(config2, clock, otherEntropy, repo);

    expect(state2.seedHex).not.toBe(state1.seedHex);
  });
});
