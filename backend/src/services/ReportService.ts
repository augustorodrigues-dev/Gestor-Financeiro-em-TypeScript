import { prisma } from '../prisma';

type ClienteRelatorio = Pick<typeof prisma, 'category' | '$queryRaw'>;

interface GrupoSql {
  categoryId: number | bigint | null;
  type: string;
  soma: string | null;
  primeiraLinha: number | bigint;
}

export class ReportService {
  async getMonthlyReport(userId: number, month: number, year: number, db: ClienteRelatorio = prisma) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const grupos = await db.$queryRaw<GrupoSql[]>`
      SELECT t.category_id AS categoryId,
             t.type AS type,
             CAST(SUM(t.amount) AS TEXT) AS soma,
             MIN(t.transaction_id) AS primeiraLinha
      FROM transacao t
      WHERE t.date >= ${startDate}
        AND t.date <= ${endDate}
        AND (
          t.account_id IN (SELECT account_id FROM conta WHERE user_id = ${userId})
          OR t.creditcard_id IN (SELECT creditcard_id FROM cartaocredito WHERE user_id = ${userId})
        )
      GROUP BY t.category_id, t.type
    `;

    const idsCategorias = new Set<number>();
    for (const grupo of grupos) {
      if (grupo.categoryId !== null) {
        idsCategorias.add(Number(grupo.categoryId));
      }
    }

    const categorias = idsCategorias.size > 0
      ? await db.category.findMany({
          where: { id: { in: [...idsCategorias] } },
          select: { id: true, name: true, color: true },
        })
      : [];

    const categoriaPorId = new Map(categorias.map(categoria => [categoria.id, categoria]));

    let totalIncome = 0;
    let totalExpense = 0;
    const despesas: { categoryId: number | null; amount: number; primeiraLinha: number }[] = [];

    for (const grupo of grupos) {
      const amount = Number(grupo.soma ?? 0);

      if (grupo.type === 'INCOME') {
        totalIncome += amount;
      } else if (grupo.type === 'EXPENSE') {
        totalExpense += amount;
        despesas.push({
          categoryId: grupo.categoryId === null ? null : Number(grupo.categoryId),
          amount,
          primeiraLinha: Number(grupo.primeiraLinha),
        });
      }
    }

    despesas.sort((a, b) => a.primeiraLinha - b.primeiraLinha);

    const expenseByCategory: Record<string, { name: string; amount: number; color: string }> = {};

    for (const { categoryId, amount } of despesas) {
      const categoria = categoryId === null ? undefined : categoriaPorId.get(categoryId);
      const catName = categoria?.name || 'Sem Categoria';
      const catColor = categoria?.color || '#9ca3af';

      if (!expenseByCategory[catName]) {
        expenseByCategory[catName] = { name: catName, amount: 0, color: catColor };
      }
      expenseByCategory[catName].amount += amount;
    }

    return {
      period: { month, year },
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
      },
      expenseByCategory: Object.values(expenseByCategory).sort((a, b) => b.amount - a.amount),
    };
  }
}
