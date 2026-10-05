import { test, expect } from '@playwright/test';

/**
 * Real-browser visual suite: loads the showcase page in Chromium for every
 * design preset × key component in BOTH light and dark mode, asserts the page
 * renders without console errors or uncaught exceptions, and pixel-diffs
 * against committed baselines (per-platform, generated on the CI runner).
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

const COMPONENTS = [
  'button',
  'input',
  'tabs',
  'toast',
  'table',
  'product',
  'modal',
  'navbar',
  'footer',
  'cart',
  'login-form',
  'alert',
  'coupon',
] as const;

const pageUrl = (preset: string, component: string, mode: 'light' | 'dark' = 'light') =>
  `file://${__dirname}/index.html?preset=${preset}&mode=${mode}&component=${component}`;

for (const mode of ['light', 'dark'] as const) {
  for (const preset of PRESETS) {
    for (const component of COMPONENTS) {
      test(`renders ${component} with ${preset} preset (${mode}) without errors`, async ({
        page,
      }) => {
        const consoleErrors: string[] = [];
        const pageErrors: string[] = [];

        page.on('console', (msg) => {
          if (msg.type() === 'error') consoleErrors.push(msg.text());
        });
        page.on('pageerror', (err) => pageErrors.push(err.message));

        await page.goto(pageUrl(preset, component, mode));
        await page.waitForSelector('#root > *', { state: 'attached', timeout: 15_000 });
        if (mode === 'dark') {
          await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
        }
        await page.waitForTimeout(300); // let transitions/animations settle

        const meta = page.getByTestId('meta');
        await expect(meta).toHaveAttribute('data-preset', preset);
        await expect(meta).toHaveAttribute('data-component', component);

        expect(pageErrors, `uncaught exceptions for ${preset}/${component} (${mode})`).toEqual(
          []
        );
        expect(
          consoleErrors.filter((e) => !e.includes('Download the React DevTools')),
          `console errors for ${preset}/${component} (${mode})`
        ).toEqual([]);

        // Pixel-diff against the committed baseline (generated on the CI runner).
        // First CI run writes missing baselines; later runs compare.
        const prefix = mode === 'dark' ? 'dark-' : '';
        await expect(page).toHaveScreenshot(`${prefix}${preset}-${component}.png`, {
          fullPage: true,
        });
      });
    }
  }
}

test('key components are present in the DOM across presets', async ({ page }) => {
  for (const preset of PRESETS) {
    await page.goto(pageUrl(preset, 'button'));
    await page.waitForSelector('#root > *', { state: 'attached' });
    await expect(page.getByRole('button', { name: 'Primary' })).toBeVisible();
  }
});
