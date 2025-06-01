import { defineConfig } from 'eslint/config';
import customConfig from 'eslint-config-phun-ky';

export default defineConfig([
  {
    extends: [customConfig],
    rules: {
      'import/no-unused-modules': 'off'
    }
  },
  {
    files: ['**/*.md'],
    rules: {
      'no-irregular-whitespace': 'off',
      '@stylistic/indent': 'off'
    }
  }
]);
