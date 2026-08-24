import { writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import type { Team } from '../domain/types.js';
import defaultTeams from '../../config/teams.json' with { type: 'json' };
import teamKeysData from '../../config/team-keys.json' with { type: 'json' };
import type { EspnFantasyClient } from '../adapters/espn-client.js';

export interface AuthenticatedTeamInfo {
  readonly teamId: string;
  readonly teamName: string;
  readonly key: string;
  readonly logoUrl?: string;
  readonly isPending?: boolean;
}

export interface TeamKeyDetails {
  readonly teamId: string;
  readonly teamName: string;
  readonly key: string;
  readonly url: string;
  readonly logoUrl?: string;
  readonly isPending?: boolean;
}

export class TeamRegistry {
  private teams: readonly Team[] = defaultTeams as readonly Team[];
  private keys: Array<{ teamId: string; teamName: string; key: string }> = [
    ...teamKeysData
  ];
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
    if (!trimmed || trimmed === 'pendiente-invitacion') return null;
    const entry = this.keys.find((k) => k.key === trimmed);
    if (!entry) return null;
    const liveTeam = this.getTeam(entry.teamId);
    return {
      teamId: entry.teamId,
      teamName: liveTeam ? liveTeam.name : entry.teamName,
      key: entry.key,
      logoUrl: liveTeam?.logoUrl,
      isPending: liveTeam?.isPending
    };
  }

  getAllTeamKeys(baseUrl = 'http://127.0.0.1:3000'): readonly TeamKeyDetails[] {
    return this.keys.map((k) => {
      const liveTeam = this.getTeam(k.teamId);
      return {
        teamId: k.teamId,
        teamName: liveTeam ? liveTeam.name : k.teamName,
        key: k.key,
        url: `${baseUrl}/?key=${k.key}`,
        logoUrl: liveTeam?.logoUrl,
        isPending: liveTeam?.isPending
      };
    });
  }

  generateAndSaveKeys(
    baseUrl = 'http://127.0.0.1:3000',
    keysPath?: string,
    activeOnly = true
  ): readonly TeamKeyDetails[] {
    this.keys = this.teams.map((t) => {
      if (activeOnly && t.isPending) {
        return { teamId: t.id, teamName: t.name, key: 'pendiente-invitacion' };
      }
      const prefix = t.id.split('-')[0] || 'team';
      const rand = randomBytes(2).toString('hex');
      return { teamId: t.id, teamName: t.name, key: `${prefix}-${rand}` };
    });
    if (keysPath) {
      try {
        writeFileSync(keysPath, JSON.stringify(this.keys, null, 2), 'utf8');
      } catch {
        // Non-fatal if read-only
      }
    }
    return this.getAllTeamKeys(baseUrl);
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
