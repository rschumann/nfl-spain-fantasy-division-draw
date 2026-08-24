import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    ignores: [
      'dist/**',
      'dist-server/**',
      'coverage/**',
      'node_modules/**',
      '.data/**',
      '.firebase/**',
      'playwright-report/**'
    ]
  },
  {
    files: ['**/*.ts', '**/*.js', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      'max-lines': [
        'error',
        {
          max: 179,
          skipBlankLines: false,
          skipComments: false
        }
      ],
      'max-lines-per-function': [
        'error',
        {
          max: 29,
          skipBlankLines: false,
          skipComments: false,
          IIFEs: true
        }
      ],
      'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
      'no-debugger': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      '@typescript-eslint/no-explicit-any': 'error'
    }
  }
];
