import type { Team, Division } from '../../src/domain/types.js';
import type { Clock } from '../../src/application/ports.js';

export class FixedClock implements Clock {
  constructor(private currentDate: Date) {}
  now(): Date {
    return new Date(this.currentDate.getTime());
  }
  advanceSeconds(seconds: number): void {
    this.currentDate = new Date(this.currentDate.getTime() + seconds * 1000);
  }
  setDate(date: Date): void {
    this.currentDate = new Date(date.getTime());
  }
}

export const VALID_ENV_LOCAL = {
  APP_ENV: 'local',
  DRAW_EVENT_ID: 'nfl-spain-26-27',
  LEAGUE_NAME: 'NFL Spain',
  SEASON_LABEL: '26-27',
  DRAW_TIMEZONE: 'Europe/Madrid',
  DRAW_START_AT: 'now',
  DRAW_REVEAL_INTERVAL_SECONDS: '120',
  DRAW_RESET_ON_START: 'true',
  DRAW_STATE_PATH: '.data/draw-state.json',
  HOST: '127.0.0.1',
  PORT: '3000',
  VITE_CHAT_ENABLED: 'true',
  VITE_CHAT_ROOM_ID: 'nfl-spain-26-27',
  VITE_FIREBASE_USE_EMULATORS: 'true',
  VITE_FIREBASE_API_KEY: 'local-emulator',
  VITE_FIREBASE_AUTH_DOMAIN: 'localhost',
  VITE_FIREBASE_PROJECT_ID: 'nfl-spain-draw-local',
  VITE_FIREBASE_APP_ID: 'local-app',
  VITE_FIREBASE_APP_CHECK_SITE_KEY: 'disabled-in-local'
};

export const VALID_ENV_PROD = {
  APP_ENV: 'production',
  DRAW_EVENT_ID: 'nfl-spain-26-27',
  LEAGUE_NAME: 'NFL Spain',
  SEASON_LABEL: '26-27',
  DRAW_TIMEZONE: 'Europe/Madrid',
  DRAW_START_AT: '2026-09-01T20:00:00+02:00',
  DRAW_REVEAL_INTERVAL_SECONDS: '120',
  DRAW_RESET_ON_START: 'false',
  DRAW_STATE_PATH: '/var/lib/nfl-spain-draw/state.json',
  HOST: '0.0.0.0',
  PORT: '3000',
  VITE_CHAT_ENABLED: 'true',
  VITE_CHAT_ROOM_ID: 'nfl-spain-26-27',
  VITE_FIREBASE_USE_EMULATORS: 'false',
  VITE_FIREBASE_API_KEY: 'prod-api-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'nfl-spain.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'nfl-spain-draw-prod',
  VITE_FIREBASE_APP_ID: 'prod-app-id',
  VITE_FIREBASE_APP_CHECK_SITE_KEY: 'recaptcha-site-key'
};

export const SAMPLE_TEAMS: readonly Team[] = [
  { id: 'madrid-steelers', name: 'Madrid Steelers' },
  { id: 'toledo-patriots', name: 'Toledo Patriots' },
  { id: 'la-osera', name: 'La Osera' },
  { id: 'london-viking', name: 'London Viking' },
  { id: 'nico', name: 'Nico' },
  { id: 'ohio-dolphins', name: 'Ohio Dolphins' },
  { id: 'camioneros', name: 'Camioneros' },
  { id: 'wolverines', name: 'Wolverines' },
  { id: 'barakaldo', name: 'Barakaldo' },
  { id: 'daniel', name: 'Daniel' },
  { id: 'samuel', name: 'Samuel' },
  { id: 'sant-boi-chargers', name: 'Sant Boi Chargers' },
  { id: 'bcn-giants', name: 'BCN Giants' },
  { id: 'juanito', name: 'Juanito' },
  { id: 'navarra-colts', name: 'Navarra Colts' },
  { id: 'xisko', name: 'Xisko' }
];

export const SAMPLE_DIVISIONS: readonly Division[] = [
  { id: 'NORTH', name: 'NORTH' },
  { id: 'EAST', name: 'EAST' },
  { id: 'WEST', name: 'WEST' },
  { id: 'SOUTH', name: 'SOUTH' }
];
