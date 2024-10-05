import globals from 'globals';
import pluginJs from '@eslint/js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { includeIgnoreFile } from '@eslint/compat';

const projectRoot = dirname(fileURLToPath(import.meta.url));
const dotIgnorePath = join(projectRoot, '.cleanignore');

/** ESLint Config */
export default [
  // Global Linting Config
  // **************************************************
  includeIgnoreFile(dotIgnorePath),
  pluginJs.configs.recommended,
  // Source Code Linting Config
  // **************************************************
  {
    files: ['src/**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        // Obsidian's `app` object.
        app: 'readonly',
      },
    },
  },
  // Config File Linting Config
  // **************************************************
  {
    files: ['*.{js,mjs,cjs}'],
    languageOptions: { globals: globals.node },
  },
];
