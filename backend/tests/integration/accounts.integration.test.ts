import request from 'supertest';
import { app } from '../../src/server';
import { prisma } from '../../src/prisma';

describe('Integração: CRUD de Contas Bancárias', () => {
  let token: string;
  let accountId: number;

  beforeAll(async () => {
    const email = `acc_${Date.now()}@financeflow.com`;
    const register = await request(app)
      .post('/api/users/register')
      .send({ name: 'Cobaia Conta', email, password: '1234' });
    token = register.body.token;
  });

  it('1. Deve retornar 401 ao acessar contas sem token', async () => {
    const response = await request(app).get('/api/accounts');
    expect(response.status).toBe(401);
  });

  it('2. Deve criar uma nova conta vinculada ao usuário (Create)', async () => {
    const response = await request(app)
      .post('/api/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Banco Inter', type: 'CORRENTE', balance: 0 });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    accountId = response.body.id;
  });

  it('3. Deve barrar criação sem nome/tipo (erro 400)', async () => {
    const response = await request(app)
      .post('/api/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({ balance: 100 });
    expect(response.status).toBe(400);
  });

  it('4. Deve listar as contas do usuário (Read)', async () => {
    const response = await request(app)
      .get('/api/accounts')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.some((a: any) => a.id === accountId)).toBe(true);
  });

  it('5. Deve atualizar o nome da conta (Update)', async () => {
    const response = await request(app)
      .put(`/api/accounts/${accountId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Banco Inter Editado', type: 'POUPANCA' });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Banco Inter Editado');
  });

  it('6. Deve BLOQUEAR a exclusão de conta com transações vinculadas (regra UC03)', async () => {
    // Cria uma transação na conta para ativar a trava
    const tx = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'Trava', amount: 10, type: 'EXPENSE', accountId, date: '2026-05-20' });

    const blocked = await request(app)
      .delete(`/api/accounts/${accountId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(blocked.status).toBe(400);
    expect(blocked.body.error).toMatch(/bloqueada/i);

    // Limpa a transação para liberar a exclusão
    await request(app).delete(`/api/transactions/${tx.body.id}`).set('Authorization', `Bearer ${token}`);
  });

  it('7. Deve excluir a conta sem transações (Delete)', async () => {
    const response = await request(app)
      .delete(`/api/accounts/${accountId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    accountId = 0;
  });

  afterAll(async () => {
    if (accountId) {
      await request(app).delete(`/api/accounts/${accountId}`).set('Authorization', `Bearer ${token}`);
    }
    await prisma.$disconnect();
  });
});
