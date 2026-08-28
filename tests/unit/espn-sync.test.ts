import { describe, it, expect, vi } from 'vitest';
import { EspnFantasyClient } from '../../src/adapters/espn-client.js';
import { TeamRegistry } from '../../src/server/team-registry.js';

describe('ESPN Fantasy Live Sync & Team Registry', () => {
  it('maps ESPN API response with custom team names and logos', async () => {
    const mockTeams = [
      { id: 1, name: 'Madrid Steelers Custom', logo: 'https://g.espncdn.com/logo1.svg', primaryOwner: 'owner-1' },
      { id: 3, location: 'Barakaldo', nickname: 'Dynasty' },
      { id: 4, name: 'BCN Giants', primaryOwner: 'owner-4' },
      { id: 5, name: 'Toledo Patriots', primaryOwner: 'owner-5' },
      { id: 6, name: 'Ohio Dolphins', primaryOwner: 'owner-6' },
      { id: 7, name: 'Daniel', primaryOwner: 'owner-7' },
      { id: 9, name: 'La Osera Champions', primaryOwner: 'owner-9' },
      { id: 10, name: 'Camioneros', primaryOwner: 'owner-10' },
      { id: 11, name: 'Samuel', primaryOwner: 'owner-11' },
      { id: 12, name: 'Navarra Colts', primaryOwner: 'owner-12' },
      { id: 13, name: 'Team 13' },
      { id: 14, name: 'Team 14' },
      { id: 15, name: 'Team 15' },
      { id: 16, name: 'Team 16' },
      { id: 17, name: 'Team 17' },
      { id: 18, name: 'Team 18' }
    ];

    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ teams: mockTeams })
    } as unknown as Response);

    const client = new EspnFantasyClient();
    const teams = await client.fetchTeams('763332624', '2026');

    expect(teams).toHaveLength(16);
    const team1 = teams.find((t) => t.id === 'madrid-steelers');
    expect(team1?.name).toBe('Madrid Steelers Custom');
    expect(team1?.logoUrl).toBe('https://g.espncdn.com/logo1.svg');
    expect(team1?.isPending).toBe(false);

    const team3 = teams.find((t) => t.id === 'barakaldo');
    expect(team3?.name).toBe('Barakaldo Dynasty');
    expect(team3?.isPending).toBe(true);

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

  it('updates TeamRegistry and handles activeOnly and pending key generation', async () => {
    const mockClient = {
      fetchTeams: async () => {
        throw new Error('Sync fail');
      }
    } as unknown as EspnFantasyClient;

    const registry = new TeamRegistry(mockClient);
    await registry.syncWithEspn('763332624', '2026');

    const keysActiveOnly = registry.generateAndSaveKeys(
      'http://127.0.0.1:3000',
      undefined,
      true
    );
    expect(keysActiveOnly).toHaveLength(16);

    const keysAll = registry.generateAndSaveKeys(
      'http://127.0.0.1:3000',
      undefined,
      false
    );
    expect(keysAll).toHaveLength(16);

    const missing = registry.generateMissingKeys('http://127.0.0.1:3000');
    expect(missing).toHaveLength(16);

    const nonExistent = registry.generateKeyForTeam('non-existent');
    expect(nonExistent).toHaveLength(16);

    const authNull = registry.findTeamByKey('pendiente-invitacion');
    expect(authNull).toBeNull();

    expect(registry.findTeamByKey('   ')).toBeNull();

    registry.startPeriodicSync(100000);
    registry.stop();
  });
});
