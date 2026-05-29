import { prisma } from '../prisma';

export class TransactionService {
  
  async createTransaction(data: { amount: number; description: string; type: string; accountId: number; date: Date; isRecurring?: boolean; recurrencePeriod?: string; dueDate?: Date }) {
    const amountToUpdate = data.type === 'INCOME' ? data.amount : -data.amount;

    const [newTransaction] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          amount: data.amount,
          description: data.description,
          type: data.type,
          accountId: data.accountId,
          date: data.date,
          isRecurring: data.isRecurring ?? false,
          recurrencePeriod: data.recurrencePeriod,
          dueDate: data.dueDate
        }
      }),
      prisma.account.update({
        where: { id: data.accountId },
        data: { balance: { increment: amountToUpdate } }
      })
    ]);

    return newTransaction;
  }

  // UC17 — Lista as transações agendadas/recorrentes do usuário
  async getScheduledTransactions(userId: number) {
    return await prisma.transaction.findMany({
      where: { isRecurring: true, account: { userId } },
      include: { account: { select: { name: true } } },
      orderBy: { date: 'desc' }
    });
  }

  async getTransactionsByUser(userId: number) {
    return await prisma.transaction.findMany({
      where: {
        account: {
          userId: userId
        }
      },
      include: {
        account: {
          select: { name: true, type: true } 
        }
      },
      orderBy: {
        date: 'desc' 
      }
    });
  }

  async updateTransaction(id: number, data: any) {
    return await prisma.transaction.update({
      where: { id },
      data: {
        description: data.description,
        amount: Number(data.amount),
        type: data.type,
        accountId: Number(data.accountId),
        date: data.date ? new Date(data.date) : undefined
      }
    });
  }

  async deleteTransaction(id: number) {
    return await prisma.transaction.delete({
      where: { id }
    });
  }
}