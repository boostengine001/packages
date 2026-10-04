import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './visual',
  timeout: 30_000,
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  // Baselines are generated on the CI runner image (same OS/fonts as future runs).
  // Missing baselines are written and pass; existing baselines are compared strictly.
  updateSnapshots: 'missing',
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
      caret: 'hide',
    },
  },
  use: {
    headless: true,
    viewport: { width: 1280, height: 800 },
    screenshot: 'off',
  },
  outputDir: 'test-results/visual-run',
});
