import { prisma } from '../prisma';

export class CreditCardService {
  
  async createCard(data: { name: string; limitAmount: number; closingDay: number; dueDay: number; userId: number }) {
    return await prisma.creditCard.create({
      data: {
        name: data.name,
        limitAmount: data.limitAmount, // 🚀 Ajustado para o nome do seu schema
        closingDay: data.closingDay,
        dueDay: data.dueDay,
        userId: data.userId
      }
    });
  }

  async getCardsByUser(userId: number) {
    const cards = await prisma.creditCard.findMany({
      where: { userId },
      include: {
        // Traz as transações vinculadas a este cartão para calcularmos a fatura atual
        transactions: {
          where: { isCleared: false } // Apenas compras que ainda não foram pagas
        }
      }
    });

    // Recalcula os limites conforme exigido no fluxo principal do UC08
    return cards.map(card => {
      // Como limitAmount é Decimal, convertemos para número aqui
      const limiteTotal = Number(card.limitAmount);
      
      const currentInvoice = card.transactions.reduce((acc, tx) => acc + Number(tx.amount), 0);
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
        limitAmount: data.limitAmount ? data.limitAmount : undefined, // 🚀 Ajustado para o seu schema
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

    // Regra do UC08: Histórico é mantido. Se houver transações pendentes, bloqueia a exclusão física.
    if (card.transactions.length > 0) {
      throw new Error("Não é possível excluir um cartão com faturas pendentes ou histórico ativo.");
    }

    return await prisma.creditCard.delete({
      where: { id }
    });
  }
}