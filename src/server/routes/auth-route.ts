import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { TeamRegistry, type AuthenticatedTeamInfo } from '../team-registry.js';

const defaultRegistry = new TeamRegistry();

export function findTeamByKey(key: string): AuthenticatedTeamInfo | null {
  return defaultRegistry.findTeamByKey(key);
}

export function createAuthRoutes(registry = defaultRegistry): FastifyPluginAsync {
  return async (app: FastifyInstance) => {
    app.post<{ Body: { key?: string } }>('/api/auth/login', async (request, reply) => {
      reply.header('Cache-Control', 'no-store');
      const { key } = request.body || {};
      if (!key || typeof key !== 'string') {
        return reply
          .status(400)
          .send({ valid: false, error: 'Falta la clave de equipo' });
      }
      const team = registry.findTeamByKey(key);
      if (!team) {
        return reply
          .status(401)
          .send({ valid: false, error: 'Clave de equipo incorrecta' });
      }
      return reply.status(200).send({
        valid: true,
        teamId: team.teamId,
        teamName: team.teamName,
        logoUrl: team.logoUrl
      });
    });
  };
}

export const authRoutes: FastifyPluginAsync = createAuthRoutes(defaultRegistry);
