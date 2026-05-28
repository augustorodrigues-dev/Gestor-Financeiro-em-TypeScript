import { prisma } from '../prisma';

export class AccountService {
  
  // ==========================================
  // CREATE: Cria uma nova conta bancária
  // ==========================================
  async createAccount(userId: number, data: { name: string; type: string; balance?: number }) {
    return await prisma.account.create({
      data: {
        name: data.name,
        type: data.type,
        // Se o front-end não mandar o saldo, ele começa zerado
        balance: data.balance || 0, 
        userId: userId,
      },
    });
  }

  // ==========================================
  // READ: Lista todas as contas de um usuário
  // ==========================================
  async getAccountsByUser(userId: number) {
    return await prisma.account.findMany({
      where: { userId: userId },
      include: {
        // Traz a contagem de transações junto para podermos mostrar no Front-end
        // e também ajuda a validar a exclusão visualmente
        _count: {
          select: { transactions: true } 
        }
      },
      orderBy: {
        name: 'asc' // Ordena por ordem alfabética para ficar bonito na tela
      }
    });
  }

  // ==========================================
  // UPDATE: Edita as informações da conta
  // ==========================================
  async updateAccount(accountId: number, userId: number, data: { name?: string; type?: string }) {
    // Primeiro, verifica se a conta realmente existe e se pertence a quem está logado
    const account = await prisma.account.findFirst({ 
      where: { id: accountId, userId: userId } 
    });
    
    if (!account) {
      throw new Error('Conta não encontrada ou acesso negado.');
    }

    // Se passou, faz o update no banco
    return await prisma.account.update({
      where: { id: accountId },
      data: {
        name: data.name,
        type: data.type
      },
    });
  }

  // ==========================================
  // DELETE: Exclui a conta (Com trava do UC03)
  // ==========================================
  async deleteAccount(accountId: number, userId: number) {
    // Busca a conta e verifica quantas transações ela tem
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: userId },
      include: { 
        _count: { select: { transactions: true } } 
      }
    });

    if (!account) {
      throw new Error('Conta não encontrada.');
    }

    // 🔴 REGRA DE NEGÓCIO: Fluxo Alternativo do UC03 
    if (account._count.transactions > 0) {
      throw new Error('Exclusão bloqueada: Esta conta possui transações vinculadas. Exclua as transações primeiro.');
    }

    // Se chegou até aqui (saldo e transações estão zerados), apaga do banco!
    return await prisma.account.delete({
      where: { id: accountId },
    });
  }
}