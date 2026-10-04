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
      // A11y: full error enforcement. Labels associate via htmlFor OR nesting (standard,
      // jsx-a11y preset's "all" requirement is over-strict for sibling-input layouts).
      ...Object.fromEntries(
        Object.entries(jsxA11y.flatConfigs.recommended.rules).map(([rule]) => [rule, 'error'])
      ),
      'jsx-a11y/label-has-associated-control': [
        'error',
        { required: { some: ['nesting', 'id'] } },
      ],
      'jsx-a11y/label-has-for': ['error', { required: { some: ['nesting', 'id'] } }],
    },
  },
  prettier
);
