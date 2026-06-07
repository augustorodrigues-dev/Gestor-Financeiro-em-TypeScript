// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

/**
 * Configuração de análise estática (ESLint flat config) do backend FinanceFlow.
 * Complementa a análise do SonarQube/SonarCloud com verificação local de
 * code smells, complexidade e más práticas em TypeScript.
 */
export default tseslint.config(
  {
    ignores: ['node_modules/**', 'coverage/**', 'dist/**', 'prisma/migrations/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    rules: {
      // Code smells / manutenibilidade
      complexity: ['warn', 12],
      'max-lines-per-function': ['warn', 80],
      'no-duplicate-imports': 'error',
      eqeqeq: ['warn', 'smart'],

      // Pragmatismo para o domínio do projeto (DTOs dinâmicos do Prisma/Express).
      '@typescript-eslint/no-explicit-any': 'off',
      // Augmentação de tipos do Express exige `declare global { namespace Express }`.
      '@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
    },
  },
  {
    // Scripts utilitários (seed) e testes podem usar padrões mais permissivos.
    files: ['src/seed.ts', 'tests/**/*.ts'],
    rules: {
      'max-lines-per-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
