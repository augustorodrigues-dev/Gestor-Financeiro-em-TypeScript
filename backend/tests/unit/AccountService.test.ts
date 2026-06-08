import { AccountService } from '../../src/services/AccountService';
import { prisma } from '../../src/prisma';

jest.mock('../../src/prisma', () => ({
  prisma: {
    account: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Testes Unitários: AccountService', () => {
  const accountService = new AccountService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('1. Deve criar uma conta usando saldo 0 como padrão quando não informado', async () => {
    (prisma.account.create as jest.Mock).mockResolvedValue({ id: 1, name: 'Nubank' });

    await accountService.createAccount(7, { name: 'Nubank', type: 'CORRENTE' });

    expect(prisma.account.create).toHaveBeenCalledWith({
      data: { name: 'Nubank', type: 'CORRENTE', balance: 0, userId: 7 },
    });
  });

  it('2. Deve listar as contas de um usuário com a contagem de transações', async () => {
    const mock = [{ id: 1, name: 'Inter', _count: { transactions: 3 } }];
    (prisma.account.findMany as jest.Mock).mockResolvedValue(mock);

    const result = await accountService.getAccountsByUser(7);

    expect(result).toEqual(mock);
    expect(prisma.account.findMany).toHaveBeenCalledTimes(1);
  });

  it('3. Deve bloquear a atualização de uma conta de outro usuário (acesso negado)', async () => {
    (prisma.account.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(accountService.updateAccount(1, 99, { name: 'Hack' }))
      .rejects.toThrow('Conta não encontrada ou acesso negado.');

    expect(prisma.account.update).not.toHaveBeenCalled();
  });

  it('4. Deve atualizar uma conta existente do próprio usuário', async () => {
    (prisma.account.findFirst as jest.Mock).mockResolvedValue({ id: 1, userId: 7 });
    (prisma.account.update as jest.Mock).mockResolvedValue({ id: 1, name: 'Inter Black' });

    const result = await accountService.updateAccount(1, 7, { name: 'Inter Black' });

    expect(result.name).toBe('Inter Black');
    expect(prisma.account.update).toHaveBeenCalledTimes(1);
  });

  it('5. Deve bloquear a exclusão de uma conta inexistente', async () => {
    (prisma.account.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(accountService.deleteAccount(1, 7))
      .rejects.toThrow('Conta não encontrada.');
  });

  it('6. Deve bloquear a exclusão de conta que possui transações vinculadas', async () => {
    (prisma.account.findFirst as jest.Mock).mockResolvedValue({
      id: 1, userId: 7, _count: { transactions: 5 },
    });

    await expect(accountService.deleteAccount(1, 7))
      .rejects.toThrow('Exclusão bloqueada: Esta conta possui transações vinculadas. Exclua as transações primeiro.');

    expect(prisma.account.delete).not.toHaveBeenCalled();
  });

  it('7. Deve excluir uma conta sem transações vinculadas', async () => {
    (prisma.account.findFirst as jest.Mock).mockResolvedValue({
      id: 1, userId: 7, _count: { transactions: 0 },
    });
    (prisma.account.delete as jest.Mock).mockResolvedValue({ id: 1 });

    await accountService.deleteAccount(1, 7);

    expect(prisma.account.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
