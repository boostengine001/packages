/** @type {import('@ladle/react').UserConfig} */
export default {
  stories: 'stories/**/*.stories.{ts,tsx}',
  outDir: 'docs-playground',
  addons: {
    theme: { enabled: true, defaultState: 'light' },
  },
};
