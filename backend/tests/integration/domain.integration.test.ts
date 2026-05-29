import request from 'supertest';
import { app } from '../../src/server';
import { prisma } from '../../src/prisma';

describe('Integração: Categorias, Cartões, Metas, Perfil, Senha e Relatórios', () => {
  let token: string;
  let userId: number;
  let categoryId: number;
  let cardId: number;
  let goalId: number;
  const email = `dom_${Date.now()}@financeflow.com`;

  beforeAll(async () => {
    const reg = await request(app).post('/api/users/register').send({ name: 'Dom', email, password: '1234' });
    token = reg.body.token;
    userId = reg.body.user.id;
  });

  // ---- Categorias (UC05) ----
  it('cria, lista e exclui categoria', async () => {
    const create = await request(app).post('/api/categories').set('Authorization', `Bearer ${token}`)
      .send({ name: 'Lazer', type: 'EXPENSE', icon: '🎮', color: '#6366f1' });
    expect(create.status).toBe(201);
    categoryId = create.body.id;

    const list = await request(app).get('/api/categories').set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);

    const del = await request(app).delete(`/api/categories/${categoryId}`).set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(200);
  });

  it('barra criação de categoria sem nome/tipo (400)', async () => {
    const res = await request(app).post('/api/categories').set('Authorization', `Bearer ${token}`).send({});
    expect(res.status).toBe(400);
  });

  // ---- Cartões (UC08) ----
  it('cria, lista e exclui cartão de crédito', async () => {
    const create = await request(app).post('/api/cards').set('Authorization', `Bearer ${token}`)
      .send({ name: 'Visa', limitAmount: 2000, closingDay: 10, dueDay: 17 });
    expect(create.status).toBe(201);
    cardId = create.body.id;

    const list = await request(app).get('/api/cards').set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body[0]).toHaveProperty('usagePercent');

    const del = await request(app).delete(`/api/cards/${cardId}`).set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(200);
  });

  // ---- Metas (UC09) ----
  it('cria, atualiza (aporte) e exclui meta', async () => {
    const create = await request(app).post('/api/goals').set('Authorization', `Bearer ${token}`)
      .send({ name: 'Viagem', targetAmount: 5000, deadline: '2026-12-31' });
    expect(create.status).toBe(201);
    goalId = create.body.id;

    const upd = await request(app).put(`/api/goals/${goalId}`).set('Authorization', `Bearer ${token}`)
      .send({ currentAmount: 2500 });
    expect(upd.status).toBe(200);

    const list = await request(app).get('/api/goals').set('Authorization', `Bearer ${token}`);
    expect(list.body[0].progress).toBe(50);

    const del = await request(app).delete(`/api/goals/${goalId}`).set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(200);
  });

  // ---- Perfil (UC11) ----
  it('atualiza o perfil do usuário autenticado', async () => {
    const res = await request(app).put('/api/users/profile').set('Authorization', `Bearer ${token}`)
      .send({ name: 'Dom Atualizado' });
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Dom Atualizado');
  });

  it('bloqueia acesso ao perfil sem token (401)', async () => {
    const res = await request(app).put('/api/users/profile').send({ name: 'X' });
    expect(res.status).toBe(401);
  });

  // ---- Recuperação de senha (UC18) ----
  it('gera token de recuperação e redefine a senha', async () => {
    const forgot = await request(app).post('/api/users/forgot-password').send({ email });
    expect(forgot.status).toBe(200);
    expect(forgot.body.resetToken).toBeDefined();

    const reset = await request(app).post('/api/users/reset-password')
      .send({ token: forgot.body.resetToken, password: 'novaSenha' });
    expect(reset.status).toBe(200);

    // login com a nova senha funciona
    const login = await request(app).post('/api/users/login').send({ email, password: 'novaSenha' });
    expect(login.status).toBe(200);
  });

  it('forgot-password responde genericamente para e-mail inexistente', async () => {
    const res = await request(app).post('/api/users/forgot-password').send({ email: 'naoexiste@x.com' });
    expect(res.status).toBe(200);
    expect(res.body.resetToken).toBeUndefined();
  });

  // ---- Relatório (UC07) ----
  it('retorna o resumo financeiro do usuário', async () => {
    const res = await request(app).get('/api/reports/summary').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalIncome');
    expect(res.body).toHaveProperty('balance');
  });

  afterAll(async () => {
    await request(app).delete(`/api/users/${userId}`);
    await prisma.$disconnect();
  });
});
