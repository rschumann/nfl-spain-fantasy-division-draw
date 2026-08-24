import { describe, it, expect } from 'vitest';
import fastify from 'fastify';
import { createTeamRoutes } from '../../src/server/routes/team-route.js';
import { TeamRegistry } from '../../src/server/team-registry.js';
import type { EspnFantasyClient } from '../../src/adapters/espn-client.js';

describe('Team Routes (GET /api/teams & POST /api/teams/sync)', () => {
  it('serves GET /api/teams with current registry teams', async () => {
    const registry = new TeamRegistry();
    const app = fastify();
    await app.register(createTeamRoutes({ registry }));

    const res = await app.inject({
      method: 'GET',
      url: '/api/teams'
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.teams).toHaveLength(16);
  });

  it('handles POST /api/teams/sync and returns updated teams', async () => {
    const mockClient = {
      fetchTeams: async () => [
        { id: 'madrid-steelers', name: 'Madrid Steelers Live' },
        { id: 'toledo-patriots', name: 'Toledo Patriots' },
        { id: 'la-osera', name: 'La Osera' },
        { id: 'london-viking', name: 'London Viking' },
        { id: 'nico', name: 'Nico' },
        { id: 'ohio-dolphins', name: 'Ohio Dolphins' },
        { id: 'camioneros', name: 'Camioneros' },
        { id: 'wolverines', name: 'Wolverines' },
        { id: 'barakaldo', name: 'Barakaldo' },
        { id: 'daniel', name: 'Daniel' },
        { id: 'samuel', name: 'Samuel' },
        { id: 'sant-boi-chargers', name: 'Sant Boi Chargers' },
        { id: 'bcn-giants', name: 'BCN Giants' },
        { id: 'juanito', name: 'Juanito' },
        { id: 'navarra-colts', name: 'Navarra Colts' },
        { id: 'xisko', name: 'Xisko' }
      ]
    } as unknown as EspnFantasyClient;

    const registry = new TeamRegistry(mockClient);
    const app = fastify();
    await app.register(createTeamRoutes({ registry }));

    const res = await app.inject({
      method: 'POST',
      url: '/api/teams/sync'
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.count).toBe(16);
    expect(body.teams[0].name).toBe('Madrid Steelers Live');
  });
});
