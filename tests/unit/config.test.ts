import { describe, it, expect } from 'vitest';
import { loadConfig, computeConfigFingerprint } from '../../src/config/load-config.js';
import {
  FixedClock,
  VALID_ENV_LOCAL,
  VALID_ENV_PROD
} from '../fixtures/draw-fixtures.js';

describe('Configuration validation (Task 02)', () => {
  const clock = new FixedClock(new Date('2026-08-24T12:00:00.000Z'));

  it('loads valid local configuration and resolves "now" via clock', () => {
    const config = loadConfig(VALID_ENV_LOCAL, clock);
    expect(config.env).toBe('local');
    expect(config.startAtUtc).toBe('2026-08-24T12:00:00.000Z');
    expect(config.resetOnStart).toBe(true);
    expect(config.teams).toHaveLength(16);
    expect(config.divisions).toHaveLength(4);
    expect(config.configFingerprint).toHaveLength(64);
  });

  it('loads valid production configuration with ISO 8601 offset', () => {
    const config = loadConfig(VALID_ENV_PROD, clock);
    expect(config.env).toBe('production');
    expect(config.startAtUtc).toBe('2026-09-01T18:00:00.000Z');
    expect(config.resetOnStart).toBe(false);
    expect(config.chat.useEmulators).toBe(false);
  });

  it('rejects "now" start time in production', () => {
    const invalid = { ...VALID_ENV_PROD, DRAW_START_AT: 'now' };
    expect(() => loadConfig(invalid, clock)).toThrow(/forbidden in production/);
  });

  it('rejects DRAW_RESET_ON_START=true in production', () => {
    const invalid = { ...VALID_ENV_PROD, DRAW_RESET_ON_START: 'true' };
    expect(() => loadConfig(invalid, clock)).toThrow(/cannot be true in production/);
  });

  it('rejects interval other than 120 in production', () => {
    const invalid = { ...VALID_ENV_PROD, DRAW_REVEAL_INTERVAL_SECONDS: '60' };
    expect(() => loadConfig(invalid, clock)).toThrow(/must be 120 in production/);
  });

  it('rejects invalid IANA timezone', () => {
    const invalid = { ...VALID_ENV_LOCAL, DRAW_TIMEZONE: 'Mars/Olympus' };
    expect(() => loadConfig(invalid, clock)).toThrow(/Invalid IANA timezone/);
  });

  it('rejects state path inside public roots', () => {
    const invalid = { ...VALID_ENV_LOCAL, DRAW_STATE_PATH: 'src/web/draw-state.json' };
    expect(() => loadConfig(invalid, clock)).toThrow(/inside public assets/);
  });

  it('rejects production using emulators', () => {
    const invalid = { ...VALID_ENV_PROD, VITE_FIREBASE_USE_EMULATORS: 'true' };
    expect(() => loadConfig(invalid, clock)).toThrow(/cannot be true in production/);
  });

  it('rejects invalid ISO timestamp', () => {
    const invalid = { ...VALID_ENV_LOCAL, DRAW_START_AT: 'invalid-date' };
    expect(() => loadConfig(invalid, clock)).toThrow(/Invalid ISO 8601/);
  });

  it('produces deterministic config fingerprint and changes on parameter modification', () => {
    const fp1 = computeConfigFingerprint(
      'nfl-spain-26-27',
      'NFL Spain',
      '26-27',
      'Europe/Madrid',
      '2026-08-24T12:00:00.000Z',
      120
    );
    const fp2 = computeConfigFingerprint(
      'nfl-spain-26-27',
      'NFL Spain',
      '26-27',
      'Europe/Madrid',
      '2026-08-24T12:00:00.000Z',
      120
    );
    const fp3 = computeConfigFingerprint(
      'nfl-spain-26-27',
      'NFL Spain',
      '26-27',
      'Europe/Madrid',
      '2026-08-24T13:00:00.000Z',
      120
    );
    expect(fp1).toBe(fp2);
    expect(fp1).not.toBe(fp3);
  });
});
