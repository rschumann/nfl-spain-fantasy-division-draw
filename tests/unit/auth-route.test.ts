import { describe, it, expect } from 'vitest';
import fastify from 'fastify';
import { authRoutes, findTeamByKey } from '../../src/server/routes/auth-route.js';

describe('Auth Route and Team Keys', () => {
  it('finds authentic team by exact key', () => {
    const team = findTeamByKey('steelers-7821');
    expect(team).not.toBeNull();
    expect(team?.teamId).toBe('madrid-steelers');
    expect(team?.teamName).toBe('Madrid Steelers');
  });

  it('returns null for unknown or empty key', () => {
    expect(findTeamByKey('')).toBeNull();
    expect(findTeamByKey('invalid-key')).toBeNull();
  });

  it('authenticates valid team key via POST /api/auth/login', async () => {
    const app = fastify();
    await app.register(authRoutes);

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { key: 'patriots-4912' }
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.valid).toBe(true);
    expect(body.teamId).toBe('toledo-patriots');
  });

  it('rejects invalid or missing team key with 401/400', async () => {
    const app = fastify();
    await app.register(authRoutes);

    const invalidRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { key: 'wrong' }
    });
    expect(invalidRes.statusCode).toBe(401);

    const emptyRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {}
    });
    expect(emptyRes.statusCode).toBe(400);
  });
});
