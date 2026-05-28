import request from 'supertest';
import { app } from '../src/server';
import { prisma } from '../src/prisma';

describe('Integração: CRUD de Transações', () => {
  let transacaoCriadaId: number;
  let tokenAuth: string; 

  beforeAll(async () => {
    const loginResponse = await request(app)
      .post('/api/users/login') 
      .send({
        email: 'jadao@gmail.com',
        password: '123' 
      });

    if (loginResponse.status !== 200) {
      const registerResponse = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Cobaia Transacao',
          email: 'test_trx_user@financeflow.com',
          password: '123'
        });
      tokenAuth = registerResponse.body.token;
    } else {
      tokenAuth = loginResponse.body.token;
    }
  });

  it('1. Deve criar uma nova transação válida no banco de dados', async () => {
    const novaTransacao = {
      description: 'Teste Automatizado - Supermercado',
      amount: 150.50,
      type: 'EXPENSE',
      accountId: 1, 
      date: '2026-05-20'
    };

    const response = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${tokenAuth}`) 
      .send(novaTransacao);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.description).toBe('Teste Automatizado - Supermercado');
    
    transacaoCriadaId = response.body.id; 
  });

  it('2. Deve barrar a criação e retornar erro 400 ao enviar dados inválidos', async () => {
    const transacaoInvalida = {
      description: 'Compra sem valor',
      type: 'EXPENSE',
      date: '2026-05-20'
    };

    const response = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${tokenAuth}`)
      .send(transacaoInvalida);

    expect(response.status).toBe(400); 
    expect(response.body).toHaveProperty('error');
  });

  it('3. Deve listar as transações do usuário (Read)', async () => {
    const response = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${tokenAuth}`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true); 
  });

  it('4. Deve atualizar o valor da transação recém-criada', async () => {
    expect(transacaoCriadaId).toBeDefined();

    const dadosAtualizados = {
      description: 'Teste Automatizado - Supermercado',
      amount: 240.00,
      type: 'EXPENSE',
      accountId: 1,
      date: '2026-05-20'
    };

    const response = await request(app)
      .put(`/api/transactions/${transacaoCriadaId}`)
      .set('Authorization', `Bearer ${tokenAuth}`)
      .send(dadosAtualizados);

    expect(response.status).toBe(200);
    
    const transacaoRetornada = response.body.transaction || response.body;
    expect(Number(transacaoRetornada.amount)).toBe(240.00);
  });

  it('5. Deve apagar a transação recém-criada (Delete)', async () => {
    expect(transacaoCriadaId).toBeDefined();

    const response = await request(app)
      .delete(`/api/transactions/${transacaoCriadaId}`)
      .set('Authorization', `Bearer ${tokenAuth}`);
    
    expect(response.status).toBe(200);
    
    transacaoCriadaId = 0; 
  });

  afterAll(async () => {
    if (transacaoCriadaId) {
      await request(app)
        .delete(`/api/transactions/${transacaoCriadaId}`)
        .set('Authorization', `Bearer ${tokenAuth}`);
    }
    // Desconecta o Prisma para o terminal fechar limpo
    await prisma.$disconnect();
  });
});