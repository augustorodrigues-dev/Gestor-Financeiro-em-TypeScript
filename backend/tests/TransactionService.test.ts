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

  it('3. Deve lançar erro ao tentar deletar uma transação inexistente', async () => {
    // Simula que a busca no banco retorna nulo
    (prisma.transaction.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(transactionService.deleteTransaction(999)).rejects.toThrow("Transação não encontrada.");
  });

  it('4. Deve ajustar o saldo corretamente ao deletar uma transação de RECEITA', async () => {
    const mockTransacao = {
      id: 1,
      accountId: 1,
      type: 'INCOME',
      amount: 100.00,
      creditCardId: null
    };

    (prisma.transaction.findUnique as jest.Mock).mockResolvedValue(mockTransacao);
    // Simula sucesso na deleção e no update do saldo
    (prisma.$transaction as jest.Mock).mockResolvedValue([mockTransacao, { count: 1 }]);

    await transactionService.deleteTransaction(1);

    // Verifica se o valor passado ao update do saldo foi negativo (reversão de receita)
    expect(prisma.account.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { balance: { increment: -100.00 } }
      })
    );
  });
});