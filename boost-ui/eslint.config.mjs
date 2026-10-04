import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'bin/**',
      '**/*.cjs',
      '**/*.md',
      'llms*.txt',
      'build_log.txt',
      'out.txt',
      'err.txt',
    ],
  },
  ...tseslint.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      // Critical for a hooks-heavy component library
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Report-only for now; tightening happens incrementally
      '@typescript-eslint/no-explicit-any': 'warn',
      // A11y baseline: ~70 real findings across legacy components. These stay visible as
      // warnings; promote individual rules back to 'error' as components get fixed.
      ...Object.fromEntries(
        Object.entries(jsxA11y.flatConfigs.recommended.rules).map(([rule]) => [rule, 'warn'])
      ),
    },
  },
  prettier
);
