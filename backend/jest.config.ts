/* eslint-env node */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Define onde buscar os testes
  testMatch: ['**/tests/**/*.test.ts'],
  
  // Configurações de Cobertura (Coverage)
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text', 'text-summary'], // lcov é obrigatório para o SonarQube
  
  // Define quais arquivos devem ser avaliados para a nota de cobertura
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.ts',            // Geralmente excluímos o entry point
    '!src/prisma.ts',           // Exclui a instância do Prisma
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