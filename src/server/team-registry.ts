import type { Team } from '../domain/types.js';
import defaultTeams from '../../config/teams.json' with { type: 'json' };
import teamKeysData from '../../config/team-keys.json' with { type: 'json' };
import type { EspnFantasyClient } from '../adapters/espn-client.js';

export interface AuthenticatedTeamInfo {
  readonly teamId: string;
  readonly teamName: string;
  readonly key: string;
  readonly logoUrl?: string;
}

export class TeamRegistry {
  private teams: readonly Team[] = defaultTeams as readonly Team[];
  private timer: NodeJS.Timeout | null = null;

  constructor(private readonly espnClient?: EspnFantasyClient) {}

  getTeams(): readonly Team[] {
    return this.teams;
  }

  getTeam(id: string): Team | undefined {
    return this.teams.find((t) => t.id === id);
  }

  findTeamByKey(key: string): AuthenticatedTeamInfo | null {
    const trimmed = key.trim();
    if (!trimmed) return null;
    const entry = teamKeysData.find((k) => k.key === trimmed);
    if (!entry) return null;
    const liveTeam = this.getTeam(entry.teamId);
    return {
      teamId: entry.teamId,
      teamName: liveTeam ? liveTeam.name : entry.teamName,
      key: entry.key,
      logoUrl: liveTeam?.logoUrl
    };
  }

  async syncWithEspn(target?: string, season = '2026'): Promise<readonly Team[]> {
    if (!this.espnClient) return this.teams;
    try {
      const fresh = await this.espnClient.fetchTeams(target, season);
      if (fresh.length === 16) {
        this.teams = fresh;
      }
    } catch {
      // Keep existing teams on sync error
    }
    return this.teams;
  }

  startPeriodicSync(intervalMs = 60000, target?: string, season = '2026'): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      void this.syncWithEspn(target, season);
    }, intervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
