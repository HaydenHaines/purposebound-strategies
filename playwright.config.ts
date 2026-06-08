import { defineConfig } from '@playwright/test';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4321;
// Site deploys at root on Netlify (no base path in astro.config.mjs).
export const BASE_PATH = '';
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: BASE_URL,
  },
  webServer: {
    command: 'npm run dev',
    url: `${BASE_URL}${BASE_PATH}/`,
    reuseExistingServer: !process.env.CI,
  },
});
