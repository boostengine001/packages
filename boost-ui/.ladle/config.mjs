/** @type {import('@ladle/react').UserConfig} */
// Repo pages deploy under /packages/ subpath — vite base must match.
const isPagesBuild = process.env.PAGES_BASE === '/packages/';

export default {
  stories: 'stories/**/*.stories.{ts,tsx}',
  outDir: 'docs-playground',
  viteConfig: () => (isPagesBuild ? { base: '/packages/' } : {}),
  addons: {
    theme: { enabled: true, defaultState: 'light' },
  },
};
