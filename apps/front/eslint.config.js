import react from '@recipes/eslint/react';
import { defineConfig } from 'eslint/config';

export default defineConfig(react, {
  languageOptions: {
    parserOptions: { tsconfigRootDir: import.meta.dirname },
  },
});
