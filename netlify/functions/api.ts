import 'dotenv/config';
import type { Handler, HandlerEvent } from '@netlify/functions';
import type { FastifyInstance } from 'fastify';
import { bootstrap } from '../../src/server/bootstrap.js';

const defaultEnv: Record<string, string> = {
  APP_ENV: 'production',
  DRAW_EVENT_ID: 'nfl-spain-26-27-final',
  LEAGUE_NAME: 'NFL Spain',
  SEASON_LABEL: '26-27',
  DRAW_TIMEZONE: 'Europe/Madrid',
  DRAW_START_AT: '2026-08-28T21:00:00.000Z',
  DRAW_REVEAL_INTERVAL_SECONDS: '120',
  DRAW_RESET_ON_START: 'false',
  DIVISIONS_COUNT: '4',
  ADMIN_KEY: 'admin-secret-key-998877',
  DRAW_STATE_PATH: '/tmp/draw-state-final.json',
  VITE_FIREBASE_USE_EMULATORS: 'false'
};

async function getFastifyApp(): Promise<FastifyInstance> {
  const envMap = {
    ...process.env,
    ...defaultEnv,
    APP_ENV: 'production',
    DRAW_EVENT_ID: 'nfl-spain-26-27-final',
    DRAW_START_AT: '2026-08-28T21:00:00.000Z',
    DRAW_REVEAL_INTERVAL_SECONDS: '120',
    DRAW_STATE_PATH: '/tmp/draw-state-final.json'
  };
  const { app } = await bootstrap(envMap);
  await app.ready();
  return app;
}

function buildInjectUrl(event: HandlerEvent): string {
  let path = event.path;
  const forwarded =
    (event.headers && event.headers['x-forwarded-uri']) ||
    (event.headers && event.headers['x-original-uri']);
  if (forwarded && typeof forwarded === 'string' && forwarded.startsWith('/api')) {
    path = forwarded;
  } else if (path.startsWith('/.netlify/functions/api')) {
    const sub = path.replace(/^\/\.netlify\/functions\/api/, '');
    path = sub.startsWith('/') ? `/api${sub}` : `/api/${sub}`;
  }
  if (!event.queryStringParameters) return path;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(event.queryStringParameters)) {
    if (v !== undefined) params.append(k, v);
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export const handler: Handler = async (event) => {
  try {
    const app = await getFastifyApp();
    const url = buildInjectUrl(event);
    const method = (event.httpMethod || 'GET') as
      'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD';
    const response = await app.inject({
      method,
      url,
      headers: event.headers as Record<string, string>,
      payload: event.body || undefined
    });
    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(response.headers)) {
      if (typeof v === 'string') headers[k] = v;
    }
    return {
      statusCode: response.statusCode,
      headers,
      body: response.body
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err instanceof Error ? err.message : 'Internal Server Error'
      })
    };
  }
};
