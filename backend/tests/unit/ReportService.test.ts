import { ReportService } from '../../src/services/ReportService';
import { prisma } from '../../src/prisma';

// Isolando o Prisma para testar apenas a regra de negócio do relatório[cite: 2, 5]
jest.mock('../../src/prisma', () => ({
  prisma: {
    transaction: {
      findMany: jest.fn(),
    },
  },
}));

describe('Testes Unitários: ReportService', () => {
  const reportService = new ReportService();

  beforeEach(() => {
    jest.clearAllMocks(); // Limpa o histórico de chamadas antes de cada teste[cite: 2, 5]
  });

  it('1. Deve retornar zerado se não houver nenhuma transação no mês', async () => {
    (prisma.transaction.findMany as jest.Mock).mockResolvedValue([]);

    const result = await reportService.getMonthlyReport(1, 6, 2026);

    expect(prisma.transaction.findMany).toHaveBeenCalledTimes(1);
    expect(result.summary.totalIncome).toBe(0);
    expect(result.summary.totalExpense).toBe(0);
    expect(result.summary.balance).toBe(0);
    expect(result.expenseByCategory).toHaveLength(0);
  });

  it('2. Deve somar receitas, despesas e calcular o saldo corretamente', async () => {
    // Simulando o retorno do banco de dados
    const mockTransactions = [
      { amount: 5000, type: 'INCOME' },
      { amount: 1500, type: 'EXPENSE', category: { name: 'Moradia', color: '#000' } },
      { amount: 500, type: 'EXPENSE', category: { name: 'Lazer', color: '#FFF' } }
    ];
    
    (prisma.transaction.findMany as jest.Mock).mockResolvedValue(mockTransactions);

    const result = await reportService.getMonthlyReport(1, 6, 2026);

    expect(result.summary.totalIncome).toBe(5000);
    expect(result.summary.totalExpense).toBe(2000);
    expect(result.summary.balance).toBe(3000); // 5000 - 2000
  });

  it('3. Deve agrupar e ordenar os gastos por categoria do maior para o menor', async () => {
    const mockTransactions = [
      { amount: 100, type: 'EXPENSE', category: { name: 'Lazer', color: '#F00' } },
      { amount: 300, type: 'EXPENSE', category: { name: 'Alimentação', color: '#0F0' } },
      { amount: 50, type: 'EXPENSE', category: { name: 'Lazer', color: '#F00' } }
    ];

    (prisma.transaction.findMany as jest.Mock).mockResolvedValue(mockTransactions);

    const result = await reportService.getMonthlyReport(1, 6, 2026);

    // Lazer total: 150. Alimentação total: 300.
    expect(result.expenseByCategory).toHaveLength(2);
    // Verifica a ordenação (o de 300 deve vir antes do de 150)
    expect(result.expenseByCategory[0].name).toBe('Alimentação');
    expect(result.expenseByCategory[0].amount).toBe(300);
    expect(result.expenseByCategory[1].name).toBe('Lazer');
    expect(result.expenseByCategory[1].amount).toBe(150);
  });
});