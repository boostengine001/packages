import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**'],
      exclude: [
        'src/**/__tests__/**',
        'src/**/index.ts',
        // Non-code assets and ambient type declarations
        '**/*.d.ts',
        '**/*.css',
        '**/*.json',
        // Framework adapters and React Native entry are covered by their own ecosystems
        'src/native/**',
        'src/svelte/**',
        'src/solid/**',
        'src/angular/**',
        'src/qwik/**',
      ],
      // CI gate: coverage regressions fail the build. Current: ~49% stmts / ~50% lines.
      thresholds: {
        statements: 46,
        branches: 38,
        functions: 45,
        lines: 48,
      },
    },
  },
});
