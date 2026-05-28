import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const mockGetUserByEmail = jest.fn();
const mockCreateUser = jest.fn();
const mockGetAllUsers = jest.fn();
const mockUpdateUser = jest.fn();
const mockDeleteUser = jest.fn();

jest.mock('../../src/services/UserService', () => ({
  UserService: jest.fn().mockImplementation(() => ({
    getUserByEmail: mockGetUserByEmail,
    createUser: mockCreateUser,
    getAllUsers: mockGetAllUsers,
    updateUser: mockUpdateUser,
    deleteUser: mockDeleteUser,
  })),
}));

jest.mock('jsonwebtoken', () => ({ sign: jest.fn(() => 'fake.jwt.token') }));
jest.mock('bcrypt', () => ({ compare: jest.fn() }));

import { UserController } from '../../src/controllers/UserController';

const makeRes = () => {
  const res: any = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('Unitário: UserController', () => {
  const controller = new UserController();
  beforeEach(() => jest.clearAllMocks());

  describe('login (UC01)', () => {
    it('retorna 400 quando faltam credenciais', async () => {
      const res = makeRes();
      await controller.login({ body: {} } as any, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 401 quando o usuário não existe', async () => {
      mockGetUserByEmail.mockResolvedValue(null);
      const res = makeRes();
      await controller.login({ body: { email: 'x@x.com', password: '1' } } as any, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('retorna 401 quando a senha não confere', async () => {
      mockGetUserByEmail.mockResolvedValue({ id: 1, passwordHash: 'h', role: 'USER' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const res = makeRes();
      await controller.login({ body: { email: 'x@x.com', password: 'errada' } } as any, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('retorna token e usuário em caso de sucesso', async () => {
      mockGetUserByEmail.mockResolvedValue({ id: 1, name: 'Ana', passwordHash: 'h', role: 'USER' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const res = makeRes();
      await controller.login({ body: { email: 'ana@x.com', password: '1234' } } as any, res);
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ token: 'fake.jwt.token', user: expect.objectContaining({ id: 1 }) })
      );
    });

    it('retorna 500 em erro interno', async () => {
      mockGetUserByEmail.mockRejectedValue(new Error('db down'));
      const res = makeRes();
      await controller.login({ body: { email: 'a', password: 'b' } } as any, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('create (UC02)', () => {
    it('retorna 400 quando faltam campos', async () => {
      const res = makeRes();
      await controller.create({ body: { name: 'só nome' } } as any, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('cria e retorna 201 com token', async () => {
      mockCreateUser.mockResolvedValue({ id: 5, name: 'Novo', role: 'USER' });
      const res = makeRes();
      await controller.create({ body: { name: 'Novo', email: 'n@x.com', password: '1234' } } as any, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'fake.jwt.token' }));
    });

    it('retorna 400 para e-mail duplicado', async () => {
      mockCreateUser.mockRejectedValue(new Error('Este e-mail já está cadastrado no sistema.'));
      const res = makeRes();
      await controller.create({ body: { name: 'Dup', email: 'd@x.com', password: '1' } } as any, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 500 para erro genérico', async () => {
      mockCreateUser.mockRejectedValue(new Error('boom'));
      const res = makeRes();
      await controller.create({ body: { name: 'A', email: 'a@x.com', password: '1' } } as any, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('listAll / update / delete', () => {
    it('lista usuários', async () => {
      mockGetAllUsers.mockResolvedValue([{ id: 1 }]);
      const res = makeRes();
      await controller.listAll({} as any, res);
      expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
    });

    it('retorna 500 ao falhar a listagem', async () => {
      mockGetAllUsers.mockRejectedValue(new Error('x'));
      const res = makeRes();
      await controller.listAll({} as any, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('retorna 400 ao atualizar sem nome/role', async () => {
      const res = makeRes();
      await controller.update({ params: { id: '1' }, body: {} } as any, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('atualiza usuário com sucesso', async () => {
      mockUpdateUser.mockResolvedValue({ id: 1, name: 'X', role: 'ADMIN' });
      const res = makeRes();
      await controller.update({ params: { id: '1' }, body: { name: 'X', role: 'ADMIN' } } as any, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
    });

    it('exclui usuário com sucesso', async () => {
      mockDeleteUser.mockResolvedValue({ id: 1 });
      const res = makeRes();
      await controller.delete({ params: { id: '1' } } as any, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
    });

    it('retorna 500 ao falhar exclusão', async () => {
      mockDeleteUser.mockRejectedValue(new Error('x'));
      const res = makeRes();
      await controller.delete({ params: { id: '1' } } as any, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
