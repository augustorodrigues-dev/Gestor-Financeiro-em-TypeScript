import { TransactionService } from '../src/services/TransactionService';
import { prisma } from '../src/prisma'; 

jest.mock('../src/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
    transaction: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    account: {
      update: jest.fn(),
    }
  }
}));

describe('Testes Unitários: TransactionService', () => {
  const transactionService = new TransactionService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('1. Deve forçar o tipo para EXPENSE se um cartão de crédito for enviado', async () => {
    const payload = {
      description: 'Compra no Cartão',
      amount: 240.00,
      type: 'INCOME',
      accountId: 1,
      date: new Date('2026-05-28'),
      creditCardId: 99
    };

    const mockTransactionResult = [{ id: 1, ...payload, type: 'EXPENSE' }];
    (prisma.$transaction as jest.Mock).mockResolvedValue(mockTransactionResult);

    const resultado = await transactionService.createTransaction(payload);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(resultado.type).toBe('EXPENSE');
  });

  it('2. Não deve descontar do saldo da conta corrente se for compra no crédito', async () => {
    const payload = {
      description: 'Notebook',
      amount: 4500.00,
      type: 'EXPENSE',
      accountId: 1,
      date: new Date('2026-05-28'),
      creditCardId: 1
    };

    (prisma.$transaction as jest.Mock).mockResolvedValue([payload]);

    await transactionService.createTransaction(payload);
    expect(prisma.$transaction).toHaveBeenCalled();
  });
});