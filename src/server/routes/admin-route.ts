import { resolve } from 'node:path';
import type {
  FastifyPluginAsync,
  FastifyRequest,
  FastifyReply,
  FastifyInstance
} from 'fastify';
import type { AppConfig } from '../../config/load-config.js';
import type { TeamRegistry } from '../team-registry.js';

export interface AdminRoutesOptions {
  config: AppConfig;
  registry: TeamRegistry;
}

function verifyAdminAuth(
  req: FastifyRequest,
  expectedKey: string,
  reply: FastifyReply
): boolean {
  const queryKey = (req.query as { adminKey?: string })?.adminKey;
  const headerKey = req.headers['x-admin-key'] as string | undefined;
  const provided = queryKey || headerKey;
  if (!provided || provided !== expectedKey) {
    reply.status(401).send({ error: 'Clave de administrador incorrecta' });
    return false;
  }
  return true;
}

function getKeysPath(env: string): string | undefined {
  const isTest =
    env === 'test' ||
    process.env.NODE_ENV === 'test' ||
    typeof process.env.VITEST !== 'undefined';
  return isTest ? undefined : resolve(process.cwd(), 'config/team-keys.json');
}

function buildConfigSummary(config: AppConfig) {
  return {
    leagueName: config.leagueName,
    seasonLabel: config.seasonLabel,
    timezone: config.timezone,
    startAtUtc: config.startAtUtc,
    revealIntervalSeconds: config.revealIntervalSeconds,
    divisionsCount: config.divisions.length,
    divisions: config.divisions,
    baseUrl: config.baseUrl,
    espnEndpointUrl: config.espnEndpointUrl,
    espnLeagueId: config.espnLeagueId,
    espnSeason: config.espnSeason
  };
}

function registerKeyGenerators(app: FastifyInstance, opts: AdminRoutesOptions): void {
  app.post('/api/admin/keys/generate-missing', async (req, reply) => {
    reply.header('Cache-Control', 'no-store');
    if (!verifyAdminAuth(req, opts.config.adminKey, reply)) return;
    const keys = opts.registry.generateMissingKeys(
      opts.config.baseUrl,
      getKeysPath(opts.config.env)
    );
    return { success: true, count: keys.length, keys };
  });

  app.post<{ Body: { teamId?: string } }>(
    '/api/admin/keys/regenerate-team',
    async (req, reply) => {
      reply.header('Cache-Control', 'no-store');
      if (!verifyAdminAuth(req, opts.config.adminKey, reply)) return;
      const { teamId } = req.body || {};
      if (!teamId) return reply.status(400).send({ error: 'teamId requerido' });
      const keys = opts.registry.generateKeyForTeam(
        teamId,
        opts.config.baseUrl,
        getKeysPath(opts.config.env)
      );
      return { success: true, keys };
    }
  );
}

function registerOtherActions(app: FastifyInstance, opts: AdminRoutesOptions): void {
  app.post('/api/admin/keys/generate', async (req, reply) => {
    reply.header('Cache-Control', 'no-store');
    if (!verifyAdminAuth(req, opts.config.adminKey, reply)) return;
    const keys = opts.registry.generateAndSaveKeys(
      opts.config.baseUrl,
      getKeysPath(opts.config.env),
      true
    );
    return { success: true, count: keys.length, keys };
  });

  app.post('/api/admin/espn/sync', async (req, reply) => {
    reply.header('Cache-Control', 'no-store');
    if (!verifyAdminAuth(req, opts.config.adminKey, reply)) return;
    const target = opts.config.espnEndpointUrl || opts.config.espnLeagueId;
    const teams = await opts.registry.syncWithEspn(target, opts.config.espnSeason);
    return { success: true, count: teams.length, teams };
  });
}

export function createAdminRoutes(opts: AdminRoutesOptions): FastifyPluginAsync {
  return async (app) => {
    app.get('/api/admin/dashboard', async (req, reply) => {
      reply.header('Cache-Control', 'no-store');
      if (!verifyAdminAuth(req, opts.config.adminKey, reply)) return;
      return {
        config: buildConfigSummary(opts.config),
        keys: opts.registry.getAllTeamKeys(opts.config.baseUrl),
        teams: opts.registry.getTeams()
      };
    });
    registerKeyGenerators(app, opts);
    registerOtherActions(app, opts);
  };
}
