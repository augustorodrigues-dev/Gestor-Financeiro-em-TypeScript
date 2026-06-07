import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { goalService } from '../services/goalService';
import { categoryService } from '../services/categoryService';
import { registerUser } from '../services/userService';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../services/transactionService';

const okJson = (body: any) => vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(body) });
const failJson = (body: any) => vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve(body) });

beforeEach(() => localStorage.setItem('token', 'fake-token'));
afterEach(() => vi.restoreAllMocks());

describe('goalService', () => {
  it('getGoals retorna a lista de metas', async () => {
    vi.stubGlobal('fetch', okJson([{ id: 1, name: 'Carro' }]));
    const res = await goalService.getGoals();
    expect(res).toHaveLength(1);
  });

  it('createGoal envia os dados e retorna a meta criada', async () => {
    const fetchMock = okJson({ id: 9, name: 'Viagem' });
    vi.stubGlobal('fetch', fetchMock);
    const res = await goalService.createGoal({ name: 'Viagem', targetAmount: 5000, deadline: '2026-12-31' });
    expect(res.id).toBe(9);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/goals'), expect.objectContaining({ method: 'POST' }));
  });

  it('addProgress faz PUT no endpoint da meta', async () => {
    const fetchMock = okJson({ id: 1, currentAmount: 2000 });
    vi.stubGlobal('fetch', fetchMock);
    await goalService.addProgress(1, 2000);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/goals/1'), expect.objectContaining({ method: 'PUT' }));
  });

  it('deleteGoal faz DELETE no endpoint da meta', async () => {
    const fetchMock = okJson({ message: 'cancelada com sucesso' });
    vi.stubGlobal('fetch', fetchMock);
    await goalService.deleteGoal(3);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/goals/3'), expect.objectContaining({ method: 'DELETE' }));
  });
});

describe('categoryService', () => {
  it('getCategories busca a lista', async () => {
    vi.stubGlobal('fetch', okJson([{ id: 1 }, { id: 2 }]));
    const res = await categoryService.getCategories();
    expect(res).toHaveLength(2);
  });

  it('createCategory envia POST com o corpo serializado', async () => {
    const fetchMock = okJson({ id: 1, name: 'Lazer' });
    vi.stubGlobal('fetch', fetchMock);
    await categoryService.createCategory({ name: 'Lazer', type: 'EXPENSE' });
    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ method: 'POST' }));
  });
});

describe('userService.registerUser', () => {
  it('retorna os dados em caso de sucesso', async () => {
    vi.stubGlobal('fetch', okJson({ token: 't', user: { id: 1, name: 'Caue' } }));
    const res = await registerUser({ name: 'Caue', email: 'c@x.com', password: '1234' });
    expect(res.user.id).toBe(1);
  });

  it('lança erro com a mensagem da API em caso de falha (ex.: e-mail duplicado)', async () => {
    vi.stubGlobal('fetch', failJson({ error: 'Este e-mail já está cadastrado no sistema.' }));
    await expect(registerUser({ name: 'X', email: 'dup@x.com', password: '1' }))
      .rejects.toThrow(/já está cadastrado/i);
  });
});

describe('transactionService', () => {
  it('getTransactions lança erro quando a resposta falha', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve({}) }));
    await expect(getTransactions()).rejects.toThrow(/Erro ao buscar/i);
  });

  it('createTransaction propaga a mensagem de erro da API', async () => {
    vi.stubGlobal('fetch', failJson({ error: 'Todos os campos obrigatórios devem ser preenchidos.' }));
    await expect(createTransaction({})).rejects.toThrow(/campos obrigat/i);
  });

  it('updateTransaction retorna a transação atualizada', async () => {
    vi.stubGlobal('fetch', okJson({ id: 1, amount: 240 }));
    const res = await updateTransaction(1, { amount: 240 });
    expect(Number(res.amount)).toBe(240);
  });

  it('deleteTransaction retorna a confirmação de remoção', async () => {
    vi.stubGlobal('fetch', okJson({ message: 'Transação removida com sucesso.' }));
    const res = await deleteTransaction(1);
    expect(res.message).toMatch(/removida/i);
  });
});
