import { describe, it, expect, beforeEach, vi } from 'vitest';
import { categoryService } from './categoryService';
import { creditCardService } from './creditCardService';
import { goalService } from './goalService';
import { getReportSummary, getUpcomingAlerts, getExchange } from './financeService';
import { updateProfile, forgotPassword, resetPassword } from './userService';

const ok = (data: any) => ({ ok: true, json: async () => data });
const err = (data: any) => ({ ok: false, json: async () => data });

beforeEach(() => {
  localStorage.setItem('token', 'fake');
  vi.restoreAllMocks();
});

describe('categoryService', () => {
  it('getCategories lista', async () => {
    global.fetch = vi.fn().mockResolvedValue(ok([{ id: 1 }])) as any;
    expect(await categoryService.getCategories()).toHaveLength(1);
  });
  it('createCategory propaga erro', async () => {
    global.fetch = vi.fn().mockResolvedValue(err({ error: 'x' })) as any;
    await expect(categoryService.createCategory({ name: 'a', type: 'EXPENSE' })).rejects.toThrow('x');
  });
  it('deleteCategory faz DELETE', async () => {
    const f = vi.fn().mockResolvedValue(ok({ message: 'ok' }));
    global.fetch = f as any;
    await categoryService.deleteCategory(5);
    expect(f).toHaveBeenCalledWith('http://localhost:3001/api/categories/5', expect.objectContaining({ method: 'DELETE' }));
  });
  it('updateCategory faz PUT', async () => {
    const f = vi.fn().mockResolvedValue(ok({ id: 1 }));
    global.fetch = f as any;
    await categoryService.updateCategory(1, { name: 'b' });
    expect(f).toHaveBeenCalledWith('http://localhost:3001/api/categories/1', expect.objectContaining({ method: 'PUT' }));
  });
});

describe('creditCardService', () => {
  it('getCards lista', async () => {
    global.fetch = vi.fn().mockResolvedValue(ok([{ id: 1 }])) as any;
    expect(await creditCardService.getCards()).toHaveLength(1);
  });
  it('createCard POST', async () => {
    const f = vi.fn().mockResolvedValue(ok({ id: 1 }));
    global.fetch = f as any;
    await creditCardService.createCard({ name: 'V', limitAmount: 100, closingDay: 1, dueDay: 8 });
    expect(f).toHaveBeenCalledWith('http://localhost:3001/api/cards', expect.objectContaining({ method: 'POST' }));
  });
  it('deleteCard erro', async () => {
    global.fetch = vi.fn().mockResolvedValue(err({ error: 'no' })) as any;
    await expect(creditCardService.deleteCard(1)).rejects.toThrow('no');
  });
  it('updateCard PUT', async () => {
    const f = vi.fn().mockResolvedValue(ok({ id: 1 }));
    global.fetch = f as any;
    await creditCardService.updateCard(1, { name: 'z' });
    expect(f).toHaveBeenCalled();
  });
});

describe('goalService', () => {
  it('getGoals lista', async () => {
    global.fetch = vi.fn().mockResolvedValue(ok([{ id: 1 }])) as any;
    expect(await goalService.getGoals()).toHaveLength(1);
  });
  it('createGoal POST', async () => {
    const f = vi.fn().mockResolvedValue(ok({ id: 1 }));
    global.fetch = f as any;
    await goalService.createGoal({ name: 'M', targetAmount: 100, deadline: '2026-01-01' });
    expect(f).toHaveBeenCalled();
  });
  it('updateGoal PUT', async () => {
    const f = vi.fn().mockResolvedValue(ok({ id: 1 }));
    global.fetch = f as any;
    await goalService.updateGoal(1, { currentAmount: 50 });
    expect(f).toHaveBeenCalledWith('http://localhost:3001/api/goals/1', expect.objectContaining({ method: 'PUT' }));
  });
  it('deleteGoal erro', async () => {
    global.fetch = vi.fn().mockResolvedValue(err({ error: 'no' })) as any;
    await expect(goalService.deleteGoal(1)).rejects.toThrow('no');
  });
});

describe('financeService', () => {
  it('getReportSummary monta querystring', async () => {
    const f = vi.fn().mockResolvedValue(ok({ totalIncome: 1 }));
    global.fetch = f as any;
    await getReportSummary('2026-01-01', '2026-12-31');
    expect(f.mock.calls[0][0]).toContain('startDate=2026-01-01');
  });
  it('getUpcomingAlerts', async () => {
    global.fetch = vi.fn().mockResolvedValue(ok([{ id: 1 }])) as any;
    expect(await getUpcomingAlerts(7)).toHaveLength(1);
  });
  it('getExchange', async () => {
    global.fetch = vi.fn().mockResolvedValue(ok({ converted: 50 })) as any;
    expect((await getExchange('USD', 'BRL', 10)).converted).toBe(50);
  });
  it('getExchange erro', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false }) as any;
    await expect(getExchange('USD', 'BRL', 1)).rejects.toThrow('indisponível');
  });
});

describe('userService (perfil + senha)', () => {
  it('updateProfile PUT autenticado', async () => {
    const f = vi.fn().mockResolvedValue(ok({ user: { name: 'X' } }));
    global.fetch = f as any;
    await updateProfile({ name: 'X' });
    expect(f).toHaveBeenCalledWith('http://localhost:3001/api/users/profile', expect.objectContaining({ method: 'PUT' }));
  });
  it('forgotPassword POST', async () => {
    const f = vi.fn().mockResolvedValue(ok({ message: 'ok', resetToken: 't' }));
    global.fetch = f as any;
    expect((await forgotPassword('a@x.com')).resetToken).toBe('t');
  });
  it('resetPassword erro', async () => {
    global.fetch = vi.fn().mockResolvedValue(err({ error: 'inválido' })) as any;
    await expect(resetPassword('t', 'p')).rejects.toThrow('inválido');
  });
});
