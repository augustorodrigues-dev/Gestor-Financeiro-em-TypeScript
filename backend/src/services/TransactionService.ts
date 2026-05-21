import { prisma } from '../prisma';

interface CreateTransactionDTO {
  amount: number;
  date: Date;
  dueDate?: Date;
  description: string;
  type: string;
  accountId: number;
  categoryId?: number;
  creditCardId?: number;
  budgetId?: number;
  isCleared?: boolean;
  isRecurring?: boolean;
  recurrencePeriod?: string;
}

export class TransactionService {
  
  async createTransaction(data: CreateTransactionDTO) {
    return await prisma.$transaction(async (tx) => {
      const novaTransacao = await tx.transaction.create({ data });

      const amount = Number(data.amount);
      const impactoSaldo = data.type === 'EXPENSE' ? -amount : amount;

      const accountId = Number(data.accountId);

      await tx.account.update({
        where: { id: accountId },
        data: { balance: { increment: impactoSaldo } }
      });

      return novaTransacao;
    });
  }

  async getTransactionsByUser(userId: number) {
    return await prisma.transaction.findMany({
      where: {
        account: { userId: Number(userId) }
      },
      orderBy: { date: 'desc' },
    });
  }

  async updateTransaction(id: number, data: Partial<CreateTransactionDTO>) {
    return await prisma.$transaction(async (tx) => {
      const transacaoAntiga = await tx.transaction.findUnique({ where: { id: Number(id) } });
      if (!transacaoAntiga) throw new Error("Transação não encontrada.");

      const amountAntigo = Number(transacaoAntiga.amount);
      const amountNovo = data.amount !== undefined ? Number(data.amount) : amountAntigo;

      const typeAntigo = transacaoAntiga.type;
      const typeNovo = data.type || typeAntigo;

      const valorLiquidoAntigo = typeAntigo === 'EXPENSE' ? -amountAntigo : amountAntigo;
      const valorLiquidoNovo = typeNovo === 'EXPENSE' ? -amountNovo : amountNovo;

      const diferencaSaldo = valorLiquidoNovo - valorLiquidoAntigo;

      const accountIdAlvo = data.accountId !== undefined ? Number(data.accountId) : Number(transacaoAntiga.accountId);

      if (diferencaSaldo !== 0) {
        await tx.account.update({
          where: { id: accountIdAlvo },
          data: { balance: { increment: diferencaSaldo } }
        });
      }

      return await tx.transaction.update({
        where: { id: Number(id) },
        data
      });
    });
  }

  async deleteTransaction(id: number) {
    return await prisma.$transaction(async (tx) => {
      const transacao = await tx.transaction.findUnique({ where: { id: Number(id) } });
      if (!transacao) throw new Error("Transação não encontrada.");

      const amount = Number(transacao.amount);
      const accountId = Number(transacao.accountId);

      const estornoSaldo = transacao.type === 'EXPENSE' ? amount : -amount;

      await tx.account.update({
        where: { id: accountId },
        data: { balance: { increment: estornoSaldo } }
      });

      return await tx.transaction.delete({ where: { id: Number(id) } });
    });
  }
}