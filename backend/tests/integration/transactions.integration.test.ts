import request from 'supertest';
import { app } from '../../src/server';
import { prisma } from '../../src/prisma';

describe('Integração: CRUD de Transações', () => {
  let transacaoCriadaId: number;
  let tokenAuth: string;
  let contaUsadaId: number;
  let categoriaUsadaId: number | undefined;

  beforeAll(async () => {
    const loginResponse = await request(app)
      .post('/api/users/login')
      .send({
        email: 'jadao@gmail.com',
        password: '1234'
      });

    tokenAuth = loginResponse.body.token;

    if (!tokenAuth) {
      const registerResponse = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Cobaia Transacao',
          email: 'test_trx_user@financeflow.com',
          password: '1234'
        });
      tokenAuth = registerResponse.body.token;
    }

    if (!tokenAuth) {
      throw new Error("Falha crítica: O token de autenticação não foi extraído. Resposta do login: " + JSON.stringify(loginResponse.body));
    }
    
    console.log("Token extraído com sucesso:", tokenAuth);
  });

  it('1. Deve criar uma nova transação válida', async () => {
    const [contasRes, catRes] = await Promise.all([
      request(app).get('/api/accounts').set('Authorization', `Bearer ${tokenAuth}`),
      request(app).get('/api/categories').set('Authorization', `Bearer ${tokenAuth}`)
    ]);

    contaUsadaId = contasRes.body[0]?.id;
    categoriaUsadaId = catRes.body[0]?.id;

    expect(contaUsadaId).toBeDefined();

    const novaTransacao = {
      description: 'Teste Automatizado - Supermercado',
      amount: 150.5,
      type: 'EXPENSE',
      accountId: contaUsadaId,
      categoryId: categoriaUsadaId,
      date: '2026-05-20'
    };

    const response = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${tokenAuth}`) 
      .send(novaTransacao);

    expect(response.status).toBe(201); 
    transacaoCriadaId = response.body.id; 
  });

  it('2. Deve barrar a criação com erro 400 (dados inválidos)', async () => {
    const transacaoInvalida = {
      description: 'Compra sem valor',
      type: 'EXPENSE'
    };

    const response = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${tokenAuth}`)
      .send(transacaoInvalida);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('3. Deve listar as transações do usuário', async () => {
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
      amount: 240,
      type: 'EXPENSE',
      accountId: contaUsadaId,
      categoryId: categoriaUsadaId,
      date: '2026-05-20'
    };

    const response = await request(app)
      .put(`/api/transactions/${transacaoCriadaId}`)
      .set('Authorization', `Bearer ${tokenAuth}`)
      .send(dadosAtualizados);

    expect(response.status).toBe(200);
    const transacaoRetornada = response.body.transaction || response.body;
    expect(Number(transacaoRetornada.amount)).toBe(240);
  });

  it('5. Deve apagar a transação recém-criada', async () => {
    expect(transacaoCriadaId).toBeDefined();

    const response = await request(app)
      .delete(`/api/transactions/${transacaoCriadaId}`)
      .set('Authorization', `Bearer ${tokenAuth}`);

    expect(response.status).toBe(200);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});