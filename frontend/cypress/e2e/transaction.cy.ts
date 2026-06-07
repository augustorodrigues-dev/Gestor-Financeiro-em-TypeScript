describe('Fluxo E2E: Jornada completa de Transação', () => {
  // Observação: o Cypress aceita automaticamente window.alert/confirm por padrão.

  it('Cadastra usuário, cria categoria, vincula conta, registra despesa e confere no dashboard', () => {
    const uniqueId = Date.now();
    const testEmail = `user_${uniqueId}@financeflow.com`;
    const nomeCategoria = `Eletrônicos ${uniqueId}`;

    // 1) Cadastro (login automático após registrar) ------------------------
    cy.visit('/');
    cy.contains('Não tem uma conta? Cadastre-se aqui').click();
    cy.get('input[type="text"]').first().type('Augusto E2E');
    cy.get('input[type="email"]').type(testEmail);
    cy.get('input[type="password"]').type('123456');
    cy.contains('button', 'Cadastrar').click();

    cy.contains('Bem-vindo', { timeout: 10000 }).should('be.visible');

    // 2) Cria uma categoria (pré-condição para lançar transação) -----------
    cy.contains('button', '🏷️ Categorias').click();
    cy.get('[data-cy=cat-name]').type(nomeCategoria);
    cy.get('[data-cy=cat-create]').click();
    cy.contains(nomeCategoria).should('be.visible');

    // 3) Vincula uma conta financeira --------------------------------------
    cy.contains('button', '💼 Carteira').click();
    cy.get('[data-cy=acc-bank]').select('Outro / Carteira Física');
    cy.get('[data-cy=acc-add]').click();

    // Aguarda a conta recém-criada aparecer no seletor de transações.
    cy.get('[data-cy=tx-account] option', { timeout: 10000 }).should('have.length.greaterThan', 0);

    // 4) Registra uma despesa ----------------------------------------------
    cy.get('[data-cy=tx-desc]').type('Teclado Mecânico');
    cy.get('[data-cy=tx-amount]').type('350');
    cy.get('[data-cy=tx-category]').select(nomeCategoria);
    cy.get('[data-cy=tx-save]').click();

    // 5) Confere no dashboard ----------------------------------------------
    cy.contains('button', '📊 Dashboard').click();
    cy.contains('Teclado Mecânico', { timeout: 10000 }).should('be.visible');
    cy.contains('350.00').should('be.visible');
  });
});
