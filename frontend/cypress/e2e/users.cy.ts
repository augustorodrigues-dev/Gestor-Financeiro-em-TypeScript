describe('Fluxo E2E: Administração de Usuários e Acessos', () => {
  // Observação: o Cypress aceita automaticamente window.alert/confirm por padrão.

  it('Loga como admin, lista os usuários e altera o nível de acesso de um usuário', () => {
    cy.visit('/');

    // Acesso rápido como administradora (Alexandra) já semeada no banco.
    cy.contains('button', 'Entrar como Admin').click();

    cy.contains('Painel de Administração', { timeout: 10000 }).should('be.visible');
    cy.contains('Controle de Usuários').should('be.visible');

    // Abre a edição inline do primeiro usuário da lista (botão ✏️).
    cy.get('button[aria-label^="Editar"]').first().click();

    // Altera o nível de acesso e salva.
    cy.get('select[aria-label="Nível de acesso"]').select('ADMIN');
    cy.contains('button', 'Salvar').click();

    // Após salvar, o formulário inline fecha (a lista é recarregada).
    cy.get('select[aria-label="Nível de acesso"]').should('not.exist');
  });
});
