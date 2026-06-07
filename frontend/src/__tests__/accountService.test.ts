import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { accountService } from '../services/accountService';

describe('accountService.getBanks (filtro da Brasil API)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('mantém apenas instituições cujo código está na lista permitida (BANCOS)', async () => {
    const apiResponse = [
      { code: 1, name: 'Banco do Brasil' },    // permitido
      { code: 260, name: 'Nubank' },           // permitido
      { code: 99999, name: 'Banco Fantasma' }, // NÃO permitido
    ];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: () => Promise.resolve(apiResponse) }));

    const result = await accountService.getBanks();

    expect(result).toHaveLength(2);
    expect(result.map((b: any) => b.code)).toEqual([1, 260]);
  });

  it('retorna lista vazia quando a resposta da API não é um array', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: () => Promise.resolve({ erro: 'indisponivel' }) }));

    const result = await accountService.getBanks();

    expect(result).toEqual([]);
  });
});

describe('accountService.createAccount', () => {
  beforeEach(() => localStorage.setItem('token', 'fake-token'));
  afterEach(() => vi.restoreAllMocks());

  it('lança erro com a mensagem da API quando a resposta falha', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Nome e tipo da conta são obrigatórios.' }),
    }));

    await expect(
      accountService.createAccount({ name: '', type: '', balance: 0, userId: 1 }),
    ).rejects.toThrow('Nome e tipo da conta são obrigatórios.');
  });

  it('retorna os dados da conta quando criada com sucesso', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 5, name: 'Banco Inter' }),
    }));

    const res = await accountService.createAccount({ name: 'Banco Inter', type: 'CORRENTE', balance: 0, userId: 1 });

    expect(res.id).toBe(5);
  });
});
