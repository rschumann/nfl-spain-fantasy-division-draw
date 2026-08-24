import { describe, it, expect } from 'vitest';
import fastify from 'fastify';
import { createAdminRoutes } from '../../src/server/routes/admin-route.js';
import { TeamRegistry } from '../../src/server/team-registry.js';
import { loadConfig } from '../../src/config/load-config.js';
import { FixedClock, VALID_ENV_LOCAL } from '../fixtures/draw-fixtures.js';

describe('Admin Routes (Dashboard, Key Generation, ESPN Sync)', () => {
  const clock = new FixedClock(new Date('2026-08-24T12:00:00.000Z'));
  const config = loadConfig(VALID_ENV_LOCAL, clock);

  it('rejects unauthorized access without valid adminKey', async () => {
    const registry = new TeamRegistry();
    const app = fastify();
    await app.register(createAdminRoutes({ config, registry }));

    const r1 = await app.inject({ method: 'GET', url: '/api/admin/dashboard' });
    expect(r1.statusCode).toBe(401);

    const r2 = await app.inject({ method: 'POST', url: '/api/admin/keys/generate' });
    expect(r2.statusCode).toBe(401);

    const r3 = await app.inject({ method: 'POST', url: '/api/admin/espn/sync' });
    expect(r3.statusCode).toBe(401);
  });

  it('authenticates via x-admin-key header and returns dashboard', async () => {
    const registry = new TeamRegistry();
    const app = fastify();
    await app.register(createAdminRoutes({ config, registry }));

    const res = await app.inject({
      method: 'GET',
      url: '/api/admin/dashboard',
      headers: { 'x-admin-key': config.adminKey }
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.config.leagueName).toBe('NFL Spain');
    expect(body.keys).toHaveLength(16);
  });

  it('generates missing keys and regenerates single team key', async () => {
    const registry = new TeamRegistry();
    const app = fastify();
    await app.register(createAdminRoutes({ config, registry }));

    const resMissing = await app.inject({
      method: 'POST',
      url: `/api/admin/keys/generate-missing?adminKey=${config.adminKey}`
    });
    expect(resMissing.statusCode).toBe(200);

    const resBad = await app.inject({
      method: 'POST',
      url: `/api/admin/keys/regenerate-team?adminKey=${config.adminKey}`,
      payload: {}
    });
    expect(resBad.statusCode).toBe(400);

    const resSingle = await app.inject({
      method: 'POST',
      url: `/api/admin/keys/regenerate-team?adminKey=${config.adminKey}`,
      payload: { teamId: 'madrid-steelers' }
    });
    expect(resSingle.statusCode).toBe(200);
  });

  it('regenerates all keys and triggers ESPN sync', async () => {
    const registry = new TeamRegistry();
    const app = fastify();
    await app.register(createAdminRoutes({ config, registry }));

    const resGen = await app.inject({
      method: 'POST',
      url: `/api/admin/keys/generate?adminKey=${config.adminKey}`
    });
    expect(resGen.statusCode).toBe(200);

    const resSync = await app.inject({
      method: 'POST',
      url: `/api/admin/espn/sync?adminKey=${config.adminKey}`
    });
    expect(resSync.statusCode).toBe(200);
  });
});
