import request from 'supertest';
import { app } from '../src/server';

describe('Integração: CRUD de Transações', () => {
  let transacaoCriadaId: number;

  it('1. Deve criar uma nova transação válida no banco de dados', async () => {
    const novaTransacao = {
      description: 'Teste Automatizado - Supermercado',
      amount: 150.50,
      type: 'EXPENSE',
      accountId: 1, 
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

  it('2. Deve barrar a criação e retornar erro 400 ao enviar dados inválidos', async () => {
    const transacaoInvalida = {
      description: 'Compra sem valor',
      type: 'EXPENSE',
      date: '2026-05-20'
    };

    const response = await request(app)
      .post('/api/transactions')
      .send(transacaoInvalida);

    expect(response.status).toBe(400); 
    expect(response.body).toHaveProperty('error');
  });

  it('3. Deve listar as transações do usuário (Read)', async () => {
    const response = await request(app).get('/api/transactions/user/1');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true); 
  });

  it('4. Deve atualizar o valor da transação recém-criada', async () => {
    const dadosAtualizados = {
      amount: 240.00 
    };

    const response = await request(app)
      .put(`/api/transactions/${transacaoCriadaId}`)
      .send(dadosAtualizados);

    expect(response.status).toBe(200);
    expect(Number(response.body.amount || response.body.updatedTransaction?.amount)).toBe(240.00);
  });

  it('5. Deve apagar a transação recém-criada (Delete)', async () => {
    const response = await request(app).delete(`/api/transactions/${transacaoCriadaId}`);
    
    expect(response.status).toBe(200);
    
    transacaoCriadaId = 0; 
  });

  afterAll(async () => {
    if (transacaoCriadaId) {
      await request(app).delete(`/api/transactions/${transacaoCriadaId}`);
    }
  });
});