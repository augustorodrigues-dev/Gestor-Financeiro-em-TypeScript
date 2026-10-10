import { prisma } from '../prisma';

type ClienteCartao = Pick<typeof prisma, 'creditCard' | '$queryRaw'>;

export class CreditCardService {
  
  async createCard(data: { name: string; limitAmount: number; closingDay: number; dueDay: number; userId: number }) {
    return await prisma.creditCard.create({
      data: {
        name: data.name,
        limitAmount: data.limitAmount, 
        closingDay: data.closingDay,
        dueDay: data.dueDay,
        userId: data.userId
      }
    });
  }

  async getCardsByUser(userId: number, db: ClienteCartao = prisma) {
    const cards = await db.creditCard.findMany({
      where: { userId }
    });

    if (cards.length === 0) {
      return [];
    }

    const grupos = await db.$queryRaw<{ creditCardId: number | bigint; soma: string | null }[]>`
      SELECT t.creditcard_id AS creditCardId, CAST(SUM(t.amount) AS TEXT) AS soma
      FROM transacao t
      JOIN cartaocredito c ON c.creditcard_id = t.creditcard_id
      WHERE c.user_id = ${userId}
      GROUP BY t.creditcard_id
    `;

    const faturaPorCartao = new Map<number, number>();
    for (const grupo of grupos) {
      faturaPorCartao.set(Number(grupo.creditCardId), Number(grupo.soma ?? 0));
    }

    return cards.map(card => {
      const limiteTotal = Number(card.limitAmount);

      const currentInvoice = faturaPorCartao.get(card.id) ?? 0;
      const availableLimit = limiteTotal - currentInvoice;

      return {
        id: card.id,
        name: card.name,
        limitAmount: limiteTotal,
        closingDay: card.closingDay,
        dueDay: card.dueDay,
        userId: card.userId,
        currentInvoice,
        availableLimit
      };
    });
  }

  async updateCard(id: number, data: { limitAmount?: number; closingDay?: number; dueDay?: number; name?: string }) {
    return await prisma.creditCard.update({
      where: { id },
      data: {
        name: data.name,
        limitAmount: data.limitAmount ? data.limitAmount : undefined, 
        closingDay: data.closingDay ? Number(data.closingDay) : undefined,
        dueDay: data.dueDay ? Number(data.dueDay) : undefined,
      }
    });
  }

  async deleteCard(id: number) {
    const card = await prisma.creditCard.findUnique({
      where: { id },
      include: { transactions: true }
    });

    if (!card) throw new Error("Cartão não encontrado.");

    if (card.transactions.length > 0) {
      throw new Error("Não é possível excluir um cartão com faturas pendentes ou histórico ativo.");
    }

    return await prisma.creditCard.delete({
      where: { id }
    });
  }
}
