// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

/**
 * Configuração de análise estática (ESLint flat config) do front-end FinanceFlow.
 * Cobre code smells, complexidade, regras de Hooks do React e boas práticas em
 * TypeScript/TSX — espelhando a análise feita no back-end.
 */
export default tseslint.config(
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**', 'cypress/**', 'vite.config.ts'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2021,
      globals: { ...globals.browser },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Regras de Hooks do React
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Code smells / manutenibilidade
      complexity: ['warn', 15],
      'no-duplicate-imports': 'error',
      eqeqeq: ['warn', 'smart'],

      // Pragmatismo para o domínio (payloads dinâmicos de fetch/serviços).
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
    },
  },
  {
    // Testes podem usar padrões mais permissivos.
    files: ['src/**/*.{test,spec}.{ts,tsx}', 'src/test/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
