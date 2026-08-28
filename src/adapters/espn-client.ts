import type { Team } from '../domain/types.js';
import defaultTeams from '../../config/teams.json' with { type: 'json' };

export const ESPN_ID_TO_TEAM_ID: Record<number, string> = {
  1: 'madrid-steelers',
  3: 'barakaldo',
  4: 'bcn-giants',
  5: 'toledo-patriots',
  6: 'ohio-dolphins',
  7: 'daniel',
  9: 'la-osera',
  10: 'camioneros',
  11: 'samuel',
  12: 'navarra-colts',
  13: 'team-13',
  14: 'team-14',
  15: 'team-15',
  16: 'team-16',
  17: 'team-17',
  18: 'team-18'
};

interface RawEspnTeam {
  id: number;
  name?: string;
  location?: string;
  nickname?: string;
  logo?: string;
  primaryOwner?: string;
}

interface RawEspnResponse {
  teams?: RawEspnTeam[];
}

function resolveName(team: RawEspnTeam, fallback: string): string {
  if (team.name && team.name.trim()) return team.name.trim();
  const locNick = `${team.location || ''} ${team.nickname || ''}`.trim();
  return locNick || fallback;
}

function buildUrl(target?: string, season = '2026'): string {
  if (target && target.startsWith('http')) return target;
  const leagueId = target || '763332624';
  return `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/${leagueId}?view=mTeam&view=mSettings&view=mInvited`;
}

export class EspnFantasyClient {
  private readonly defaultMap = new Map(defaultTeams.map((t) => [t.id, t.name]));

  async fetchTeams(target?: string, season = '2026'): Promise<readonly Team[]> {
    const url = buildUrl(target, season);
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(6000)
      });
      if (!res.ok) return defaultTeams as readonly Team[];
      const data = (await res.json()) as RawEspnResponse;
      if (!data.teams || !Array.isArray(data.teams))
        return defaultTeams as readonly Team[];
      return this.mapEspnTeams(data.teams);
    } catch {
      return defaultTeams as readonly Team[];
    }
  }

  private mapEspnTeams(rawTeams: RawEspnTeam[]): readonly Team[] {
    const sorted = [...rawTeams].sort((a, b) => a.id - b.id);
    const results: Team[] = [];
    for (const raw of sorted) {
      const canonicalId = ESPN_ID_TO_TEAM_ID[raw.id] || `team-${raw.id}`;
      const fallbackName = this.defaultMap.get(canonicalId) || `Team ${raw.id}`;
      const name = resolveName(raw, fallbackName);
      const logoUrl = raw.logo || undefined;
      const isPending = !raw.primaryOwner;
      results.push({ id: canonicalId, name, logoUrl, isPending });
    }
    return results.length === 16 ? results : (defaultTeams as readonly Team[]);
  }
}
