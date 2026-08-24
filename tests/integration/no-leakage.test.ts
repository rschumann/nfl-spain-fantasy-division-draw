import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createServerApp } from '../../src/server/app.js';
import { FileDrawRepository } from '../../src/adapters/file-draw-repository.js';
import { initializeDraw } from '../../src/application/initialize-draw.js';
import { loadConfig } from '../../src/config/load-config.js';
import { FixedClock, VALID_ENV_PROD } from '../fixtures/draw-fixtures.js';
import type { EntropySource } from '../../src/application/ports.js';
import type { LockedDrawState, PublicDrawDto } from '../../src/domain/types.js';
import { join } from 'node:path';
import { mkdirSync, rmSync, existsSync } from 'node:fs';

class FixedEntropy implements EntropySource {
  generateSeedHex(): string {
    return '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  }
}

describe('No-Leakage Audit (Task 05 / Task 10)', () => {
  const testDir = join(process.cwd(), '.data-test-leak');
  const testFilePath = join(testDir, 'draw-state.json');
  const clock = new FixedClock(new Date('2026-09-01T18:00:00.000Z')); // startAt
  const entropy = new FixedEntropy();
  const secretSeed = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  let app: FastifyInstance;
  let secretState: LockedDrawState;

  beforeAll(async () => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true, force: true });
    mkdirSync(testDir, { recursive: true });
    const env = { ...VALID_ENV_PROD, DRAW_STATE_PATH: testFilePath };
    const config = loadConfig(env, clock);
    const repository = new FileDrawRepository(testFilePath);
    secretState = await initializeDraw(config, clock, entropy, repository);
    app = await createServerApp({ config, repository, clock });
  });

  afterAll(async () => {
    if (app) await app.close();
    if (existsSync(testDir)) rmSync(testDir, { recursive: true, force: true });
  });

  it('ensures secret seed does not appear anywhere in scheduled/running responses', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/draw' });
    const bodyStr = JSON.stringify(res.json());
    expect(bodyStr).not.toContain(secretSeed);
    const headersStr = JSON.stringify(res.headers);
    expect(headersStr).not.toContain(secretSeed);
  });

  it('ensures unrevealed assignments (positions 2..16) are not leaked at position 1', async () => {
    clock.advanceSeconds(120); // revealedCount = 1
    const res = await app.inject({ method: 'GET', url: '/api/draw' });
    const body = res.json() as PublicDrawDto;
    expect(body.revealedCount).toBe(1);

    // Positions 2 to 16 secret assignments
    for (let i = 1; i < 16; i++) {
      const secretAssignment = secretState.assignments[i]!;
      const divInBody = body.divisions.find((d) => d.id === secretAssignment.divisionId);
      const teamInDiv = divInBody?.assignments.find(
        (a) => a.teamId === secretAssignment.teamId
      );
      expect(teamInDiv).toBeUndefined();
    }
  });

  it('ensures health endpoint contains no secret state or paths', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/health' });
    const bodyStr = JSON.stringify(res.json());
    expect(bodyStr).not.toContain(testFilePath);
    expect(bodyStr).not.toContain(secretSeed);
  });
});
