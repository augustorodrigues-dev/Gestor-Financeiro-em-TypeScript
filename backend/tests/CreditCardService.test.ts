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
    },
  },
}));

describe('Testes Unitários: CreditCardService', () => {
  const creditCardService = new CreditCardService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('1. Deve criar um cartão de crédito persistindo os dados informados', async () => {
    (prisma.creditCard.create as jest.Mock).mockResolvedValue({ id: 1, name: 'Visa' });

    await creditCardService.createCard({ name: 'Visa', limitAmount: 5000, closingDay: 10, dueDay: 15, userId: 1 });

    expect(prisma.creditCard.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: 'Visa', limitAmount: 5000, userId: 1 }),
      }),
    );
  });

  it('2. Deve calcular corretamente a fatura atual e o limite disponível', async () => {
    (prisma.creditCard.findMany as jest.Mock).mockResolvedValue([
      {
        id: 1, name: 'Cartão Black', limitAmount: 5000, closingDay: 5, dueDay: 10, userId: 1,
        transactions: [{ amount: 150 }, { amount: 350 }],
      },
    ]);

    const result = await creditCardService.getCardsByUser(1);

    expect(result[0].currentInvoice).toBe(500);
    expect(result[0].availableLimit).toBe(4500);
  });

  it('3. Deve atualizar os dados de um cartão existente', async () => {
    (prisma.creditCard.update as jest.Mock).mockResolvedValue({ id: 1, name: 'Visa Gold' });

    await creditCardService.updateCard(1, { name: 'Visa Gold', limitAmount: 7500, closingDay: 8, dueDay: 18 });

    expect(prisma.creditCard.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 } }),
    );
  });

  it('4. Deve barrar a exclusão de um cartão que possua faturas pendentes', async () => {
    (prisma.creditCard.findUnique as jest.Mock).mockResolvedValue({
      id: 1, name: 'Cartão Cancelado', transactions: [{ id: 10, amount: 50 }],
    });

    await expect(creditCardService.deleteCard(1))
      .rejects.toThrow('Não é possível excluir um cartão com faturas pendentes ou histórico ativo.');

    expect(prisma.creditCard.delete).not.toHaveBeenCalled();
  });

  it('5. Deve lançar erro ao excluir um cartão inexistente', async () => {
    (prisma.creditCard.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(creditCardService.deleteCard(123)).rejects.toThrow('Cartão não encontrado.');
  });

  it('6. Deve excluir o cartão com sucesso se a fatura estiver zerada', async () => {
    (prisma.creditCard.findUnique as jest.Mock).mockResolvedValue({ id: 2, transactions: [] });
    (prisma.creditCard.delete as jest.Mock).mockResolvedValue({ id: 2 });

    await creditCardService.deleteCard(2);

    expect(prisma.creditCard.delete).toHaveBeenCalledWith({ where: { id: 2 } });
  });
});
