import request from 'supertest';
import { app } from '../src/server';
import { prisma } from '../src/prisma';

describe('Integração: CRUD de Contas Bancárias com Autenticação', () => {
  let token: string;
  let userId: number;
  let contaCriadaId: number;

  beforeAll(async () => {
    const email = `conta_user_${Date.now()}@financeflow.com`;
    const registerRes = await request(app)
      .post('/api/users/register')
      .send({ name: 'Dono da Conta', email, password: '123456' });

    token = registerRes.body.token;
    userId = registerRes.body.user.id;
  });

  afterAll(async () => {
    await prisma.transaction.deleteMany({ where: { account: { userId } } });
    await prisma.account.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('1. Deve bloquear o acesso sem token de autenticação (401)', async () => {
    const res = await request(app).get('/api/accounts');
    expect(res.status).toBe(401);
  });

  it('2. Deve criar uma nova conta bancária vinculada ao usuário (201)', async () => {
    const res = await request(app)
      .post('/api/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Banco Inter', type: 'CORRENTE', balance: 1000 });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    contaCriadaId = res.body.id;
  });

  it('3. Deve recusar a criação de conta sem os campos obrigatórios (400)', async () => {
    const res = await request(app)
      .post('/api/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({ balance: 500 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('4. Deve listar as contas do usuário autenticado (200)', async () => {
    const res = await request(app)
      .get('/api/accounts')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('5. Deve atualizar o nome/tipo de uma conta existente (200)', async () => {
    const res = await request(app)
      .put(`/api/accounts/${contaCriadaId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Banco Inter Black', type: 'POUPANCA' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Banco Inter Black');
  });

  it('6. Deve rejeitar um ID de conta inválido (400)', async () => {
    const res = await request(app)
      .put('/api/accounts/abc')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'X' });

    expect(res.status).toBe(400);
  });

  it('7. Deve excluir uma conta sem transações vinculadas (200)', async () => {
    const res = await request(app)
      .delete(`/api/accounts/${contaCriadaId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});
