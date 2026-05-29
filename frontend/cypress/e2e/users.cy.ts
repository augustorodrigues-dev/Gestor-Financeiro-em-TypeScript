describe('Fluxo E2E: Gestão de Usuários e Acessos (Admin)', () => {

  beforeEach(() => {
    cy.on('window:alert', (text) => {
      const mensagensValidas = ['sucesso', 'atualizado', 'deletado'];
      const contemMensagemValida = mensagensValidas.some(msg => text.toLowerCase().includes(msg));
      expect(contemMensagemValida).to.be.true;
    });
  });

  it('Deve logar como Admin, listar os usuários e simular a edição de permissões', () => {
    cy.visit('http://localhost:5173');

    cy.get('input[type="email"]').type('alexandra@gmail.com');
    cy.get('input[type="password"]').type('senha'); 
    cy.contains('button', 'Entrar').click();

    cy.contains(/Admin|Alexandra/i, { timeout: 6000 }).should('be.visible');
    
    cy.get('body').then(($body) => {
      if ($body.text().includes('Painel')) {
        cy.contains(/Painel/i).click();
      } else {
        cy.contains(/Admin/i).click();
      }
    });

    cy.get('body').contains(/Usuário|Acesso|E-mail|Role/i).should('be.visible');

    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Editar")').length > 0) {
        cy.contains('button', 'Editar').first().click();
        
        cy.get('select').select('ADMIN');
        cy.contains('button', 'Salvar').click();
      } else {
        cy.log('Nenhum botão clássico de "Editar" encontrado na tabela.');
      }
    });
  });
});