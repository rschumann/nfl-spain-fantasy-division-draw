import { describe, it, expect } from 'vitest';
import {
  computeTimeOffsetMs,
  computeSecondsRemaining,
  formatCountdown,
  formatMinutesSeconds
} from '../../src/web/server-time.js';

describe('Server Time & Countdown Formatting (Task 06)', () => {
  it('computes offset between server time and client time', () => {
    const serverNow = '2026-08-24T12:00:05.000Z';
    const clientNow = new Date('2026-08-24T12:00:00.000Z').getTime();
    const offset = computeTimeOffsetMs(serverNow, clientNow);
    expect(offset).toBe(5000);
  });

  it('handles invalid server date gracefully', () => {
    expect(computeTimeOffsetMs('invalid-date', 1000)).toBe(0);
    expect(computeSecondsRemaining(null, 0)).toBe(0);
    expect(computeSecondsRemaining('invalid', 0)).toBe(0);
  });

  it('calculates remaining seconds until target timestamp', () => {
    const target = '2026-08-24T12:02:00.000Z';
    const clientNow = new Date('2026-08-24T12:00:00.000Z').getTime();
    const offset = 0;
    const remaining = computeSecondsRemaining(target, offset, clientNow);
    expect(remaining).toBe(120);
  });

  it('clamps remaining seconds to 0 when past target', () => {
    const target = '2026-08-24T12:00:00.000Z';
    const clientNow = new Date('2026-08-24T12:05:00.000Z').getTime();
    const remaining = computeSecondsRemaining(target, 0, clientNow);
    expect(remaining).toBe(0);
  });

  it('formats MM:SS, HH:MM:SS and DD HH MM SS correctly', () => {
    expect(formatMinutesSeconds(0)).toBe('00:00');
    expect(formatMinutesSeconds(59)).toBe('00:59');
    expect(formatMinutesSeconds(60)).toBe('01:00');
    expect(formatMinutesSeconds(120)).toBe('02:00');
    expect(formatMinutesSeconds(7325)).toBe('02:02:05');
    expect(formatCountdown(360704)).toBe('4d 04h 11m 44s');
    expect(formatMinutesSeconds(-10)).toBe('00:00');
  });
});
