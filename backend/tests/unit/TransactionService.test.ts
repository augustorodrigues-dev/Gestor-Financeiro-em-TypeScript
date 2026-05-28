import { TransactionService } from '../../src/services/TransactionService';
import { prisma } from '../../src/prisma';

jest.mock('../../src/prisma', () => ({
  prisma: {
    transaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    account: { update: jest.fn() },
    $transaction: jest.fn(),
  },
}));

const prismaMock = prisma as unknown as {
  transaction: Record<string, jest.Mock>;
  account: Record<string, jest.Mock>;
  $transaction: jest.Mock;
};

describe('Unitário: TransactionService', () => {
  const service = new TransactionService();

  beforeEach(() => jest.clearAllMocks());

  describe('createTransaction', () => {
    it('incrementa o saldo positivamente para INCOME', async () => {
      prismaMock.$transaction.mockResolvedValue([{ id: 1, amount: 500 }, {}]);
      await service.createTransaction({
        amount: 500, description: 'Salário', type: 'INCOME', accountId: 1, date: new Date(),
      });
      // O segundo argumento do array é o account.update — captura via prisma.account.update
      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(prismaMock.account.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { balance: { increment: 500 } } })
      );
    });

    it('decrementa o saldo para EXPENSE (valor negativo)', async () => {
      prismaMock.$transaction.mockResolvedValue([{ id: 2 }, {}]);
      await service.createTransaction({
        amount: 200, description: 'Mercado', type: 'EXPENSE', accountId: 1, date: new Date(),
      });
      expect(prismaMock.account.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { balance: { increment: -200 } } })
      );
    });

    it('retorna a transação criada', async () => {
      prismaMock.$transaction.mockResolvedValue([{ id: 9, description: 'X' }, {}]);
      const result = await service.createTransaction({
        amount: 1, description: 'X', type: 'INCOME', accountId: 1, date: new Date(),
      });
      expect(result).toEqual({ id: 9, description: 'X' });
    });
  });

  describe('getTransactionsByUser', () => {
    it('busca transações filtrando pelas contas do usuário', async () => {
      prismaMock.transaction.findMany.mockResolvedValue([{ id: 1 }]);
      await service.getTransactionsByUser(7);
      expect(prismaMock.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { account: { userId: 7 } } })
      );
    });
  });

  describe('updateTransaction', () => {
    it('atualiza os campos da transação', async () => {
      prismaMock.transaction.update.mockResolvedValue({ id: 1, amount: 50 });
      await service.updateTransaction(1, { description: 'Y', amount: '50', type: 'EXPENSE', accountId: '1', date: '2026-05-01' });
      expect(prismaMock.transaction.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } })
      );
    });
  });

  describe('deleteTransaction', () => {
    it('apaga a transação pelo id', async () => {
      prismaMock.transaction.delete.mockResolvedValue({ id: 1 });
      await service.deleteTransaction(1);
      expect(prismaMock.transaction.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
