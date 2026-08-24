import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createServerApp } from '../../src/server/app.js';
import { FileDrawRepository } from '../../src/adapters/file-draw-repository.js';
import { initializeDraw } from '../../src/application/initialize-draw.js';
import { loadConfig, type AppConfig } from '../../src/config/load-config.js';
import { FixedClock, VALID_ENV_PROD } from '../fixtures/draw-fixtures.js';
import type { EntropySource } from '../../src/application/ports.js';
import type { PublicDrawDto } from '../../src/domain/types.js';
import { verifyDrawCommitment } from '../../src/domain/commitment.js';
import { join } from 'node:path';
import { mkdirSync, rmSync, existsSync } from 'node:fs';

class FixedEntropy implements EntropySource {
  generateSeedHex(): string {
    return '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  }
}

describe('Full 16-Step Timeline Simulation (Task 10)', () => {
  const testDir = join(process.cwd(), '.data-test-timeline');
  const testFilePath = join(testDir, 'draw-state.json');
  const clock = new FixedClock(new Date('2026-09-01T18:00:00.000Z')); // startAt
  let app: FastifyInstance;
  let config: AppConfig;

  beforeAll(async () => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true, force: true });
    mkdirSync(testDir, { recursive: true });
    const env = { ...VALID_ENV_PROD, DRAW_STATE_PATH: testFilePath };
    config = loadConfig(env, clock);
    const repository = new FileDrawRepository(testFilePath);
    await initializeDraw(config, clock, new FixedEntropy(), repository);
    app = await createServerApp({ config, repository, clock });
  });

  afterAll(async () => {
    if (app) await app.close();
    if (existsSync(testDir)) rmSync(testDir, { recursive: true, force: true });
  });

  it('simulates each 120s step from position 1 to position 16 with exact invariants', async () => {
    for (let step = 1; step <= 16; step++) {
      clock.advanceSeconds(120);
      const res = await app.inject({ method: 'GET', url: '/api/draw' });
      expect(res.statusCode).toBe(200);
      const dto = res.json() as PublicDrawDto;

      expect(dto.revealedCount).toBe(step);
      expect(dto.pendingTeams).toHaveLength(16 - step);
      expect(dto.lastAssignment?.position).toBe(step);

      if (step < 16) {
        expect(dto.status).toBe('running');
        expect(dto.verification).toBeNull();
      } else {
        expect(dto.status).toBe('complete');
        expect(dto.verification).not.toBeNull();
        const verification = verifyDrawCommitment(
          dto.verification!.canonicalPayload,
          dto.commitmentHash,
          config.teams,
          config.divisions
        );
        expect(verification.valid).toBe(true);
      }
    }
  });
});
