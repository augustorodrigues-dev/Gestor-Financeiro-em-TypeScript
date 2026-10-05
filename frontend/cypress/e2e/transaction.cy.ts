describe('Fluxo E2E: Jornada completa de Transação', () => {
  

  it('Cadastra usuário, cria categoria, vincula conta, registra despesa e confere no dashboard', () => {
    const uniqueId = Date.now();
    const testEmail = `user_${uniqueId}@financeflow.com`;
    const nomeCategoria = `Eletrônicos ${uniqueId}`;

    
    cy.visit('/');
    cy.contains('Não tem uma conta? Cadastre-se aqui').click();
    cy.get('input[type="text"]').first().type('Augusto E2E');
    cy.get('input[type="email"]').type(testEmail);
    cy.get('input[type="password"]').type('123456');
    cy.contains('button', 'Cadastrar').click();

    cy.contains('Bem-vindo', { timeout: 10000 }).should('be.visible');

    
    cy.contains('button', '🏷️ Categorias').click();
    cy.get('[data-cy=cat-name]').type(nomeCategoria);
    cy.get('[data-cy=cat-create]').click();
    cy.contains(nomeCategoria).should('be.visible');

    
    cy.contains('button', '💼 Carteira').click();
    cy.get('[data-cy=acc-bank]').select('Outro / Carteira Física');
    cy.get('[data-cy=acc-add]').click();

    
    cy.get('[data-cy=tx-account] option', { timeout: 10000 }).should('have.length.greaterThan', 0);

    
    cy.get('[data-cy=tx-desc]').type('Teclado Mecânico');
    cy.get('[data-cy=tx-amount]').type('350');
    cy.get('[data-cy=tx-category]').select(nomeCategoria);
    cy.get('[data-cy=tx-save]').click();

    
    cy.contains('button', '📊 Dashboard').click();
    cy.contains('Teclado Mecânico', { timeout: 10000 }).should('be.visible');
    cy.contains('350.00').should('be.visible');
  });
});
