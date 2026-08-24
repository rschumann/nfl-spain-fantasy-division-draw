import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import teamKeysData from '../../../config/team-keys.json' with { type: 'json' };

interface TeamKeyEntry {
  readonly teamId: string;
  readonly teamName: string;
  readonly key: string;
}

const teamKeys: readonly TeamKeyEntry[] = teamKeysData;

export function findTeamByKey(key: string): TeamKeyEntry | null {
  const trimmed = key.trim();
  if (!trimmed) return null;
  return teamKeys.find((entry) => entry.key === trimmed) ?? null;
}

export const authRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post<{ Body: { key?: string } }>('/api/auth/login', async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    const { key } = request.body || {};
    if (!key || typeof key !== 'string') {
      return reply.status(400).send({ valid: false, error: 'Falta la clave de equipo' });
    }
    const team = findTeamByKey(key);
    if (!team) {
      return reply
        .status(401)
        .send({ valid: false, error: 'Clave de equipo incorrecta' });
    }
    return reply.status(200).send({
      valid: true,
      teamId: team.teamId,
      teamName: team.teamName
    });
  });
};
