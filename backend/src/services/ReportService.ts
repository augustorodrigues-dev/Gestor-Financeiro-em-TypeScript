import { prisma } from '../prisma';

export class ReportService {
  async getMonthlyReport(userId: number, month: number, year: number) {
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { account: { userId: userId } },
          { creditCard: { userId: userId } }
        ],
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true, 
      },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const expenseByCategory: Record<string, { name: string; amount: number; color: string }> = {};

    transactions.forEach(tx => {
      const amount = Number(tx.amount); 

      if (tx.type === 'INCOME') {
        totalIncome += amount;
      } else if (tx.type === 'EXPENSE') {
        totalExpense += amount;

        
        const catName = tx.category?.name || 'Sem Categoria';
        const catColor = tx.category?.color || '#9ca3af'; 

        if (!expenseByCategory[catName]) {
          expenseByCategory[catName] = { name: catName, amount: 0, color: catColor };
        }
        expenseByCategory[catName].amount += amount;
      }
    });

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