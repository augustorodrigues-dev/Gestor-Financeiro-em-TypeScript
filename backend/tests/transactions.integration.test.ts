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
    
    transacaoCriadaId = response.body.id; 
  });

  it('Deve FALHAR de propósito para mostrar o erro do Jest no terminal', async () => {
    const transacaoInvalida = {
      description: 'Compra sem valor',
      type: 'EXPENSE',
      date: '2026-05-20'
    };

    const response = await request(app)
      .post('/api/transactions')
      .send(transacaoInvalida);

    expect(response.status).toBe(201); 
  });

  it('Deve listar as transações do usuário', async () => {
    const response = await request(app).get('/api/transactions/user/1');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true); 
  });

  it('Deve atualizar o valor da transação recém-criada', async () => {
    const dadosAtualizados = {
      amount: 240.00 
    };

    const response = await request(app)
      .put(`/api/transactions/${transacaoCriadaId}`)
      .send(dadosAtualizados);

    expect(response.status).toBe(200);
    expect(Number(response.body.amount)).toBe(240.00);
  });

  afterAll(async () => {
    if (transacaoCriadaId) {
      await request(app).delete(`/api/transactions/${transacaoCriadaId}`);
    }
  });
});