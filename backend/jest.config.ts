module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'], // Procura testes na pasta /tests
  collectCoverage: true,                // Para gerar o relatório de 70%
  coverageDirectory: 'coverage',
};