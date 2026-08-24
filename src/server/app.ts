import fastify, { type FastifyInstance } from 'fastify';
import fastifyHelmet from '@fastify/helmet';
import fastifyStatic from '@fastify/static';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { AppConfig } from '../config/load-config.js';
import type { Clock, DrawRepository } from '../application/ports.js';
import { drawRoute } from './routes/draw-route.js';
import { healthRoute } from './routes/health-route.js';
import { authRoutes } from './routes/auth-route.js';
import { createChatRoutes } from './routes/chat-route.js';
import { ChatStore } from './chat-store.js';

export interface ServerDependencies {
  readonly config: AppConfig;
  readonly repository: DrawRepository;
  readonly clock: Clock;
  readonly chatStore?: ChatStore;
}

async function registerSecurityHeaders(app: FastifyInstance): Promise<void> {
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://www.gstatic.com',
          'https://*.firebaseio.com'
        ],
        connectSrc: [
          "'self'",
          'ws:',
          'http://127.0.0.1:*',
          'http://localhost:*',
          'https://*.googleapis.com',
          'https://*.firebaseio.com'
        ],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        frameSrc: ["'self'"]
      }
    }
  });
}

function registerStaticAssets(app: FastifyInstance): void {
  const distPath = resolve(process.cwd(), 'dist');
  if (existsSync(distPath)) {
    app.register(fastifyStatic, {
      root: distPath,
      prefix: '/'
    });
  }
}

function setupErrorHandlers(app: FastifyInstance): void {
  app.setNotFoundHandler(async (_req, reply) => {
    reply.header('Cache-Control', 'no-store');
    return reply.status(404).send({ error: 'Not Found' });
  });
  app.setErrorHandler(async (err: Error, _req, reply) => {
    app.log.error({ msg: 'Server error', errName: err?.name, errMsg: err?.message });
    reply.header('Cache-Control', 'no-store');
    return reply.status(500).send({ error: 'Internal Server Error' });
  });
}

export async function createServerApp(
  deps: ServerDependencies
): Promise<FastifyInstance> {
  const app = fastify({ logger: false });
  const store = deps.chatStore ?? new ChatStore();
  await registerSecurityHeaders(app);
  registerStaticAssets(app);
  await app.register(drawRoute, deps);
  await app.register(healthRoute, deps);
  await app.register(authRoutes);
  await app.register(createChatRoutes(store));
  setupErrorHandlers(app);
  return app;
}
