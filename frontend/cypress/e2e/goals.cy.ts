describe('Fluxo E2E: Gestão de Metas Financeiras (UC09)', () => {

  beforeEach(() => {
    cy.visit('http://localhost:5173');
    cy.get('input[type="email"]').type('jadao@gmail.com'); 
    cy.get('input[type="password"]').type('1234'); 
    cy.contains('button', 'Entrar').click();

    cy.contains('🎯 Metas', { timeout: 10000 }).should('be.visible');
  });

  it('Deve criar uma meta de viagem, visualizar a barra de progresso e depois deletar', () => {
    cy.contains('🎯 Metas').click();

    cy.get('input[placeholder*="Nome" i]').type('Viagem para o Japão');
    cy.get('input[type="number"]').first().type('15000'); // Valor Alvo
    cy.get('input[type="date"]').type('2026-12-31');
    cy.contains('button', /Criar Meta|Salvar/i).click();

    cy.contains('Viagem para o Japão', { timeout: 8000 }).should('be.visible');
    cy.contains('0% Concluído').should('be.visible');

    cy.contains('Viagem para o Japão')
      .parent()
      .find('button')
      .contains(/Excluir|Cancelar/i)
      .click();

    cy.contains('Viagem para o Japão').should('not.exist');
  });
});