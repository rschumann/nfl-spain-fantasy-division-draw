import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, unlinkSync } from 'node:fs';
import { handler } from '../../src/server/netlify-handler.js';
import type { HandlerEvent, HandlerContext } from '@netlify/functions';

describe('Netlify Functions API Gateway Handler', () => {
  beforeAll(() => {
    const staleTmp = '/tmp/draw-state.json';
    if (existsSync(staleTmp)) {
      try {
        unlinkSync(staleTmp);
      } catch {
        // ignore
      }
    }
  });

  it('serves GET /api/health through handler', async () => {
    const event = {
      path: '/api/health',
      httpMethod: 'GET',
      headers: {},
      queryStringParameters: null,
      body: null
    } as unknown as HandlerEvent;

    const res = await handler(event, {} as HandlerContext, () => {});
    expect(res).toBeDefined();
    if (res && typeof res !== 'string') {
      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res.body || '{}');
      expect(data.status).toBe('ok');
    }
  });

  it('handles query parameters and error responses gracefully', async () => {
    const event = {
      path: '/api/chat/messages',
      httpMethod: 'GET',
      headers: {},
      queryStringParameters: { key: 'steelers-7821' },
      body: null
    } as unknown as HandlerEvent;

    const res = await handler(event, {} as HandlerContext, () => {});
    expect(res).toBeDefined();
    if (res && typeof res !== 'string') {
      expect(res.statusCode).toBe(200);
    }
  });
});
