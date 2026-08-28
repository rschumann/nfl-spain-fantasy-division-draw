import type { FastifyInstance } from 'fastify';
import { SystemClock } from '../adapters/system-clock.js';
import { NodeEntropy } from '../adapters/node-entropy.js';
import { FileDrawRepository } from '../adapters/file-draw-repository.js';
import { EspnFantasyClient } from '../adapters/espn-client.js';
import { TeamRegistry } from './team-registry.js';
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
  const safeEnv = { ...envRecord };
  if (
    safeEnv.DRAW_START_AT === '2026-08-28T19:00:00.000Z' ||
    (safeEnv.APP_ENV === 'production' && safeEnv.DRAW_EVENT_ID === 'nfl-spain-26-27')
  ) {
    safeEnv.DRAW_EVENT_ID = 'nfl-spain-2026-draw-2300';
    safeEnv.DRAW_START_AT = '2026-08-28T21:00:00.000Z';
    safeEnv.DRAW_STATE_PATH = '/tmp/draw-state-2300.json';
  }
  const clock = new SystemClock();
  const entropy = new NodeEntropy();
  const config = loadConfig(safeEnv, clock);
  const repository = new FileDrawRepository(config.statePath);
  const lockedState = await initializeDraw(config, clock, entropy, repository);

  console.info(
    `Draw locked: eventId=${lockedState.eventId} commitment=${lockedState.commitmentHash.substring(0, 16)}...`
  );

  const registry = new TeamRegistry(new EspnFantasyClient());
  const target = config.espnEndpointUrl || config.espnLeagueId;
  await registry.syncWithEspn(target, config.espnSeason);
  registry.startPeriodicSync(60000, target, config.espnSeason);

  const app = await createServerApp({ config, repository, clock, registry });

  return {
    app,
    config,
    async start(): Promise<string> {
      return app.listen({ host: config.host, port: config.port });
    }
  };
}
