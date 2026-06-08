import request from 'supertest';
import { app } from '../../src/server';
import { prisma } from '../../src/prisma';

describe('Integração: API de Relatórios Financeiros', () => {
  let token: string;
  let userId: number;

  beforeAll(async () => {
    const email = `report_user_${Date.now()}@financeflow.com`;
    const registerRes = await request(app)
      .post('/api/users/register')
      .send({ name: 'Dono do Relatório', email, password: '123456' });

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
    const res = await request(app).get('/api/reports?month=6&year=2026');
    expect(res.status).toBe(401);
  });

  it('2. Deve rejeitar a requisição sem os parâmetros month e year (400)', async () => {
    const res = await request(app)
      .get('/api/reports')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('3. Deve retornar a estrutura consolidada do relatório com sucesso (200)', async () => {
    const res = await request(app)
      .get('/api/reports?month=6&year=2026')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('summary');
    expect(res.body).toHaveProperty('expenseByCategory');
    
    // Validando os dados da resposta
    expect(res.body.period.month).toBe(6);
    expect(res.body.period.year).toBe(2026);
    expect(typeof res.body.summary.totalIncome).toBe('number');
    expect(typeof res.body.summary.totalExpense).toBe('number');
    expect(Array.isArray(res.body.expenseByCategory)).toBe(true);
  });
});