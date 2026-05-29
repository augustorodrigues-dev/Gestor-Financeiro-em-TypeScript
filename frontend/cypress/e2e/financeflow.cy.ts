/// <reference types="cypress" />

describe('FinanceFlow — Testes End-to-End (Cypress)', () => {
  it('E2E-01: exibe a tela de login com os campos principais', () => {
    cy.visit('/');
    cy.contains('button', 'Entrar').should('be.visible');
    cy.get('#login-email').should('be.visible');
    cy.get('#login-password').should('be.visible');
  });

  it('E2E-02: navega entre login e cadastro', () => {
    cy.visit('/');
    cy.contains('button', 'Cadastre-se aqui').click();
    cy.contains('Crie sua conta').should('be.visible');
    cy.contains('button', 'Faça login').click();
    cy.contains('Acesso Rápido').should('be.visible');
  });

  it('E2E-03: login de usuário comum carrega o Dashboard (UC01/UC04/UC06)', () => {
    cy.visit('/');
    cy.contains('button', 'Jadão o Liso').click();
    cy.contains('Bem-vindo de volta', { timeout: 20000 }).should('be.visible');
    cy.contains('Saldo Consolidado').should('be.visible');
  });

  it('E2E-04: login de administrador abre o Painel (UC01/UC14)', () => {
    cy.visit('/');
    cy.contains('button', 'Entrar como Admin').click();
    cy.contains('Painel de Administração Geral', { timeout: 20000 }).should('be.visible');
  });

  it('E2E-05: usuário navega pelas telas (Contas, Categorias, Cartões, Metas, Relatórios)', () => {
    cy.visit('/');
    cy.contains('button', 'Jadão o Liso').click();
    cy.contains('Bem-vindo de volta', { timeout: 20000 }).should('be.visible');

    cy.contains('[role="tab"]', 'Contas').click();
    cy.contains('h2', 'Minhas Contas').should('be.visible');

    cy.contains('[role="tab"]', 'Categorias').click();
    cy.contains('h2', 'Categorias').should('be.visible');

    cy.contains('[role="tab"]', 'Cartões').click();
    cy.contains('h2', 'Cartões de Crédito').should('be.visible');

    cy.contains('[role="tab"]', 'Metas').click();
    cy.contains('h2', 'Metas Financeiras').should('be.visible');

    cy.contains('[role="tab"]', 'Relatórios').click();
    cy.contains('h2', 'Relatórios').should('be.visible');
  });

  it('E2E-06: edição de perfil (UC11)', () => {
    cy.visit('/');
    cy.contains('button', 'Jadão o Liso').click();
    cy.contains('Bem-vindo de volta', { timeout: 20000 }).should('be.visible');
    cy.contains('[role="tab"]', 'Perfil').click();
    cy.contains('h2', 'Editar Perfil').should('be.visible');
  });
});
