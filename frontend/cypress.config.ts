import { defineConfig } from "cypress";

export default defineConfig({
  // Desativa o acesso a Cypress.env() pelo código do navegador (boa prática de segurança;
  // também silencia o aviso do Cypress 15).
  allowCypressEnv: false,

  e2e: {
    baseUrl: "http://localhost:5173",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
    defaultCommandTimeout: 8000,
    video: false,
    setupNodeEvents(_on, config) {
      // Local para registrar plugins/eventos de node, se necessário.
      return config;
    },
  },
});
