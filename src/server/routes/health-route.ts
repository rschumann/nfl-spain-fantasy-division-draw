import type { FastifyPluginAsync } from 'fastify';
import type { AppConfig } from '../../config/load-config.js';
import type { DrawRepository } from '../../application/ports.js';

export interface HealthRouteOptions {
  config: AppConfig;
  repository: DrawRepository;
}

export const healthRoute: FastifyPluginAsync<HealthRouteOptions> = async (
  fastify,
  opts
) => {
  fastify.get('/api/health', async (_request, reply) => {
    reply.header(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );
    const state = await opts.repository.loadLockedDraw(opts.config.eventId);
    return {
      status: 'ok',
      eventId: opts.config.eventId,
      ready: state !== null
    };
  });
};
