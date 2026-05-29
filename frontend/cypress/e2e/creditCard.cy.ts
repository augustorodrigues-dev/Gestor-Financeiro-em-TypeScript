describe('Fluxo E2E: Gestão de Cartão de Crédito', () => {

  beforeEach(() => {
    cy.on('window:alert', (text) => {
      const mensagensValidas = ['sucesso', 'adicionado', 'salvo', 'vinculada'];
      const contemMensagemValida = mensagensValidas.some(msg => text.toLowerCase().includes(msg));
      expect(contemMensagemValida).to.be.true;
    });

    cy.visit('http://localhost:5173');
    
    cy.get('input[type="email"]').type('jadao@gmail.com'); // 🚀 Mudou para o Jadão
    cy.get('input[type="password"]').type('1234'); // Senha correta do seed
    cy.contains('button', 'Entrar').click();

    cy.contains('💼 Carteira', { timeout: 10000 }).should('be.visible');
  });

  it('Deve acessar a carteira, cadastrar um cartão de crédito e exibir na tela', () => {
    cy.contains('💼 Carteira').click();

    cy.get('input[type="text"]').last().clear().type('Nubank Ultravioleta');
    cy.get('input[type="number"]').eq(-3).clear().type('8500'); // Limite
    cy.get('input[type="number"]').eq(-2).clear().type('5');    // Fechamento
    cy.get('input[type="number"]').eq(-1).clear().type('12');   // Vencimento

    cy.get('button').contains('Adicionar Cartão').click(); 

    cy.contains('Nubank Ultravioleta', { timeout: 10000 }).should('be.visible');
  });
});