import request from 'supertest';
import { app } from '../src/server';

describe('Integração: CRUD de Transações', () => {
  let transacaoCriadaId: number;

  it('Deve criar uma nova transação válida no banco de dados', async () => {
    const novaTransacao = {
      description: 'Teste Automatizado - Supermercado',
      amount: 150.50,
      type: 'EXPENSE',
      date: '2026-05-20'
    };

    const response = await request(app)
      .post('/api/transactions')
      .send(novaTransacao);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.description).toBe('Teste Automatizado - Supermercado');
    expect(Number(response.body.amount)).toBe(150.50);

    transacaoCriadaId = response.body.id;
  });

  afterAll(async () => {
    if (transacaoCriadaId) {
      await request(app).delete(`/api/transactions/${transacaoCriadaId}`);
    }
  });
});