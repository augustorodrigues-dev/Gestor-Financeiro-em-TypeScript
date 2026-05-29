import { CreditCardService } from '../src/services/CreditCardService';
import { prisma } from '../src/prisma';

jest.mock('../src/prisma', () => ({
  prisma: {
    creditCard: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    }
  }
}));

describe('Testes Unitários: CreditCardService', () => {
  const creditCardService = new CreditCardService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('1. Deve calcular corretamente a fatura atual e o limite disponível', async () => {
    const mockCards = [
      {
        id: 1,
        name: 'Cartão Black',
        limitAmount: 5000,
        closingDay: 5,
        dueDay: 10,
        userId: 1, 
        transactions: [
          { amount: 150.00 },
          { amount: 350.00 }
        ]
      }
    ];

    (prisma.creditCard.findMany as jest.Mock).mockResolvedValue(mockCards);

    const result = await creditCardService.getCardsByUser(1);

    expect(result[0].currentInvoice).toBe(500.00); 
    expect(result[0].availableLimit).toBe(4500.00); 
  });

  it('2. Deve barrar a exclusão de um cartão que possua faturas pendentes', async () => {
    const mockCardWithTransactions = {
      id: 1,
      name: 'Cartão Cancelado',
      transactions: [{ id: 10, amount: 50 }] 
    };

    (prisma.creditCard.findUnique as jest.Mock).mockResolvedValue(mockCardWithTransactions);

    await expect(creditCardService.deleteCard(1)).rejects.toThrow("Não é possível excluir um cartão com faturas pendentes ou histórico ativo.");
    
    expect(prisma.creditCard.delete).not.toHaveBeenCalled();
  });

  it('3. Deve excluir o cartão com sucesso se a fatura estiver zerada', async () => {
    const mockCardEmpty = {
      id: 2,
      transactions: [] 
    };

    (prisma.creditCard.findUnique as jest.Mock).mockResolvedValue(mockCardEmpty);
    (prisma.creditCard.delete as jest.Mock).mockResolvedValue(mockCardEmpty);

    await creditCardService.deleteCard(2);

    expect(prisma.creditCard.delete).toHaveBeenCalledWith({ where: { id: 2 } });
  });
});