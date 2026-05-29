import { prisma } from '../prisma';

export class ReportService {
  /**
   * UC07 — Relatório financeiro consolidado do usuário.
   * Soma receitas/despesas e agrupa por tipo, com filtro opcional de período.
   */
  async getSummary(userId: number, startDate?: string, endDate?: string) {
    const where: any = { account: { userId } };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: { account: { select: { name: true } } },
      orderBy: { date: 'desc' },
    });

    let income = 0;
    let expense = 0;
    for (const t of transactions) {
      if (t.type === 'INCOME') income += Number(t.amount);
      else expense += Number(t.amount);
    }

    return {
      totalIncome: Number(income.toFixed(2)),
      totalExpense: Number(expense.toFixed(2)),
      balance: Number((income - expense).toFixed(2)),
      count: transactions.length,
      transactions,
    };
  }

  /**
   * UC19 — Contas/lançamentos próximos ao vencimento (dueDate dentro de N dias).
   */
  async getUpcomingDue(userId: number, days = 7) {
    const now = new Date();
    const limit = new Date();
    limit.setDate(now.getDate() + days);

    const upcoming = await prisma.transaction.findMany({
      where: {
        account: { userId },
        dueDate: { not: null, lte: limit },
      },
      orderBy: { dueDate: 'asc' },
    });

    return upcoming.map((t) => ({
      ...t,
      overdue: t.dueDate ? new Date(t.dueDate) < now : false,
    }));
  }
}
