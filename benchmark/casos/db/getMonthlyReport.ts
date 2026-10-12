import { ReportService } from '../../../backend/src/services/ReportService';
import { compararAproximado } from '../../lib/comparar';
import { aceitaClienteInjetado } from '../../lib/descoberta';
import { criarConta, criarUsuario, inserirEmLotes, limparTudo, valorEmCentavos } from '../../lib/seed';
import type { CasoDb, ContextoDb, Verificacao } from '../../lib/tiposDb';

const getMonthlyReportLegado = async (db: any, userId: number, month: number, year: number) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const transactions = await db.transaction.findMany({
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

  transactions.forEach((tx: any) => {
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
};

const MES = 3;
const ANO = 2026;

function cor(i: number): string {
  return `#${((i * 2654435761) >>> 0).toString(16).padStart(8, '0').slice(0, 6)}`;
}

async function semear(prisma: any, totalCategorias: number, totalTransacoes: number) {
  await limparTudo(prisma);
  const usuario = await criarUsuario(prisma);
  const conta = await criarConta(prisma, usuario.id);
  const cartao = await prisma.creditCard.create({
    data: { name: 'Cartao', limitAmount: 5000, closingDay: 25, dueDay: 5, userId: usuario.id }
  });

  await prisma.category.createMany({
    data: Array.from({ length: totalCategorias }, (_, i) => ({
      name: `Categoria ${i + 1}`,
      type: 'EXPENSE',
      color: cor(i),
      userId: usuario.id
    }))
  });

  const categorias = await prisma.category.findMany({
    where: { userId: usuario.id },
    select: { id: true },
    orderBy: { id: 'asc' }
  });

  const transacoes = Array.from({ length: totalTransacoes }, (_, i) => ({
    amount: valorEmCentavos(i),
    date: i % 10 === 0 ? new Date(ANO, MES, 10) : new Date(ANO, MES - 1, 1 + (i % 28)),
    description: `Mov ${i + 1}`,
    type: i % 5 === 0 ? 'INCOME' : 'EXPENSE',
    accountId: conta.id,
    creditCardId: i % 2 === 0 ? null : cartao.id,
    categoryId: i % 17 === 0 ? null : categorias[(i * 7919) % categorias.length].id
  }));

  await inserirEmLotes(transacoes, lote => prisma.transaction.createMany({ data: lote }));

  return usuario.id as number;
}

export const casos: CasoDb[] = (['k_fixo', 'k_proporcional'] as const).map(cenario => ({
  funcao: 'getMonthlyReport',
  cenario,
  preparar: async (n, { prisma, cliente }) => {
    const totalCategorias = cenario === 'k_fixo' ? 20 : Math.ceil(n / 10);
    const userId = await semear(prisma, totalCategorias, n);
    const servico = new ReportService();
    return {
      antes: () => getMonthlyReportLegado(cliente, userId, MES, ANO),
      depois: () => servico.getMonthlyReport(userId, MES, ANO, cliente)
    };
  }
}));

export const verificacoes: Verificacao[] = [
  {
    nome: 'getMonthlyReport: nomes repetidos, sem categoria, empates, outro mes e outro usuario',
    executar: async ({ prisma, cliente }: ContextoDb) => {
      await limparTudo(prisma);
      const usuario = await criarUsuario(prisma);
      const outro = await criarUsuario(prisma, 'outro@bench.local');
      const conta = await criarConta(prisma, usuario.id);
      const contaOutro = await criarConta(prisma, outro.id, 'Outra');

      const criarCategoria = (name: string, color: string | null) =>
        prisma.category.create({ data: { name, type: 'EXPENSE', color, userId: usuario.id } });

      const mercadoA = await criarCategoria('Mercado', '#111111');
      const mercadoB = await criarCategoria('Mercado', '#222222');
      const lazer = await criarCategoria('Lazer', '#333333');
      const rotulo = await criarCategoria('Sem Categoria', '#444444');
      const empateA = await criarCategoria('EmpateA', null);
      const empateB = await criarCategoria('EmpateB', '#555555');

      const linhas: { amount: number; type: string; categoryId: number | null; date?: Date; accountId?: number }[] = [
        { amount: 10.1, type: 'EXPENSE', categoryId: mercadoB.id },
        { amount: 20.2, type: 'EXPENSE', categoryId: mercadoA.id },
        { amount: 15, type: 'EXPENSE', categoryId: lazer.id },
        { amount: 15, type: 'EXPENSE', categoryId: null },
        { amount: 5, type: 'EXPENSE', categoryId: rotulo.id },
        { amount: 7.77, type: 'EXPENSE', categoryId: empateA.id },
        { amount: 7.77, type: 'EXPENSE', categoryId: empateB.id },
        { amount: 100, type: 'INCOME', categoryId: mercadoA.id },
        { amount: 50.5, type: 'INCOME', categoryId: null },
        { amount: 999, type: 'EXPENSE', categoryId: lazer.id, date: new Date(ANO, MES, 5) },
        { amount: 888, type: 'EXPENSE', categoryId: lazer.id, accountId: contaOutro.id }
      ];

      await prisma.transaction.createMany({
        data: linhas.map((linha, i) => ({
          amount: linha.amount,
          type: linha.type,
          categoryId: linha.categoryId,
          date: linha.date ?? new Date(ANO, MES - 1, 10 + i),
          description: `v${i}`,
          accountId: linha.accountId ?? conta.id
        }))
      });

      const servico = new ReportService();
      const esperado = await getMonthlyReportLegado(cliente, usuario.id, MES, ANO);
      const obtido = await servico.getMonthlyReport(usuario.id, MES, ANO, cliente);
      compararAproximado(esperado, obtido, 1e-9);

      const vazio = await getMonthlyReportLegado(cliente, usuario.id, 1, 2000);
      const vazioNovo = await servico.getMonthlyReport(usuario.id, 1, 2000, cliente);
      compararAproximado(vazio, vazioNovo, 1e-9);
    }
  }
];

export const disponivel = () => aceitaClienteInjetado(db => new ReportService().getMonthlyReport(-1, MES, ANO, db));
