import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { accountService } from '../services/accountService';
import { creditCardService } from '../services/creditCardService';
import { categoryService } from '../services/categoryService';
import { registerUser } from '../services/userService';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../services/transactionService';

const ok = (body: any) => vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(body) });
const fail = (body: any) => vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve(body) });
const failNoBody = () => vi.fn().mockResolvedValue({ ok: false });

beforeEach(() => localStorage.setItem('token', 'fake-token'));
afterEach(() => vi.restoreAllMocks());

describe('accountService — caminhos de sucesso e erro restantes', () => {
  it('getUserAccounts retorna as contas em caso de sucesso', async () => {
    vi.stubGlobal('fetch', ok([{ id: 1 }, { id: 2 }]));
    expect(await accountService.getUserAccounts()).toHaveLength(2);
  });

  it('getUserAccounts lança erro quando a resposta falha', async () => {
    vi.stubGlobal('fetch', failNoBody());
    await expect(accountService.getUserAccounts()).rejects.toThrow(/Erro ao buscar contas/i);
  });

  it('deleteAccount retorna confirmação em caso de sucesso', async () => {
    vi.stubGlobal('fetch', ok({ message: 'Conta excluída com sucesso.' }));
    const res = await accountService.deleteAccount(1);
    expect(res.message).toMatch(/excluída/i);
  });

  it('deleteAccount propaga a trava do servidor (conta com transações)', async () => {
    vi.stubGlobal('fetch', fail({ error: 'Exclusão bloqueada: Esta conta possui transações vinculadas.' }));
    await expect(accountService.deleteAccount(1)).rejects.toThrow(/Exclusão bloqueada/i);
  });
});

describe('creditCardService — caminhos de sucesso e erro restantes', () => {
  it('getCards retorna a lista em caso de sucesso', async () => {
    vi.stubGlobal('fetch', ok([{ id: 1 }]));
    expect(await creditCardService.getCards()).toHaveLength(1);
  });

  it('getCards lança erro quando a resposta falha', async () => {
    vi.stubGlobal('fetch', failNoBody());
    await expect(creditCardService.getCards()).rejects.toThrow(/Erro ao buscar cartões/i);
  });

  it('updateCard retorna o cartão atualizado em caso de sucesso', async () => {
    vi.stubGlobal('fetch', ok({ id: 1, name: 'Atualizado' }));
    const res = await creditCardService.updateCard(1, { name: 'Atualizado' });
    expect(res.name).toBe('Atualizado');
  });

  it('updateCard lança erro quando a resposta falha', async () => {
    vi.stubGlobal('fetch', fail({ error: 'Erro ao atualizar cartão' }));
    await expect(creditCardService.updateCard(1, {})).rejects.toThrow(/atualizar cartão/i);
  });

  it('deleteCard retorna confirmação em caso de sucesso', async () => {
    vi.stubGlobal('fetch', ok({ message: 'Cartão removido com sucesso.' }));
    const res = await creditCardService.deleteCard(2);
    expect(res.message).toMatch(/removido/i);
  });
});

describe('transactionService — caminhos de sucesso e erro restantes', () => {
  it('getTransactions retorna a lista em caso de sucesso', async () => {
    vi.stubGlobal('fetch', ok([{ id: 1 }]));
    expect(await getTransactions()).toHaveLength(1);
  });

  it('createTransaction retorna a transação criada em caso de sucesso', async () => {
    vi.stubGlobal('fetch', ok({ id: 9, amount: 100 }));
    expect((await createTransaction({})).id).toBe(9);
  });

  it('updateTransaction lança erro quando a resposta falha', async () => {
    vi.stubGlobal('fetch', fail({ error: 'Erro ao atualizar transação.' }));
    await expect(updateTransaction(1, {})).rejects.toThrow(/atualizar transação/i);
  });

  it('deleteTransaction lança erro quando a resposta falha', async () => {
    vi.stubGlobal('fetch', fail({ error: 'Erro ao excluir transação.' }));
    await expect(deleteTransaction(1)).rejects.toThrow(/excluir transação/i);
  });
});

describe('categoryService.deleteCategory', () => {
  it('faz a requisição DELETE no endpoint da categoria', async () => {
    const fetchMock = ok({});
    vi.stubGlobal('fetch', fetchMock);
    await categoryService.deleteCategory(5);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/categories/5'),
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});

describe('userService.registerUser — mensagem de erro padrão', () => {
  it('usa a mensagem padrão quando a API falha sem o campo "error"', async () => {
    vi.stubGlobal('fetch', fail({}));
    await expect(registerUser({ name: 'X', email: 'x@x.com', password: '1' }))
      .rejects.toThrow('Erro ao realizar o cadastro.');
  });
});
