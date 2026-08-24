import type { FastifyPluginAsync } from 'fastify';
import type { TeamRegistry } from '../team-registry.js';

export interface TeamRoutesOptions {
  registry: TeamRegistry;
  leagueId?: string;
  season?: string;
}

export function createTeamRoutes(opts: TeamRoutesOptions): FastifyPluginAsync {
  return async (app) => {
    app.get('/api/teams', async (_req, reply) => {
      reply.header('Cache-Control', 'no-store');
      return {
        teams: opts.registry.getTeams()
      };
    });

    app.post('/api/teams/sync', async (_req, reply) => {
      reply.header('Cache-Control', 'no-store');
      const teams = await opts.registry.syncWithEspn(opts.leagueId, opts.season);
      return {
        success: true,
        count: teams.length,
        teams
      };
    });
  };
}
