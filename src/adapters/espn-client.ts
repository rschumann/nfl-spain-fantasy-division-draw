import type { Team } from '../domain/types.js';
import defaultTeams from '../../config/teams.json' with { type: 'json' };

export const ESPN_ID_TO_TEAM_ID: Record<number, string> = {
  1: 'madrid-steelers',
  2: 'nico',
  3: 'barakaldo',
  4: 'bcn-giants',
  5: 'toledo-patriots',
  6: 'ohio-dolphins',
  7: 'daniel',
  8: 'juanito',
  9: 'la-osera',
  10: 'camioneros',
  11: 'samuel',
  12: 'navarra-colts',
  13: 'london-viking',
  14: 'wolverines',
  15: 'sant-boi-chargers',
  16: 'xisko'
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
    const results: Team[] = [];
    const espnMap = new Map(rawTeams.map((t) => [t.id, t]));

    for (let i = 1; i <= 16; i++) {
      const canonicalId = ESPN_ID_TO_TEAM_ID[i];
      if (!canonicalId) continue;
      const fallbackName = this.defaultMap.get(canonicalId) || canonicalId;
      const raw = espnMap.get(i);
      const name = raw ? resolveName(raw, fallbackName) : fallbackName;
      const logoUrl = raw?.logo || undefined;
      results.push({ id: canonicalId, name, logoUrl });
    }
    return results;
  }
}
