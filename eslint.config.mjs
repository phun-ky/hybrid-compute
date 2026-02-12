import markdown from '@eslint/markdown';
import { defineConfig } from 'eslint/config';
import customConfig from 'eslint-config-phun-ky';
import globals from 'globals';
import { parser as TSEslintParser } from 'typescript-eslint';

export default defineConfig([
  {
    extends: [customConfig],
    rules: {
      'import/no-unused-modules': 'off'
    }
  },
  {
    files: ['**/*.md'],
    processor: markdown.processors.markdown,
    rules: {
      'no-irregular-whitespace': 'off',
      '@stylistic/indent': 'off'
    }
  },
  {
    files: ['**/*.md/*.js', '**/*.md/*.jsx', '**/*.md/*.ts', '**/*.md/*.tsx'],
    languageOptions: {
      parser: TSEslintParser,
      parserOptions: {
        project: false,
        ecmaFeatures: { jsx: true },
        sourceType: 'module'
      },
      globals: {
        ...globals.browser
      }
    },
    rules: {
      'import/no-unresolved': 'off',
      '@stylistic/indent': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-undef': 'off',
      '@stylistic/semi': 'off'
    }
  }
]);
