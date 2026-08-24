import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createServerApp } from '../../src/server/app.js';
import { FileDrawRepository } from '../../src/adapters/file-draw-repository.js';
import { initializeDraw } from '../../src/application/initialize-draw.js';
import { loadConfig } from '../../src/config/load-config.js';
import { FixedClock, VALID_ENV_PROD } from '../fixtures/draw-fixtures.js';
import type { EntropySource } from '../../src/application/ports.js';
import { join } from 'node:path';
import { mkdirSync, rmSync, existsSync } from 'node:fs';

class FixedEntropy implements EntropySource {
  generateSeedHex(): string {
    return '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  }
}

describe('Draw Public API Integration (Task 05)', () => {
  const testDir = join(process.cwd(), '.data-test-api');
  const testFilePath = join(testDir, 'draw-state.json');
  const clock = new FixedClock(new Date('2026-09-01T18:00:00.000Z')); // startAt
  const entropy = new FixedEntropy();
  let app: FastifyInstance;

  beforeAll(async () => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true, force: true });
    mkdirSync(testDir, { recursive: true });
    const env = { ...VALID_ENV_PROD, DRAW_STATE_PATH: testFilePath };
    const config = loadConfig(env, clock);
    const repository = new FileDrawRepository(testFilePath);
    await initializeDraw(config, clock, entropy, repository);
    app = await createServerApp({ config, repository, clock });
  });

  afterAll(async () => {
    if (app) await app.close();
    if (existsSync(testDir)) rmSync(testDir, { recursive: true, force: true });
  });

  it('serves GET /api/health with no-store and safe summary', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/health' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toContain('no-store');
    const body = res.json();
    expect(body).toEqual({ status: 'ok', eventId: 'nfl-spain-26-27', ready: true });
    expect(body.seedHex).toBeUndefined();
  });

  it('serves GET /api/draw with strict no-store and scheduled state at T0', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/draw' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toContain('no-store');
    const body = res.json();
    expect(body.status).toBe('scheduled');
    expect(body.revealedCount).toBe(0);
    expect(body.commitmentHash).toHaveLength(64);
    expect(body.pendingTeams).toHaveLength(16);
  });

  it('updates state at revealAt(1) when clock advances 120s', async () => {
    clock.advanceSeconds(120);
    const res = await app.inject({ method: 'GET', url: '/api/draw' });
    const body = res.json();
    expect(body.status).toBe('running');
    expect(body.revealedCount).toBe(1);
    expect(body.lastAssignment?.position).toBe(1);
    expect(body.pendingTeams).toHaveLength(15);
  });

  it('handles 50 concurrent requests returning identical progress', async () => {
    const requests = Array.from({ length: 50 }, () =>
      app.inject({ method: 'GET', url: '/api/draw' })
    );
    const responses = await Promise.all(requests);
    for (const res of responses) {
      expect(res.statusCode).toBe(200);
      expect(res.json().revealedCount).toBe(1);
    }
  });

  it('returns safe 404 for unknown endpoints', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/unknown' });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({ error: 'Not Found' });
  });
});
