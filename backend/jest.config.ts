/* eslint-env node */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Define onde buscar os testes
  testMatch: ['**/tests/**/*.test.ts'],

  // Configurações de Cobertura (Coverage)
  // A coleta de cobertura só é ativada pela flag --coverage (script test:coverage),
  // permitindo rodar `test:unit` (sem banco) sem ser barrado pelo threshold global.
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text', 'text-summary'], // lcov é obrigatório para o SonarQube

  // Define quais arquivos devem ser avaliados para a nota de cobertura
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.ts',            // Geralmente excluímos o entry point
    '!src/prisma.ts',           // Exclui a instância do Prisma
    '!src/seed.ts',             // Script de seed (uso em desenvolvimento)
    '!src/routes/*.routes.ts',  // Exclui rotas (apenas redirecionam)
    '!**/node_modules/**'
  ],
  
  // Força o Jest a falhar se a cobertura cair abaixo da sua meta (75%)
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
    }
  },
  
  // Mapeamento de caminhos (se você usar aliases no tsconfig)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};