import { describe, it, expect, beforeEach, vi } from 'vitest';
import { accountService } from './accountService';

const okJson = (data: any) => ({ ok: true, json: async () => data });
const errJson = (data: any) => ({ ok: false, json: async () => data });

describe('accountService', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-token');
    vi.restoreAllMocks();
  });

  it('getBanks busca a lista da Brasil API', async () => {
    global.fetch = vi.fn().mockResolvedValue(okJson([{ code: 1, name: 'Banco X' }])) as any;
    const banks = await accountService.getBanks();
    expect(global.fetch).toHaveBeenCalledWith('https://brasilapi.com.br/api/banks/v1');
    expect(banks).toEqual([{ code: 1, name: 'Banco X' }]);
  });

  it('createAccount faz POST autenticado e retorna a conta criada', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okJson({ id: 10, name: 'Nubank' }));
    global.fetch = fetchMock as any;

    const res = await accountService.createAccount({ name: 'Nubank', type: 'CORRENTE', balance: 0, userId: 1 });

    expect(res).toEqual({ id: 10, name: 'Nubank' });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/accounts',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer fake-token' }),
      })
    );
  });

  it('createAccount lança o erro retornado pelo backend', async () => {
    global.fetch = vi.fn().mockResolvedValue(errJson({ error: 'Falha ao criar' })) as any;
    await expect(
      accountService.createAccount({ name: 'X', type: 'Y', balance: 0, userId: 1 })
    ).rejects.toThrow('Falha ao criar');
  });

  it('getUserAccounts retorna a lista quando ok', async () => {
    global.fetch = vi.fn().mockResolvedValue(okJson([{ id: 1 }, { id: 2 }])) as any;
    const accounts = await accountService.getUserAccounts();
    expect(accounts).toHaveLength(2);
  });

  it('getUserAccounts lança erro quando a resposta não é ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false }) as any;
    await expect(accountService.getUserAccounts()).rejects.toThrow('Erro ao buscar contas');
  });

  it('deleteAccount retorna a resposta quando ok', async () => {
    global.fetch = vi.fn().mockResolvedValue(okJson({ message: 'Conta excluída' })) as any;
    expect(await accountService.deleteAccount(1)).toEqual({ message: 'Conta excluída' });
  });

  it('deleteAccount propaga o erro de regra de negócio', async () => {
    global.fetch = vi.fn().mockResolvedValue(errJson({ error: 'Exclusão bloqueada' })) as any;
    await expect(accountService.deleteAccount(1)).rejects.toThrow('Exclusão bloqueada');
  });
});
