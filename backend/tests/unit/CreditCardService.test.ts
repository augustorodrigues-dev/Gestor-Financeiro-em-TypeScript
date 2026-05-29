import { CreditCardService } from '../../src/services/CreditCardService';
import { prisma } from '../../src/prisma';

jest.mock('../../src/prisma', () => ({
  prisma: {
    creditCard: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const prismaMock = prisma as unknown as { creditCard: Record<string, jest.Mock> };

describe('Unitário: CreditCardService', () => {
  const service = new CreditCardService();
  beforeEach(() => jest.clearAllMocks());

  it('cria cartão vinculado ao usuário', async () => {
    prismaMock.creditCard.create.mockResolvedValue({ id: 1 });
    await service.createCard(7, { name: 'Nubank', limitAmount: 5000, closingDay: 20, dueDay: 28 });
    expect(prismaMock.creditCard.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: 7, limitAmount: 5000 }) })
    );
  });

  it('calcula uso e marca crítico quando >= 80% (UC20)', async () => {
    prismaMock.creditCard.findMany.mockResolvedValue([
      { id: 1, name: 'C', limitAmount: 1000, transactions: [{ amount: 850 }] },
    ]);
    const cards = await service.getCardsByUser(7);
    expect(cards[0].used).toBe(850);
    expect(cards[0].usagePercent).toBe(85);
    expect(cards[0].critical).toBe(true);
  });

  it('não marca crítico abaixo de 80%', async () => {
    prismaMock.creditCard.findMany.mockResolvedValue([
      { id: 1, name: 'C', limitAmount: 1000, transactions: [{ amount: 100 }] },
    ]);
    const cards = await service.getCardsByUser(7);
    expect(cards[0].critical).toBe(false);
  });

  it('atualiza cartão do dono', async () => {
    prismaMock.creditCard.findFirst.mockResolvedValue({ id: 1, userId: 7 });
    prismaMock.creditCard.update.mockResolvedValue({ id: 1 });
    await service.updateCard(1, 7, { name: 'Novo' });
    expect(prismaMock.creditCard.update).toHaveBeenCalled();
  });

  it('nega update de cartão de terceiro', async () => {
    prismaMock.creditCard.findFirst.mockResolvedValue(null);
    await expect(service.updateCard(1, 7, {})).rejects.toThrow('acesso negado');
  });

  it('exclui cartão existente', async () => {
    prismaMock.creditCard.findFirst.mockResolvedValue({ id: 1 });
    prismaMock.creditCard.delete.mockResolvedValue({ id: 1 });
    await service.deleteCard(1, 7);
    expect(prismaMock.creditCard.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('erro ao excluir cartão inexistente', async () => {
    prismaMock.creditCard.findFirst.mockResolvedValue(null);
    await expect(service.deleteCard(1, 7)).rejects.toThrow('não encontrado');
  });
});
