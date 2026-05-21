import { prisma } from '../prisma';

interface CreateAccountDTO {
  name: string;      
  balance?: number; 
  type: string; 
  userId: number;    
}

export class AccountService {
  async createAccount(data: CreateAccountDTO) {
    return await prisma.account.create({
      data: {
        name: data.name,
        balance: data.balance ?? 0.0,
        type: data.type,
        userId: data.userId
      }
    });
  }

  async getAccountsByUser(userId: number) {
    return await prisma.account.findMany({
      where: { userId },
      orderBy: { name: 'asc' }
    });
  }

  async updateAccount(id: number, data: Partial<CreateAccountDTO>) {
    return await prisma.account.update({
      where: { id },
      data
    });
  }

  async deleteAccount(id: number) {
    const accountWithTransactions = await prisma.account.findUnique({
      where: { id },
      include: { _count: { select: { transactions: true } } }
    });

    if (accountWithTransactions && accountWithTransactions._count.transactions > 0) {
      throw new Error("Não é possível excluir uma conta que possui transações vinculadas.");
    }

    return await prisma.account.delete({
      where: { id }
    });
  }
}