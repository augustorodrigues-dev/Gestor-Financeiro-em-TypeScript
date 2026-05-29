import request from 'supertest';
import { app } from '../src/server';
import { prisma } from '../src/prisma';

describe('Integração: CRUD de Cartão de Crédito com Autenticação', () => {
  let usuarioValidoId: number;
  let tokenAutenticacao: string;
  let cartaoCriadoId: number;

  beforeAll(async () => {
    const emailDinamico = `user_card_${Date.now()}@financeflow.com`;
    const senhaAcesso = '123456';

    const usuarioResponse = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Dono do Cartão',
        email: emailDinamico,
        password: senhaAcesso
      });

    usuarioValidoId = usuarioResponse.body.user.id;

    const loginResponse = await request(app)
      .post('/api/users/login') 
      .send({
        email: emailDinamico,
        password: senhaAcesso
      });

    tokenAutenticacao = loginResponse.body.token || loginResponse.body.accessToken;
  });

  it('1. Deve criar um novo cartão de crédito com sucesso (UC08)', async () => {
    const novoCartao = {
      name: 'Visa Platinum',
      limitAmount: 5000,
      closingDay: 10,
      dueDay: 15,
      userId: usuarioValidoId
    };

    const response = await request(app)
      .post('/api/credit-cards')
      .set('Authorization', `Bearer ${tokenAutenticacao}`) 
      .send(novoCartao);

    expect([200, 201]).toContain(response.status);
    expect(response.body).toHaveProperty('id');
    
    cartaoCriadoId = response.body.id;
  });

  it('2. Deve listar os cartões autenticados calculando os limites', async () => {
    const response = await request(app)
      .get('/api/credit-cards') 
      .set('Authorization', `Bearer ${tokenAutenticacao}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('3. Deve atualizar o limite e as datas de um cartão existente', async () => {
    expect(cartaoCriadoId).toBeDefined();

    const dadosAtualizados = {
      name: 'Visa Platinum Atualizado',
      limitAmount: 7500,
      closingDay: 5
    };

    const response = await request(app)
      .put(`/api/credit-cards/${cartaoCriadoId}`)
      .set('Authorization', `Bearer ${tokenAutenticacao}`)
      .send(dadosAtualizados);

    expect(response.status).toBe(200);
  });

  it('4. Deve deletar o cartão de crédito se ele não tiver faturas', async () => {
    expect(cartaoCriadoId).toBeDefined();

    const response = await request(app)
      .delete(`/api/credit-cards/${cartaoCriadoId}`)
      .set('Authorization', `Bearer ${tokenAutenticacao}`);

    expect(response.status).toBe(200);
  });

  afterAll(async () => {
    if (cartaoCriadoId) {
      await prisma.creditCard.deleteMany({ where: { id: cartaoCriadoId } });
    }
    if (usuarioValidoId) {
      await prisma.transaction.deleteMany({ where: { account: { userId: usuarioValidoId } } });
      await prisma.account.deleteMany({ where: { userId: usuarioValidoId } });
      await prisma.user.delete({ where: { id: usuarioValidoId } });
    }
    await prisma.$disconnect();
  });
});