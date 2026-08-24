import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { bootstrap } from '../../src/server/bootstrap.js';
import { VALID_ENV_LOCAL } from '../fixtures/draw-fixtures.js';
import { join } from 'node:path';
import { mkdirSync, rmSync, existsSync } from 'node:fs';

describe('Server Bootstrap Integration (Task 05)', () => {
  const testDir = join(process.cwd(), '.data-test-boot');
  const testFilePath = join(testDir, 'draw-state.json');

  beforeEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true, force: true });
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true, force: true });
  });

  it('successfully bootstraps server and initializes draw', async () => {
    const env = { ...VALID_ENV_LOCAL, DRAW_STATE_PATH: testFilePath, PORT: '3099' };
    const server = await bootstrap(env);
    expect(server.app).toBeDefined();
    expect(server.config.eventId).toBe('nfl-spain-26-27');
  });
});
