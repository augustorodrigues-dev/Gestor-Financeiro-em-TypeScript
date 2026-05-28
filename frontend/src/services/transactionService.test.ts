import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from './transactionService';

const okJson = (data: any) => ({ ok: true, json: async () => data });
const errJson = (data: any) => ({ ok: false, json: async () => data });

describe('transactionService', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-token');
    vi.restoreAllMocks();
  });

  it('getTransactions lista as transações quando ok', async () => {
    global.fetch = vi.fn().mockResolvedValue(okJson([{ id: 1 }])) as any;
    expect(await getTransactions()).toEqual([{ id: 1 }]);
  });

  it('getTransactions lança erro quando não ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false }) as any;
    await expect(getTransactions()).rejects.toThrow('Erro ao buscar transações.');
  });

  it('createTransaction faz POST autenticado', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okJson({ id: 5 }));
    global.fetch = fetchMock as any;
    const res = await createTransaction({ description: 'X', amount: 10, type: 'EXPENSE', accountId: 1, date: '2026-05-20' });
    expect(res).toEqual({ id: 5 });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/transactions',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('createTransaction propaga o erro do backend', async () => {
    global.fetch = vi.fn().mockResolvedValue(errJson({ error: 'inválido' })) as any;
    await expect(createTransaction({})).rejects.toThrow('inválido');
  });

  it('updateTransaction faz PUT no id correto', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okJson({ id: 7 }));
    global.fetch = fetchMock as any;
    await updateTransaction(7, { amount: 99 });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/transactions/7',
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('updateTransaction lança erro quando não ok', async () => {
    global.fetch = vi.fn().mockResolvedValue(errJson({ error: 'falhou' })) as any;
    await expect(updateTransaction(1, {})).rejects.toThrow('falhou');
  });

  it('deleteTransaction faz DELETE no id correto', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okJson({ message: 'ok' }));
    global.fetch = fetchMock as any;
    await deleteTransaction(3);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/transactions/3',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('deleteTransaction lança erro quando não ok', async () => {
    global.fetch = vi.fn().mockResolvedValue(errJson({ error: 'erro' })) as any;
    await expect(deleteTransaction(3)).rejects.toThrow('erro');
  });
});
