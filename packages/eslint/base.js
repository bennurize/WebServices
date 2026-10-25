import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import prettier from 'eslint-config-prettier';
import perfectionist from 'eslint-plugin-perfectionist';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

/**
 * Inherited by the nest and react configurations. Quality and consistency
 * rules only: formatting belongs to Prettier.
 */
export default defineConfig(
  { ignores: ['**/dist/**', '**/coverage/**'] },
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  sonarjs.configs.recommended,
  unicorn.configs.recommended,
  // Turns off every rule that would fight with Prettier, keep it after the presets
  prettier,
  {
    languageOptions: {
      parserOptions: { projectService: true },
    },
    plugins: {
      '@stylistic': stylistic,
      perfectionist,
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true },
      ],

      // Sorted where the order carries no meaning: imports, exports, unions
      'perfectionist/sort-exports': ['error', { type: 'natural' }],
      'perfectionist/sort-imports': ['error', { type: 'natural' }],
      'perfectionist/sort-named-exports': ['error', { type: 'natural' }],
      'perfectionist/sort-named-imports': ['error', { type: 'natural' }],
      'perfectionist/sort-union-types': ['error', { type: 'natural' }],

      // Layout rules that Prettier does not handle
      '@stylistic/lines-between-class-members': [
        'error',
        'always',
        { exceptAfterSingleLine: true },
      ],
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', next: 'return', prev: '*' },
      ],
      '@stylistic/spaced-comment': ['error', 'always'],

      // MongoDB and React both rely on null
      'unicorn/no-null': 'off',
      // Short, common names (req, err, props...) stay readable
      'unicorn/prevent-abbreviations': 'off',
    },
  },
  {
    // Configuration files are plain JavaScript, outside any tsconfig
    extends: [tseslint.configs.disableTypeChecked],
    files: ['**/*.js'],
  },
);
