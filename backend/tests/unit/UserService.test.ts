import { UserService } from '../../src/services/UserService';
import { prisma } from '../../src/prisma';
import bcrypt from 'bcrypt';

jest.mock('../../src/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    account: { deleteMany: jest.fn() },
    transaction: { deleteMany: jest.fn() },
  },
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(async () => 'hashed_pw'),
  compare: jest.fn(),
}));

const prismaMock = prisma as unknown as {
  user: Record<string, jest.Mock>;
  account: Record<string, jest.Mock>;
  transaction: Record<string, jest.Mock>;
};

describe('Unitário: UserService', () => {
  const service = new UserService();

  beforeEach(() => jest.clearAllMocks());

  describe('getUserByEmail', () => {
    it('retorna o usuário encontrado pelo e-mail', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 1, email: 'a@b.com' });
      const user = await service.getUserByEmail('a@b.com');
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: 'a@b.com' } });
      expect(user).toEqual({ id: 1, email: 'a@b.com' });
    });
  });

  describe('createUser', () => {
    it('cria um usuário novo com a senha criptografada', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({ id: 2, name: 'Ana', email: 'ana@x.com', role: 'USER' });

      const result = await service.createUser({ name: 'Ana', email: 'ana@x.com', password: '1234' });

      expect(bcrypt.hash).toHaveBeenCalledWith('1234', 10);
      expect(prismaMock.user.create).toHaveBeenCalled();
      expect(result).toMatchObject({ id: 2, role: 'USER' });
    });

    it('lança erro quando o e-mail já existe', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 9, email: 'dup@x.com' });
      await expect(
        service.createUser({ name: 'Dup', email: 'dup@x.com', password: '1' })
      ).rejects.toThrow('Este e-mail já está cadastrado no sistema.');
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it('usa hash vazio quando nenhuma senha é informada', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({ id: 3 });
      await service.createUser({ name: 'Sem Senha', email: 's@x.com' });
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('getAllUsers', () => {
    it('retorna a lista de usuários', async () => {
      prismaMock.user.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      const users = await service.getAllUsers();
      expect(users).toHaveLength(2);
    });
  });

  describe('updateUser', () => {
    it('atualiza nome e role', async () => {
      prismaMock.user.update.mockResolvedValue({ id: 1, name: 'Novo', role: 'ADMIN' });
      const result = await service.updateUser(1, { name: 'Novo', role: 'ADMIN' });
      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } })
      );
      expect(result.role).toBe('ADMIN');
    });
  });

  describe('deleteUser', () => {
    it('apaga transações, contas e o usuário em cascata', async () => {
      prismaMock.transaction.deleteMany.mockResolvedValue({ count: 2 });
      prismaMock.account.deleteMany.mockResolvedValue({ count: 1 });
      prismaMock.user.delete.mockResolvedValue({ id: 5 });

      await service.deleteUser(5);

      expect(prismaMock.transaction.deleteMany).toHaveBeenCalledWith({ where: { account: { userId: 5 } } });
      expect(prismaMock.account.deleteMany).toHaveBeenCalledWith({ where: { userId: 5 } });
      expect(prismaMock.user.delete).toHaveBeenCalledWith({ where: { id: 5 } });
    });
  });
});
