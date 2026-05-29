import { ReportService } from '../../src/services/ReportService';
import { prisma } from '../../src/prisma';

jest.mock('../../src/prisma', () => ({
  prisma: { transaction: { findMany: jest.fn() } },
}));

const prismaMock = prisma as unknown as { transaction: Record<string, jest.Mock> };

describe('Unitário: ReportService', () => {
  const service = new ReportService();
  beforeEach(() => jest.clearAllMocks());

  it('soma receitas e despesas e calcula o saldo (UC07)', async () => {
    prismaMock.transaction.findMany.mockResolvedValue([
      { type: 'INCOME', amount: 1000 },
      { type: 'EXPENSE', amount: 300 },
      { type: 'EXPENSE', amount: 200 },
    ]);
    const summary = await service.getSummary(7);
    expect(summary.totalIncome).toBe(1000);
    expect(summary.totalExpense).toBe(500);
    expect(summary.balance).toBe(500);
    expect(summary.count).toBe(3);
  });

  it('aplica filtro de período no where', async () => {
    prismaMock.transaction.findMany.mockResolvedValue([]);
    await service.getSummary(7, '2026-01-01', '2026-12-31');
    const arg = prismaMock.transaction.findMany.mock.calls[0][0];
    expect(arg.where.date.gte).toBeInstanceOf(Date);
    expect(arg.where.date.lte).toBeInstanceOf(Date);
  });

  it('marca vencidos em getUpcomingDue (UC19)', async () => {
    const ontem = new Date(Date.now() - 86400000);
    prismaMock.transaction.findMany.mockResolvedValue([{ id: 1, dueDate: ontem }]);
    const upcoming = await service.getUpcomingDue(7, 7);
    expect(upcoming[0].overdue).toBe(true);
  });
});
