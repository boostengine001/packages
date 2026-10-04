import { test, expect } from '@playwright/test';

/**
 * Real-browser visual suite: loads the showcase page in Chromium for every
 * design preset × key component, asserts the page renders without console
 * errors or uncaught exceptions, and captures screenshots as CI artifacts.
 *
 * Pixel-diff baselines are a deliberate follow-up once rendering stabilises
 * across runner OS images; this suite locks down functional rendering today.
 */

const PRESETS = [
  'minimal',
  'glassmorphism',
  'neumorphism',
  'neo-brutalism',
  'dark-first',
  'gradient-glow',
  'material-you',
] as const;

const COMPONENTS = ['button', 'input', 'tabs', 'toast', 'table', 'product', 'modal'] as const;

const pageUrl = (preset: string, component: string) =>
  `file://${__dirname}/index.html?preset=${preset}&component=${component}`;

for (const preset of PRESETS) {
  for (const component of COMPONENTS) {
    test(`renders ${component} with ${preset} preset without errors`, async ({ page }) => {
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      page.on('pageerror', (err) => pageErrors.push(err.message));

      await page.goto(pageUrl(preset, component));
      await page.waitForSelector('#root > *', { state: 'attached', timeout: 15_000 });
      await page.waitForTimeout(300); // let transitions/animations settle

      const meta = page.getByTestId('meta');
      await expect(meta).toHaveAttribute('data-preset', preset);
      await expect(meta).toHaveAttribute('data-component', component);

      expect(pageErrors, `uncaught exceptions for ${preset}/${component}`).toEqual([]);
      expect(
        consoleErrors.filter((e) => !e.includes('Download the React DevTools')),
        `console errors for ${preset}/${component}`
      ).toEqual([]);

      // Pixel-diff against the committed baseline (generated on the CI runner).
      // First CI run writes missing baselines; later runs compare.
      await expect(page).toHaveScreenshot(`${preset}-${component}.png`, { fullPage: true });
    });
  }
}

test('key components are present in the DOM across presets', async ({ page }) => {
  for (const preset of PRESETS) {
    await page.goto(pageUrl(preset, 'button'));
    await page.waitForSelector('#root > *', { state: 'attached' });
    await expect(page.getByRole('button', { name: 'Primary' })).toBeVisible();
  }
});
