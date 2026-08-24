import { describe, it, expect } from 'vitest';
import { handler } from '../../netlify/functions/api.js';
import type { HandlerEvent, HandlerContext } from '@netlify/functions';

describe('Netlify Functions API Gateway Handler', () => {
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
