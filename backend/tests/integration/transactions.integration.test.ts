import request from 'supertest';
import { app } from '../../src/server';
import { prisma } from '../../src/prisma';

describe('Integração: CRUD de Transações', () => {
  let token: string;
  let accountId: number;
  let transacaoCriadaId: number;

  // Cria um usuário e uma conta próprios para o teste ser reproduzível (sem depender do seed)
  beforeAll(async () => {
    const email = `trx_${Date.now()}@financeflow.com`;
    const register = await request(app)
      .post('/api/users/register')
      .send({ name: 'Cobaia Transacao', email, password: '1234' });
    token = register.body.token;

    const account = await request(app)
      .post('/api/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Conta de Teste', type: 'CORRENTE', balance: 0 });
    accountId = account.body.id;
  });

  it('1. Deve criar uma nova transação válida no banco de dados', async () => {
    const response = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'Supermercado', amount: 150.5, type: 'EXPENSE', accountId, date: '2026-05-20' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.description).toBe('Supermercado');
    transacaoCriadaId = response.body.id;
  });

  it('2. Deve barrar a criação e retornar erro 400 ao enviar dados inválidos', async () => {
    const response = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'Compra sem valor', type: 'EXPENSE', date: '2026-05-20' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('3. Deve retornar 401 quando não há token de autenticação', async () => {
    const response = await request(app).get('/api/transactions');
    expect(response.status).toBe(401);
  });

  it('4. Deve listar as transações do usuário (Read)', async () => {
    const response = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('5. Deve atualizar o valor da transação recém-criada', async () => {
    expect(transacaoCriadaId).toBeDefined();
    const response = await request(app)
      .put(`/api/transactions/${transacaoCriadaId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'Supermercado', amount: 240.0, type: 'EXPENSE', accountId, date: '2026-05-20' });

    expect(response.status).toBe(200);
    const tx = response.body.transaction || response.body;
    expect(Number(tx.amount)).toBe(240.0);
  });

  it('6. Deve apagar a transação recém-criada (Delete)', async () => {
    const response = await request(app)
      .delete(`/api/transactions/${transacaoCriadaId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    transacaoCriadaId = 0;
  });

  afterAll(async () => {
    if (transacaoCriadaId) {
      await request(app).delete(`/api/transactions/${transacaoCriadaId}`).set('Authorization', `Bearer ${token}`);
    }
    if (accountId) {
      await request(app).delete(`/api/accounts/${accountId}`).set('Authorization', `Bearer ${token}`);
    }
    await prisma.$disconnect();
  });
});
