import { UserService } from '../src/services/UserService';
import { prisma } from '../src/prisma';

jest.mock('../src/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(), // <--- Certifique-se de que este está aqui!
    },
    transaction: {
      deleteMany: jest.fn(),
    },
    account: {
      deleteMany: jest.fn(),
    }
  },
}));

describe('Testes Unitários: UserService', () => {
  const userService = new UserService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('1. Deve lançar um erro se tentar cadastrar um e-mail duplicado', async () => {
    const payload = {
      name: 'Clone da Alexandra',
      email: 'alexandra@gmail.com',
      password: 'senha'
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 1, email: 'alexandra@gmail.com' });

    await expect(userService.createUser(payload)).rejects.toThrow("Este e-mail já está cadastrado no sistema.");
    
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('2. Deve permitir criar uma conta com a role ADMIN explicitamente', async () => {
    const payload = {
      name: 'Novo Admin',
      email: 'admin_test@financeflow.com',
      password: '1234',
      role: 'ADMIN' as const
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: 99,
      name: payload.name,
      email: payload.email,
      role: payload.role
    });

    const resultado = await userService.createUser(payload);

    expect(prisma.user.create).toHaveBeenCalledTimes(1);
    expect(resultado.role).toBe('ADMIN');
  });

  it('3. Deve deletar dependências em cascata ao remover um usuário', async () => {
    const userId = 42;

    (prisma.transaction.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });
    (prisma.account.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
    (prisma.user.delete as jest.Mock).mockResolvedValue({ id: userId, name: 'Deletado' });

    await userService.deleteUser(userId);

    expect(prisma.transaction.deleteMany).toHaveBeenCalledTimes(1);
    expect(prisma.account.deleteMany).toHaveBeenCalledTimes(1);
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: userId } });
  });
  it('4. Deve disparar erro caso o prisma falhe ao deletar', async () => {
    const userId = 999;
    (prisma.user.delete as jest.Mock).mockRejectedValue(new Error("Erro de banco de dados"));

    await expect(userService.deleteUser(userId)).rejects.toThrow("Erro de banco de dados");
  });
});