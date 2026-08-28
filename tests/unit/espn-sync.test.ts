import { describe, it, expect } from 'vitest';
import { EspnFantasyClient } from '../../src/adapters/espn-client.js';
import { TeamRegistry } from '../../src/server/team-registry.js';

describe('ESPN Fantasy Live Sync & Team Registry', () => {
  it('returns verified static teams with logos and pending flags', async () => {
    const client = new EspnFantasyClient();
    const teams = await client.fetchTeams('763332624', '2026');

    expect(teams).toHaveLength(16);
    const team1 = teams.find((t) => t.id === 'madrid-steelers');
    expect(team1?.name).toBe('Madrid Steelers');
    expect(team1?.logoUrl).toBeDefined();
    expect(team1?.isPending).toBe(false);

    const team13 = teams.find((t) => t.id === 'team-13');
    expect(team13?.name).toBe('Team 13');
    expect(team13?.isPending).toBe(true);
  });

  it('handles empty parameters gracefully', async () => {
    const client = new EspnFantasyClient();
    const t1 = await client.fetchTeams();
    expect(t1).toHaveLength(16);
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
