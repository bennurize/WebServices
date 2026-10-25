import nest from '@recipes/eslint/nest';
import { defineConfig } from 'eslint/config';

export default defineConfig(nest, {
  languageOptions: {
    parserOptions: { tsconfigRootDir: import.meta.dirname },
  },
});
