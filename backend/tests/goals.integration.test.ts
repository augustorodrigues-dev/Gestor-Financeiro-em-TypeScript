import request from 'supertest';
import { app } from '../src/server';
import { prisma } from '../src/prisma';

describe('Integração: API de Metas Financeiras (CRUD)', () => {
  let token: string;
  let testUserId: number;
  let createdGoalId: number;

  beforeAll(async () => {
    const uniqueEmail = `test.goal.${Date.now()}@gmail.com`;
    await request(app).post('/api/users/register').send({
      name: 'Tester Metas',
      email: uniqueEmail,
      password: 'password123'
    });

    const loginRes = await request(app).post('/api/users/login').send({
      email: uniqueEmail,
      password: 'password123'
    });

    token = loginRes.body.token;
    testUserId = loginRes.body.user.id;
  });

  afterAll(async () => {
    // 2. Limpeza do banco de dados (Teardown)
    await prisma.goal.deleteMany({ where: { userId: testUserId } });
    await prisma.user.delete({ where: { id: testUserId } });
  });

  it('Deve bloquear a criação de meta se o Token não for enviado (Erro 401)', async () => {
    const res = await request(app).post('/api/goals').send({
      name: 'Carro Novo',
      targetAmount: 50000,
      deadline: '2026-12-31'
    });
    expect(res.status).toBe(401);
  });

  it('Deve criar uma meta financeira com sucesso (POST /api/goals)', async () => {
    const res = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Carro Novo',
        targetAmount: 50000,
        deadline: '2026-12-31'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Carro Novo');
    createdGoalId = res.body.id;
  });

  it('Deve registrar um aporte atualizando o valor atual (PUT /api/goals/:id)', async () => {
    const res = await request(app)
      .put(`/api/goals/${createdGoalId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ currentAmount: 10000 });

    expect(res.status).toBe(200);
    expect(Number(res.body.currentAmount)).toBe(10000);
  });

  it('Deve excluir a meta financeira (DELETE /api/goals/:id)', async () => {
    const res = await request(app)
      .delete(`/api/goals/${createdGoalId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/cancelada com sucesso/i);
  });
});