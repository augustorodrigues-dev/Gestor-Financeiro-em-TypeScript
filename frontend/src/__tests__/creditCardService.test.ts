import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { creditCardService } from '../services/creditCardService';

describe('creditCardService', () => {
  beforeEach(() => localStorage.setItem('token', 'fake-token'));
  afterEach(() => vi.restoreAllMocks());

  it('createCard: lança erro com a mensagem da API em caso de falha', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Todos os campos são obrigatórios.' }),
    }));

    await expect(creditCardService.createCard({ name: 'X' })).rejects.toThrow('Todos os campos são obrigatórios.');
  });

  it('createCard: retorna o cartão criado em caso de sucesso', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 10, name: 'Nubank' }),
    }));

    const res = await creditCardService.createCard({ name: 'Nubank', limitAmount: 5000, closingDay: 5, dueDay: 10 });

    expect(res.id).toBe(10);
  });

  it('deleteCard: propaga a trava de negócio do servidor (fatura ativa)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Não é possível excluir um cartão com faturas pendentes ou histórico ativo.' }),
    }));

    await expect(creditCardService.deleteCard(1)).rejects.toThrow(/faturas pendentes/i);
  });
});
