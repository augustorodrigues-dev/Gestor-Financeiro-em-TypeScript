const mockCreateTransaction = jest.fn();
const mockGetTransactionsByUser = jest.fn();
const mockUpdateTransaction = jest.fn();
const mockDeleteTransaction = jest.fn();

jest.mock('../../src/services/TransactionService', () => ({
  TransactionService: jest.fn().mockImplementation(() => ({
    createTransaction: mockCreateTransaction,
    getTransactionsByUser: mockGetTransactionsByUser,
    updateTransaction: mockUpdateTransaction,
    deleteTransaction: mockDeleteTransaction,
  })),
}));

import { TransactionController } from '../../src/controllers/TransactionController';

const makeRes = () => {
  const res: any = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('Unitário: TransactionController', () => {
  const controller = new TransactionController();
  beforeEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('retorna 400 quando faltam campos obrigatórios', async () => {
      const res = makeRes();
      await controller.create({ body: { description: 'sem valor' } } as any, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('cria a transação e retorna 201', async () => {
      mockCreateTransaction.mockResolvedValue({ id: 1, description: 'Mercado' });
      const res = makeRes();
      await controller.create(
        { body: { amount: '150', description: 'Mercado', type: 'EXPENSE', accountId: '1', date: '2026-05-20' } } as any,
        res
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(mockCreateTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 150, accountId: 1, type: 'EXPENSE' })
      );
    });

    it('retorna 500 quando o service falha', async () => {
      mockCreateTransaction.mockRejectedValue(new Error('erro'));
      const res = makeRes();
      await controller.create(
        { body: { amount: '1', description: 'x', type: 'INCOME', accountId: '1', date: '2026-05-20' } } as any,
        res
      );
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('list', () => {
    it('retorna 200 com as transações', async () => {
      mockGetTransactionsByUser.mockResolvedValue([{ id: 1 }]);
      const res = makeRes();
      await controller.list({ user: { id: 7 } } as any, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('retorna 500 ao falhar', async () => {
      mockGetTransactionsByUser.mockRejectedValue(new Error('x'));
      const res = makeRes();
      await controller.list({ user: { id: 7 } } as any, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('update', () => {
    it('retorna 400 para id inválido', async () => {
      const res = makeRes();
      await controller.update({ params: { id: 'abc' }, body: {} } as any, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('atualiza e retorna 200', async () => {
      mockUpdateTransaction.mockResolvedValue({ id: 1 });
      const res = makeRes();
      await controller.update({ params: { id: '1' }, body: { amount: 10 } } as any, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('delete', () => {
    it('retorna 400 para id inválido', async () => {
      const res = makeRes();
      await controller.delete({ params: { id: 'abc' } } as any, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('exclui e retorna 200', async () => {
      mockDeleteTransaction.mockResolvedValue({ id: 1 });
      const res = makeRes();
      await controller.delete({ params: { id: '1' } } as any, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
