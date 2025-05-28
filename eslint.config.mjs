/* eslint-disable import/no-unused-modules */
import customConfig from 'eslint-config-phun-ky';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    extends: [customConfig]
  },
  {
    files: ['**/*.md'],
    rules: {
      'no-irregular-whitespace': 'off',
      '@stylistic/indent': 'off'
    }
  }
]);
