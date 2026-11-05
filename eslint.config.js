import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';
export default tseslint.config(js.configs.recommended, ...tseslint.configs.recommended, jsxA11y.flatConfigs.recommended, { files: ['**/*.{ts,tsx}'], languageOptions: { globals: globals.browser } });

