import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './visual',
  timeout: 30_000,
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: {
    headless: true,
    viewport: { width: 1280, height: 800 },
    screenshot: 'off',
  },
  outputDir: 'test-results/visual-run',
});
