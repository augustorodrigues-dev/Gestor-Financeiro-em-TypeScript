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

const prismaMock = prisma as unknown as { account: Record<string, jest.Mock> };

describe('Unitário: AccountService', () => {
  const service = new AccountService();

  beforeEach(() => jest.clearAllMocks());

  describe('createAccount', () => {
    it('cria conta usando o saldo informado', async () => {
      prismaMock.account.create.mockResolvedValue({ id: 1, name: 'Nubank' });
      await service.createAccount(7, { name: 'Nubank', type: 'CORRENTE', balance: 100 });
      expect(prismaMock.account.create).toHaveBeenCalledWith({
        data: { name: 'Nubank', type: 'CORRENTE', balance: 100, userId: 7 },
      });
    });

    it('usa saldo 0 quando não informado', async () => {
      prismaMock.account.create.mockResolvedValue({ id: 2 });
      await service.createAccount(7, { name: 'Carteira', type: 'CARTEIRA' });
      expect(prismaMock.account.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ balance: 0 }) })
      );
    });
  });

  describe('getAccountsByUser', () => {
    it('lista contas do usuário com contagem de transações', async () => {
      prismaMock.account.findMany.mockResolvedValue([{ id: 1 }]);
      const accounts = await service.getAccountsByUser(7);
      expect(prismaMock.account.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 7 } })
      );
      expect(accounts).toHaveLength(1);
    });
  });

  describe('updateAccount', () => {
    it('atualiza quando a conta pertence ao usuário', async () => {
      prismaMock.account.findFirst.mockResolvedValue({ id: 3, userId: 7 });
      prismaMock.account.update.mockResolvedValue({ id: 3, name: 'Editado' });
      const result = await service.updateAccount(3, 7, { name: 'Editado' });
      expect(result.name).toBe('Editado');
    });

    it('lança erro quando a conta não pertence ao usuário', async () => {
      prismaMock.account.findFirst.mockResolvedValue(null);
      await expect(service.updateAccount(3, 7, { name: 'x' })).rejects.toThrow(
        'Conta não encontrada ou acesso negado.'
      );
      expect(prismaMock.account.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteAccount', () => {
    it('exclui quando não há transações vinculadas', async () => {
      prismaMock.account.findFirst.mockResolvedValue({ id: 4, _count: { transactions: 0 } });
      prismaMock.account.delete.mockResolvedValue({ id: 4 });
      await service.deleteAccount(4, 7);
      expect(prismaMock.account.delete).toHaveBeenCalledWith({ where: { id: 4 } });
    });

    it('bloqueia exclusão quando há transações vinculadas (regra UC03)', async () => {
      prismaMock.account.findFirst.mockResolvedValue({ id: 4, _count: { transactions: 3 } });
      await expect(service.deleteAccount(4, 7)).rejects.toThrow('Exclusão bloqueada');
      expect(prismaMock.account.delete).not.toHaveBeenCalled();
    });

    it('lança erro quando a conta não existe', async () => {
      prismaMock.account.findFirst.mockResolvedValue(null);
      await expect(service.deleteAccount(99, 7)).rejects.toThrow('Conta não encontrada.');
    });
  });
});
