import { prisma } from '../prisma';

export class TransactionService {
  
  // POST: Criar transação
  async createTransaction(data: { amount: number; description: string; type: string; accountId: number; date: Date }) {
    return await prisma.transaction.create({
      data,
    });
  }

  // GET: Buscar transações de um usuário (via conta)
  async getTransactionsByUser(userId: number) {
    return await prisma.transaction.findMany({
      where: {
        account: {
          userId: userId
        }
      },
      include: {
        account: true // Traz os dados da conta junto
      },
      orderBy: {
        date: 'desc'
      }
    });
  }

  // PUT: Atualizar transação
  async updateTransaction(id: number, data: any) {
    return await prisma.transaction.update({
      where: { id },
      data,
    });
  }

  // DELETE: Apagar transação
  async deleteTransaction(id: number) {
    return await prisma.transaction.delete({
      where: { id },
    });
  }
}