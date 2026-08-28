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

export class EspnFantasyClient {
  async fetchTeams(_target?: string, _season = '2026'): Promise<readonly Team[]> {
    return defaultTeams as readonly Team[];
  }
}
