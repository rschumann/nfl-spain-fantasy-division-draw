import { z } from 'zod';

export function isValidIanaTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export const rawEnvSchema = z.object({
  APP_ENV: z.enum(['local', 'production', 'test']).default('local'),
  DRAW_EVENT_ID: z.string().min(1),
  LEAGUE_NAME: z.string().min(1),
  SEASON_LABEL: z.string().min(1),
  DRAW_TIMEZONE: z.string().refine(isValidIanaTimezone, {
    message: 'Invalid IANA timezone'
  }),
  DRAW_START_AT: z.string().min(1),
  DRAW_REVEAL_INTERVAL_SECONDS: z.coerce.number().int().positive(),
  DRAW_RESET_ON_START: z
    .enum(['true', 'false', '1', '0'])
    .default('false')
    .transform((v) => v === 'true' || v === '1'),
  DRAW_STATE_PATH: z.string().min(1),
  HOST: z.string().default('127.0.0.1'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  BASE_URL: z.string().default('http://127.0.0.1:3000'),
  ADMIN_KEY: z.string().default('admin-secret-key-998877'),
  ESPN_ENDPOINT_URL: z.string().optional(),
  ESPN_LEAGUE_ID: z.string().default('763332624'),
  ESPN_SEASON: z.string().default('2026'),
  DIVISIONS_COUNT: z.coerce.number().int().min(2).max(16).default(4),
  DIVISIONS_NAMES: z.string().optional(),
  VITE_CHAT_ENABLED: z
    .enum(['true', 'false', '1', '0'])
    .default('true')
    .transform((v) => v === 'true' || v === '1'),
  VITE_CHAT_ROOM_ID: z.string().default('nfl-spain-26-27'),
  VITE_FIREBASE_USE_EMULATORS: z
    .enum(['true', 'false', '1', '0'])
    .default('true')
    .transform((v) => v === 'true' || v === '1'),
  VITE_FIREBASE_API_KEY: z.string().default('local-emulator'),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().default('localhost'),
  VITE_FIREBASE_PROJECT_ID: z.string().default('nfl-spain-draw-local'),
  VITE_FIREBASE_APP_ID: z.string().default('local-app'),
  VITE_FIREBASE_APP_CHECK_SITE_KEY: z.string().default('disabled-in-local')
});

export type RawEnv = z.input<typeof rawEnvSchema>;
export type ParsedRawEnv = z.output<typeof rawEnvSchema>;
