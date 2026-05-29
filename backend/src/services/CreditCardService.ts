import { prisma } from '../prisma';

export class CreditCardService {
  // CREATE — UC08
  async createCard(userId: number, data: { name: string; limitAmount: number; closingDay: number; dueDay: number }) {
    return await prisma.creditCard.create({
      data: {
        name: data.name,
        limitAmount: data.limitAmount,
        closingDay: data.closingDay,
        dueDay: data.dueDay,
        userId,
      },
    });
  }

  // READ — cartões do usuário + uso da fatura (soma das transações vinculadas)
  async getCardsByUser(userId: number) {
    const cards = await prisma.creditCard.findMany({
      where: { userId },
      include: { transactions: { select: { amount: true } } },
      orderBy: { name: 'asc' },
    });

    // Calcula o total usado e o percentual do limite (UC20)
    return cards.map((card) => {
      const used = card.transactions.reduce((acc: number, t: any) => acc + Number(t.amount), 0);
      const limit = Number(card.limitAmount);
      const usagePercent = limit > 0 ? Math.round((used / limit) * 100) : 0;
      const { transactions, ...rest } = card;
      return { ...rest, used, usagePercent, critical: usagePercent >= 80 };
    });
  }

  // UPDATE
  async updateCard(cardId: number, userId: number, data: { name?: string; limitAmount?: number; closingDay?: number; dueDay?: number }) {
    const card = await prisma.creditCard.findFirst({ where: { id: cardId, userId } });
    if (!card) throw new Error('Cartão não encontrado ou acesso negado.');

    return await prisma.creditCard.update({
      where: { id: cardId },
      data: {
        name: data.name,
        limitAmount: data.limitAmount,
        closingDay: data.closingDay,
        dueDay: data.dueDay,
      },
    });
  }

  // DELETE — UC08: histórico de transações é mantido (FK SetNull no schema)
  async deleteCard(cardId: number, userId: number) {
    const card = await prisma.creditCard.findFirst({ where: { id: cardId, userId } });
    if (!card) throw new Error('Cartão não encontrado.');
    return await prisma.creditCard.delete({ where: { id: cardId } });
  }
}
