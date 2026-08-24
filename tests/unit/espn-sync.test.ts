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
          logo: 'https://g.espncdn.com/logo1.svg'
        },
        { id: 2, location: 'Nico', nickname: 'Dynasty' },
        { id: 9, name: 'La Osera Champions' }
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

    const team2 = teams.find((t) => t.id === 'nico');
    expect(team2?.name).toBe('Nico Dynasty');

    const team9 = teams.find((t) => t.id === 'la-osera');
    expect(team9?.name).toBe('La Osera Champions');

    fetchSpy.mockRestore();
  });

  it('falls back gracefully on network or API failure', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy.mockRejectedValueOnce(new Error('Network error'));

    const client = new EspnFantasyClient();
    const teams = await client.fetchTeams('763332624', '2026');

    expect(teams).toHaveLength(16);
    const team1 = teams.find((t) => t.id === 'madrid-steelers');
    expect(team1?.name).toBe('Madrid Steelers');

    fetchSpy.mockRestore();
  });

  it('updates TeamRegistry and authentication key lookups dynamically', async () => {
    const mockClient = {
      fetchTeams: async () => [
        {
          id: 'madrid-steelers',
          name: 'Madrid SuperSteelers',
          logoUrl: 'https://logo.svg'
        },
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
    await registry.syncWithEspn('763332624', '2026');

    const auth = registry.findTeamByKey('steelers-7821');
    expect(auth?.teamName).toBe('Madrid SuperSteelers');
    expect(auth?.logoUrl).toBe('https://logo.svg');

    registry.stop();
  });
});
