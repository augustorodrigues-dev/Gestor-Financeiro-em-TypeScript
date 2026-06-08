import request from 'supertest';
import { app } from '../../src/server';
import { prisma } from '../../src/prisma';

describe('Integração: Endpoints do Servidor (Saldo Consolidado e API Externa)', () => {
  let token: string;
  let userId: number;

  beforeAll(async () => {
    const email = `saldo_user_${Date.now()}@financeflow.com`;
    const registerRes = await request(app)
      .post('/api/users/register')
      .send({ name: 'Investidor', email, password: '123456' });

    token = registerRes.body.token;
    userId = registerRes.body.user.id;

    // Cria duas contas com saldos conhecidos (100 + 50 = 150).
    await request(app).post('/api/accounts').set('Authorization', `Bearer ${token}`)
      .send({ name: 'Conta A', type: 'CORRENTE', balance: 100 });
    await request(app).post('/api/accounts').set('Authorization', `Bearer ${token}`)
      .send({ name: 'Conta B', type: 'POUPANCA', balance: 50 });
  });

  afterAll(async () => {
    await prisma.account.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('1. Deve calcular o saldo consolidado (soma das contas) do usuário', async () => {
    const res = await request(app).get(`/api/balance/user/${userId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Number(res.body.balance)).toBe(150);
  });

  it('2. Deve retornar 400 quando o ID do usuário for inválido', async () => {
    const res = await request(app).get('/api/balance/user/abc');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('3. Deve consultar as instituições financeiras via Brasil API (integração externa)', async () => {
    const res = await request(app).get('/api/banks');

    // Robusto a oscilações de rede: valida o contrato em ambos os caminhos.
    if (res.status === 200) {
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.banks)).toBe(true);
    } else {
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error');
    }
  });
});
