import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } }
    },
    {
      name: 'tablet',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 }
      }
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'], viewport: { width: 360, height: 800 } }
    }
  ],
  webServer: {
    command: 'npm run build:client && npx tsx src/server/index.ts',
    url: 'http://127.0.0.1:3000/api/health',
    reuseExistingServer: false,
    timeout: 30000,
    env: {
      APP_ENV: 'local',
      HOST: '127.0.0.1',
      PORT: '3000',
      DRAW_EVENT_ID: 'nfl-spain-26-27',
      LEAGUE_NAME: 'NFL Spain',
      SEASON_LABEL: '26-27',
      DRAW_TIMEZONE: 'Europe/Madrid',
      DRAW_START_AT: '2099-01-01T12:00:00.000Z',
      DRAW_REVEAL_INTERVAL_SECONDS: '120',
      DRAW_RESET_ON_START: 'true',
      DRAW_STATE_PATH: '.data/e2e-draw-state.json'
    }
  }
});
