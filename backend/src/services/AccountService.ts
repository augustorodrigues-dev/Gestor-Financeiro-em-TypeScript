import { prisma } from '../prisma';

export class AccountService {
  // CREATE
  async createAccount(userId: number, data: { name: string; type: string; balance?: number }) {
    return await prisma.account.create({
      data: {
        ...data,
        balance: data.balance || 0,
        userId,
      },
    });
  }

  // READ (Listar contas do usuário logado)
  async getAccountsByUser(userId: number) {
    return await prisma.account.findMany({
      where: { userId },
      include: {
        _count: {
          select: { transactions: true } // Traz a contagem de transações para ajudar no Front-end
        }
      }
    });
  }

  // UPDATE
  async updateAccount(accountId: number, userId: number, data: { name?: string; type?: string }) {
    // Verifica se a conta pertence ao usuário antes de atualizar
    const account = await prisma.account.findFirst({ where: { id: accountId, userId } });
    if (!account) throw new Error('Conta não encontrada ou não pertence a este usuário.');

    return await prisma.account.update({
      where: { id: accountId },
      data,
    });
  }

  // DELETE (Com a trava de segurança do UC03)
  async deleteAccount(accountId: number, userId: number) {
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId },
      include: { _count: { select: { transactions: true } } }
    });

    if (!account) throw new Error('Conta não encontrada.');

    // Regra de Negócio: Fluxo Alternativo do UC03
    if (account._count.transactions > 0) {
      throw new Error('Exclusão bloqueada: Esta conta possui transações vinculadas. Exclua as transações primeiro.');
    }

    return await prisma.account.delete({
      where: { id: accountId },
    });
  }
}