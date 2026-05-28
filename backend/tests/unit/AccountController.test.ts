const mockCreateAccount = jest.fn();
const mockGetAccountsByUser = jest.fn();
const mockUpdateAccount = jest.fn();
const mockDeleteAccount = jest.fn();

jest.mock('../../src/services/AccountService', () => ({
  AccountService: jest.fn().mockImplementation(() => ({
    createAccount: mockCreateAccount,
    getAccountsByUser: mockGetAccountsByUser,
    updateAccount: mockUpdateAccount,
    deleteAccount: mockDeleteAccount,
  })),
}));

import { AccountController } from '../../src/controllers/AccountController';

const makeRes = () => {
  const res: any = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('Unitário: AccountController', () => {
  const controller = new AccountController();
  beforeEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('retorna 400 quando faltam nome/tipo', async () => {
      const res = makeRes();
      await controller.create({ user: { id: 7 }, body: { name: 'só nome' } } as any, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('cria a conta e retorna 201', async () => {
      mockCreateAccount.mockResolvedValue({ id: 1, name: 'Nubank' });
      const res = makeRes();
      await controller.create({ user: { id: 7 }, body: { name: 'Nubank', type: 'CORRENTE', balance: 0 } } as any, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(mockCreateAccount).toHaveBeenCalledWith(7, expect.objectContaining({ name: 'Nubank' }));
    });

    it('retorna 400 quando o service falha', async () => {
      mockCreateAccount.mockRejectedValue(new Error('falhou'));
      const res = makeRes();
      await controller.create({ user: { id: 7 }, body: { name: 'X', type: 'Y' } } as any, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('list', () => {
    it('retorna 200 com as contas do usuário', async () => {
      mockGetAccountsByUser.mockResolvedValue([{ id: 1 }]);
      const res = makeRes();
      await controller.list({ user: { id: 7 } } as any, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
    });
  });

  describe('update', () => {
    it('retorna 400 para id inválido', async () => {
      const res = makeRes();
      await controller.update({ user: { id: 7 }, params: { id: 'abc' }, body: {} } as any, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('atualiza e retorna 200', async () => {
      mockUpdateAccount.mockResolvedValue({ id: 3, name: 'Editado' });
      const res = makeRes();
      await controller.update({ user: { id: 7 }, params: { id: '3' }, body: { name: 'Editado' } } as any, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('delete', () => {
    it('retorna 400 para id inválido', async () => {
      const res = makeRes();
      await controller.delete({ user: { id: 7 }, params: { id: 'xyz' } } as any, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('exclui e retorna 200', async () => {
      mockDeleteAccount.mockResolvedValue({ id: 4 });
      const res = makeRes();
      await controller.delete({ user: { id: 7 }, params: { id: '4' } } as any, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('retorna 400 quando a exclusão é bloqueada', async () => {
      mockDeleteAccount.mockRejectedValue(new Error('Exclusão bloqueada'));
      const res = makeRes();
      await controller.delete({ user: { id: 7 }, params: { id: '4' } } as any, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
