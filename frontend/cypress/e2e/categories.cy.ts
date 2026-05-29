describe('Fluxo E2E: Gestão de Categorias', () => {
  const nomeCat = `Categoria - ${Date.now()}`;

  beforeEach(() => {
    cy.visit('http://localhost:5173');
    cy.get('input[type="email"]').type('jadao@gmail.com');
    cy.get('input[type="password"]').type('1234');
    cy.contains('button', 'Entrar').click();
    cy.contains('button', '🏷️ Categorias').click();
  });

  it('Deve criar, listar e remover uma categoria personalizada', () => {
    cy.get('input').first().type(nomeCat);
    cy.contains('button', 'Criar').click();

    cy.contains(nomeCat).should('be.visible');

    cy.contains(nomeCat)
      .parent()
      .find('button')
      .contains('🗑️')
      .click();

    cy.contains(nomeCat).should('not.exist');
  });
});