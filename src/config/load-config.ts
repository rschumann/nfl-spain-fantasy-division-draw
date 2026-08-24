import { createHash } from 'node:crypto';
import type { Clock } from '../application/ports.js';
import { isPathInsidePublicRoots } from './validate-path.js';
import { rawEnvSchema, type ParsedRawEnv } from './env-schema.js';
import teamsData from '../../config/teams.json' with { type: 'json' };
import divisionsData from '../../config/divisions.json' with { type: 'json' };
import type { Team, Division } from '../domain/types.js';

export interface ChatConfig {
  readonly enabled: boolean;
  readonly roomId: string;
  readonly useEmulators: boolean;
}

export interface AppConfig {
  readonly env: 'local' | 'production' | 'test';
  readonly eventId: string;
  readonly leagueName: string;
  readonly seasonLabel: string;
  readonly timezone: string;
  readonly startAtUtc: string;
  readonly revealIntervalSeconds: number;
  readonly resetOnStart: boolean;
  readonly statePath: string;
  readonly host: string;
  readonly port: number;
  readonly configFingerprint: string;
  readonly teams: readonly Team[];
  readonly divisions: readonly Division[];
  readonly chat: ChatConfig;
}

function resolveStartAt(rawStartAt: string, env: string, clock: Clock): string {
  if (rawStartAt.toLowerCase() === 'now') {
    if (env === 'production') {
      throw new Error('DRAW_START_AT=now is forbidden in production');
    }
    return clock.now().toISOString();
  }
  const date = new Date(rawStartAt);
  if (Number.isNaN(date.getTime()) || !rawStartAt.includes('T')) {
    throw new Error(`Invalid ISO 8601 start timestamp: ${rawStartAt}`);
  }
  return date.toISOString();
}

function validateProductionRules(parsed: ParsedRawEnv): void {
  if (parsed.APP_ENV !== 'production') return;
  if (parsed.DRAW_START_AT.toLowerCase() === 'now') {
    throw new Error('DRAW_START_AT=now is forbidden in production');
  }
  if (parsed.DRAW_REVEAL_INTERVAL_SECONDS !== 120) {
    throw new Error('DRAW_REVEAL_INTERVAL_SECONDS must be 120 in production');
  }
  if (parsed.DRAW_RESET_ON_START) {
    throw new Error('DRAW_RESET_ON_START cannot be true in production');
  }
  if (parsed.VITE_FIREBASE_USE_EMULATORS) {
    throw new Error('VITE_FIREBASE_USE_EMULATORS cannot be true in production');
  }
}

export function computeConfigFingerprint(
  eventId: string,
  leagueName: string,
  seasonLabel: string,
  timezone: string,
  startAtUtc: string,
  interval: number
): string {
  const parts = [
    eventId,
    leagueName,
    seasonLabel,
    timezone,
    startAtUtc,
    interval,
    teamsData.length,
    divisionsData.length
  ];
  return createHash('sha256').update(parts.join('|'), 'utf8').digest('hex');
}

function createChatConfig(p: ParsedRawEnv): ChatConfig {
  return {
    enabled: p.VITE_CHAT_ENABLED,
    roomId: p.VITE_CHAT_ROOM_ID,
    useEmulators: p.VITE_FIREBASE_USE_EMULATORS
  };
}

function buildAppConfig(p: ParsedRawEnv, startAtUtc: string, fp: string): AppConfig {
  return {
    env: p.APP_ENV,
    eventId: p.DRAW_EVENT_ID,
    leagueName: p.LEAGUE_NAME,
    seasonLabel: p.SEASON_LABEL,
    timezone: p.DRAW_TIMEZONE,
    startAtUtc,
    revealIntervalSeconds: p.DRAW_REVEAL_INTERVAL_SECONDS,
    resetOnStart: p.DRAW_RESET_ON_START,
    statePath: p.DRAW_STATE_PATH,
    host: p.HOST,
    port: p.PORT,
    configFingerprint: fp,
    teams: teamsData as readonly Team[],
    divisions: divisionsData as readonly Division[],
    chat: createChatConfig(p)
  };
}

export function loadConfig(envRecord: Record<string, unknown>, clock: Clock): AppConfig {
  const parsed = rawEnvSchema.parse(envRecord);
  validateProductionRules(parsed);
  if (isPathInsidePublicRoots(parsed.DRAW_STATE_PATH)) {
    throw new Error(`DRAW_STATE_PATH is inside public assets: ${parsed.DRAW_STATE_PATH}`);
  }
  const startAtUtc = resolveStartAt(parsed.DRAW_START_AT, parsed.APP_ENV, clock);
  const fp = computeConfigFingerprint(
    parsed.DRAW_EVENT_ID,
    parsed.LEAGUE_NAME,
    parsed.SEASON_LABEL,
    parsed.DRAW_TIMEZONE,
    startAtUtc,
    parsed.DRAW_REVEAL_INTERVAL_SECONDS
  );
  return buildAppConfig(parsed, startAtUtc, fp);
}
