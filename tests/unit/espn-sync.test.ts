import { describe, it, expect, vi } from 'vitest';
import { EspnFantasyClient } from '../../src/adapters/espn-client.js';
import { TeamRegistry } from '../../src/server/team-registry.js';

describe('ESPN Fantasy Live Sync & Team Registry', () => {
  it('maps ESPN API response with custom team names and logos', async () => {
    const mockResponse = {
      teams: [
        {
          id: 1,
          name: 'Madrid Steelers Custom',
          logo: 'https://g.espncdn.com/logo1.svg',
          primaryOwner: 'owner-1'
        },
        { id: 2, location: 'Nico', nickname: 'Dynasty' },
        { id: 9, name: 'La Osera Champions', primaryOwner: 'owner-9' }
      ]
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    } as unknown as Response);

    const client = new EspnFantasyClient();
    const teams = await client.fetchTeams('763332624', '2026');

    expect(teams).toHaveLength(16);
    const team1 = teams.find((t) => t.id === 'madrid-steelers');
    expect(team1?.name).toBe('Madrid Steelers Custom');
    expect(team1?.logoUrl).toBe('https://g.espncdn.com/logo1.svg');
    expect(team1?.isPending).toBe(false);

    const team2 = teams.find((t) => t.id === 'nico');
    expect(team2?.name).toBe('Nico Dynasty');
    expect(team2?.isPending).toBe(true);

    fetchSpy.mockRestore();
  });

  it('handles response not ok and missing teams payload gracefully', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy.mockResolvedValueOnce({ ok: false } as Response);
    const client = new EspnFantasyClient();
    const t1 = await client.fetchTeams();
    expect(t1).toHaveLength(16);

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    } as Response);
    const t2 = await client.fetchTeams();
    expect(t2).toHaveLength(16);
    fetchSpy.mockRestore();
  });

  it('updates TeamRegistry and handles activeOnly key generation', async () => {
    const registry = new TeamRegistry();
    const keys = registry.generateAndSaveKeys('http://127.0.0.1:3000', undefined, false);
    expect(keys).toHaveLength(16);

    const authNull = registry.findTeamByKey('pendiente-invitacion');
    expect(authNull).toBeNull();

    registry.startPeriodicSync(100000);
    registry.stop();
  });
});
