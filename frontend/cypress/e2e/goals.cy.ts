describe('Fluxo E2E: Gestão de Metas Financeiras (UC09)', () => {
  const nomeMetaUnico = `Computador Novo - ${Date.now()}`;

  beforeEach(() => {
    cy.on('window:alert', () => true);
    cy.on('window:confirm', () => true);

    cy.visit('http://localhost:5173');
    cy.get('input[type="email"]').type('jadao@gmail.com'); 
    cy.get('input[type="password"]').type('1234'); 
    cy.contains('button', 'Entrar').click();

    cy.contains('📊 Dashboard', { timeout: 10000 }).should('be.visible');
    cy.contains('button', '🎯 Metas').click();
  });

  it('Deve criar uma meta única, registrar um aporte via prompt e deletá-la', () => {
    cy.get('input[placeholder*="Ex: Viagem"]').type(nomeMetaUnico);
    cy.get('input[type="number"]').type('8000'); 
    cy.get('input[type="date"]').type('2026-12-31');
    cy.contains('button', 'Salvar Meta').click();

    cy.contains(nomeMetaUnico, { timeout: 8000 }).should('be.visible');
    cy.contains('0% Concluído').should('be.visible');

    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns('2000');
    });

    cy.contains(nomeMetaUnico)
      .closest('.border')
      .find('button')
      .contains('+ Adicionar Aporte')
      .click();

    cy.contains('25% Concluído', { timeout: 8000 }).should('be.visible');

    cy.contains(nomeMetaUnico)
      .closest('.border')
      .find('button')
      .contains('Cancelar Meta')
      .click();

    cy.wait(500);

    cy.contains(nomeMetaUnico, { timeout: 6000 }).should('not.exist');
  });
});