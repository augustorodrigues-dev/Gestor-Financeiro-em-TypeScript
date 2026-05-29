import { prisma } from '../prisma';

export class AccountService {
  
  async createAccount(userId: number, data: { name: string; type: string; balance?: number }) {
    return await prisma.account.create({
      data: {
        name: data.name,
        type: data.type,
        balance: data.balance || 0, 
        userId: userId,
      },
    });
  }

  async getAccountsByUser(userId: number) {
    return await prisma.account.findMany({
      where: { userId: userId },
      include: {
        _count: {
          select: { transactions: true } 
        }
      },
      orderBy: {
        name: 'asc' 
      }
    });
  }

  async updateAccount(accountId: number, userId: number, data: { name?: string; type?: string }) {
    const account = await prisma.account.findFirst({ 
      where: { id: accountId, userId: userId } 
    });
    
    if (!account) {
      throw new Error('Conta não encontrada ou acesso negado.');
    }

    return await prisma.account.update({
      where: { id: accountId },
      data: {
        name: data.name,
        type: data.type
      },
    });
  }

  async deleteAccount(accountId: number, userId: number) {
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: userId },
      include: { 
        _count: { select: { transactions: true } } 
      }
    });

    if (!account) {
      throw new Error('Conta não encontrada.');
    }

    if (account._count.transactions > 0) {
      throw new Error('Exclusão bloqueada: Esta conta possui transações vinculadas. Exclua as transações primeiro.');
    }

    return await prisma.account.delete({
      where: { id: accountId },
    });
  }
}