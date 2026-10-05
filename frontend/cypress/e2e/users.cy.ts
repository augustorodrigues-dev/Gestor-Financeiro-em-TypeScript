describe('Fluxo E2E: Administração de Usuários e Acessos', () => {
  

  it('Loga como admin, lista os usuários e altera o nível de acesso de um usuário', () => {
    cy.visit('/');

    
    cy.contains('button', 'Entrar como Admin').click();

    cy.contains('Painel de Administração', { timeout: 10000 }).should('be.visible');
    cy.contains('Controle de Usuários').should('be.visible');

    
    cy.get('button[aria-label^="Editar"]').first().click();

    
    cy.get('select[aria-label="Nível de acesso"]').select('ADMIN');
    cy.contains('button', 'Salvar').click();

    
    cy.get('select[aria-label="Nível de acesso"]').should('not.exist');
  });
});
