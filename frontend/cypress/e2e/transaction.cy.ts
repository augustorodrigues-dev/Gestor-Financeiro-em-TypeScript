describe('Fluxo E2E: Criação de Transação', () => {
  
  beforeEach(() => {
    cy.on('window:alert', (text) => {
      const mensagensValidas = ['sucesso', 'vinculada', 'primeiro'];
      const contemMensagemValida = mensagensValidas.some(msg => text.toLowerCase().includes(msg));
      expect(contemMensagemValida).to.be.true;
    });
  });

  it('Deve cadastrar usuário, criar conta bancária, registrar despesa e ver no dashboard', () => {
    const uniqueId = Date.now();
    const testEmail = `user_${uniqueId}@financeflow.com`;

    cy.visit('http://localhost:5173'); 

    cy.contains('Não tem uma conta? Cadastre-se aqui').click();
    cy.get('input[placeholder*="nome" i], input[type="text"]').type('Augusto E2E');
    cy.get('input[type="email"]').type(testEmail);
    cy.get('input[type="password"]').type('123456');
    cy.contains('button', 'Cadastrar').click();

    cy.get('body').then(($body) => {
      if ($body.text().includes('Entrar no FinanceFlow')) {
        cy.get('input[type="email"]').clear().type(testEmail);
        cy.get('input[type="password"]').clear().type('123456');
        cy.contains('button', 'Entrar').click();
      }
    });

    cy.contains('Bem-vindo', { timeout: 6000 }).should('be.visible');

    cy.contains('💼 Carteira').click();

    cy.contains('Vincular Conta Financeira').should('be.visible');
    cy.get('select').eq(3).select('Outro / Carteira Física'); 
    cy.contains('button', 'Adicionar Conta Oficial').click();

    cy.get('input[placeholder="Ex: Supermercado"]').type('Teclado Mecânico');
    cy.get('input[placeholder="R$ 0,00"]').type('350.00');
    cy.get('select').eq(0).select('EXPENSE'); 
    cy.contains('Salvar Transação').click();

    cy.contains('📊 Dashboard').click();
    cy.contains('Teclado Mecânico').should('be.visible');
    cy.contains('350.00').should('be.visible');
  });
});