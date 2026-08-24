import type { FastifyInstance } from 'fastify';
import { SystemClock } from '../adapters/system-clock.js';
import { NodeEntropy } from '../adapters/node-entropy.js';
import { FileDrawRepository } from '../adapters/file-draw-repository.js';
import { loadConfig, type AppConfig } from '../config/load-config.js';
import { initializeDraw } from '../application/initialize-draw.js';
import { createServerApp } from './app.js';

export interface BootstrapResult {
  readonly app: FastifyInstance;
  readonly config: AppConfig;
  start(): Promise<string>;
}

export async function bootstrap(
  envRecord: Record<string, unknown> = process.env
): Promise<BootstrapResult> {
  const clock = new SystemClock();
  const entropy = new NodeEntropy();
  const config = loadConfig(envRecord, clock);
  const repository = new FileDrawRepository(config.statePath);
  const lockedState = await initializeDraw(config, clock, entropy, repository);

  console.info(
    `Draw locked: eventId=${lockedState.eventId} commitment=${lockedState.commitmentHash.substring(0, 16)}...`
  );

  const app = await createServerApp({ config, repository, clock });

  return {
    app,
    config,
    async start(): Promise<string> {
      return app.listen({ host: config.host, port: config.port });
    }
  };
}
