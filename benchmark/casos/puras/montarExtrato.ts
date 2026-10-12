import { montarExtrato } from '../../../frontend/src/utils/extrato';
import type { CasoPuro } from '../../lib/tipos';

const extratoLegado = (transactions: any[], categories: any[], accounts: any[]) =>
  transactions.map(tx => {
    const categoria = categories.find(c => c.id === tx.categoryId);
    return {
      tx,
      categoria,
      nomeConta: accounts.find(a => a.id === tx.accountId)?.name || 'Conta'
    };
  });

function gerar(n: number, cenario: 'melhor' | 'pior') {
  const categories = Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: `Categoria ${i + 1}`,
    color: '#3b82f6'
  }));

  const accounts = Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: `Conta ${i + 1}`
  }));

  const transactions = Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    description: `Transacao ${i + 1}`,
    amount: (i % 1000) + 0.5,
    type: i % 2 === 0 ? 'INCOME' : 'EXPENSE',
    date: new Date(2026, 0, 1 + (i % 28)),
    categoryId: cenario === 'pior' ? null : 1,
    accountId: cenario === 'pior' ? n : 1
  }));

  return { transactions, categories, accounts };
}

export const casos: CasoPuro[] = (['melhor', 'pior'] as const).map(cenario => ({
  funcao: 'montarExtrato',
  cenario,
  instanciar: n => {
    const { transactions, categories, accounts } = gerar(n, cenario);
    return {
      antes: () => extratoLegado(transactions, categories, accounts),
      depois: () => montarExtrato(transactions, categories, accounts)
    };
  }
}));
