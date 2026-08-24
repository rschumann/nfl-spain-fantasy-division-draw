import type { FastifyPluginAsync } from 'fastify';
import type { AppConfig } from '../../config/load-config.js';
import type { Clock, DrawRepository } from '../../application/ports.js';
import { getPublicDrawState } from '../../application/get-public-draw.js';

export interface DrawRouteOptions {
  config: AppConfig;
  repository: DrawRepository;
  clock: Clock;
}

export const drawRoute: FastifyPluginAsync<DrawRouteOptions> = async (fastify, opts) => {
  fastify.get('/api/draw', async (_request, reply) => {
    reply.header(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );
    reply.header('Pragma', 'no-cache');
    reply.header('Expires', '0');
    return getPublicDrawState(opts.config, opts.repository, opts.clock);
  });
};
